# Procurement Notices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the Procurement department post tender/bid notices (Invitation for Bids, RFQ, RFP, EOI) to a public `/procurement` page and a homepage teaser, via a dedicated, role-restricted `procurement` staff account that can see and touch nothing else in the admin.

**Architecture:** Follows this codebase's existing five-layer content-type pattern exactly (`types.ts` → `client.ts` demo/HTTP adapters → D1 schema → Pages Functions API router → admin section component), plus a new server-enforced role restriction (not just hidden nav) and a public listing page + homepage teaser mirroring the existing `PortalUpdatesTeaser` pattern. The existing fake placeholder "Tenders" directory is retired in the same change so the site doesn't end up with two tender-ish sections.

**Tech Stack:** Next.js 16 (static export) + React 19, Tailwind v4 + shadcn, Cloudflare Pages Functions (Workers runtime) + D1, bun.

## Global Constraints

- Package manager is **bun** — never npm/pnpm install in this repo.
- Path alias `@/` → `src/`.
- This codebase has **no unit test runner** — its only test layer is the Playwright e2e smoke suite (`tests/e2e/portal-smoke.spec.ts`) plus `bun run build` (typecheck via `tsc` happens as part of Next's build) and `bun run lint`. Every task's "test" step means: extend/run that e2e suite where the task adds user-facing behavior, and always run `bun run build` + `bun run lint` clean. Do not invent a unit-test framework for this change — follow the codebase's existing convention.
- Every new mutable content type touches exactly five places (this codebase's own documented rule): `types.ts`, `client.ts` (both adapters), D1 schema, the API router, an admin section component. Keep all five in sync — this plan's Tasks 1–3 are exactly that.
- Never commit secrets. The Cloudflare D1/Pages project for this repo lives in the **client's** own Cloudflare account (not KareTech's) — CI deploys there using `vars.CLOUDFLARE_ACCOUNT_ID` + `secrets.CLOUDFLARE_API_TOKEN`, which already exist as GitHub repo secrets from the 2026-07-09 handover. Don't touch those values, only reference them by name in the workflow YAML.
- Data URLs (base64) are the storage mechanism for uploaded documents, matching the existing gallery-image pattern — no R2, no new Cloudflare bindings.
- Work happens on git branch `feat/procurement-notices` (already created, with the design spec committed as `docs/superpowers/specs/2026-07-15-mlgrd-procurement-notices-design.md`). Do not create a new branch.

---

### Task 1: Data model — types + demo/HTTP client adapters

**Files:**
- Modify: `src/lib/data/types.ts`
- Modify: `src/lib/data/client.ts`

**Interfaces:**
- Produces: `ProcurementNoticeType` (`"ifb" | "rfq" | "rfp" | "eoi"`), `ProcurementNotice { id, title, refNo?, noticeType, summary, closingAt, publishedAt, documentName?, documentDataUrl? }`, `NewProcurementNotice = Omit<ProcurementNotice, "id" | "publishedAt">`, `UserRole` extended with `"procurement"`, and `data.procurementNotices.{list,create,update,remove}` on the shared `data` client object (same shape as every other collection, e.g. `data.gallery.*`).

- [ ] **Step 1: Add the type to `src/lib/data/types.ts`**

Add after the `Appointment`/`NewAppointment` block (after line 187, before `export type Collection = ...`):

```ts
export type ProcurementNoticeType = "ifb" | "rfq" | "rfp" | "eoi";

/**
 * A procurement/tender notice (Invitation for Bids, Request for Quotations,
 * Request for Proposals, Expression of Interest) posted by the Procurement
 * department. `status` (Open/Closed) is derived from `closingAt` at read time,
 * never stored — see the `isNoticeOpen`-style check duplicated in each
 * consumer (client component + admin section).
 */
export interface ProcurementNotice {
  id: ID;
  title: string;
  /** e.g. "MLGRD/PROC/2026/001". Optional. */
  refNo?: string;
  noticeType: ProcurementNoticeType;
  summary: string;
  /** ISO datetime — when bids/quotes/proposals close. */
  closingAt: string;
  /** ISO datetime — when the notice was posted. */
  publishedAt: string;
  /** Original filename, e.g. "IFB-compost-bins.docx". */
  documentName?: string;
  /** The attached document as a data: URL (PDF or Word), same pattern as gallery images. */
  documentDataUrl?: string;
}
export type NewProcurementNotice = Omit<ProcurementNotice, "id" | "publishedAt">;
```

Update the `Collection` union (currently `"posts" | "gallery" | "ministers" | "messages" | "directory" | "updates" | "appointments"`) to add `| "procurement-notices"`.

Update `UserRole` (currently `"admin" | "editor" | "viewer"`) to:

```ts
/** Staff role: full admin, content editor, read-only viewer, or Procurement-only. */
export type UserRole = "admin" | "editor" | "viewer" | "procurement";
```

- [ ] **Step 2: Add the demo (localStorage) adapter in `src/lib/data/client.ts`**

Import the new types — extend the existing type-only import block (currently starting `import type { Appointment, AuthResult, ... } from "./types";`) to also include `NewProcurementNotice` and `ProcurementNotice`.

Add a key to the `KEYS` object (after `appointments: "mlgrd:appointments",`):

```ts
  procurementNotices: "mlgrd:procurement-notices",
```

Add these methods to the `demo` object, after the `deleteAppointment` method and before the `// datasets` comment block:

```ts
  // procurement notices -------------------------------------------------------
  listProcurementNotices: async (): Promise<ProcurementNotice[]> =>
    readStore<ProcurementNotice>(KEYS.procurementNotices, []).sort((a, b) =>
      a.closingAt.localeCompare(b.closingAt),
    ),

  createProcurementNotice: async (
    input: NewProcurementNotice,
  ): Promise<ProcurementNotice> => {
    const items = readStore<ProcurementNotice>(KEYS.procurementNotices, []);
    const notice: ProcurementNotice = {
      ...input,
      id: uid("notice"),
      publishedAt: nowIso(),
    };
    writeStore(KEYS.procurementNotices, [notice, ...items]);
    return notice;
  },

  updateProcurementNotice: async (
    id: string,
    patch: Partial<NewProcurementNotice>,
  ): Promise<ProcurementNotice> => {
    const items = readStore<ProcurementNotice>(KEYS.procurementNotices, []);
    const next = items.map((n) => (n.id === id ? { ...n, ...patch } : n));
    writeStore(KEYS.procurementNotices, next);
    return next.find((n) => n.id === id)!;
  },

  deleteProcurementNotice: async (id: string): Promise<void> => {
    writeStore(
      KEYS.procurementNotices,
      readStore<ProcurementNotice>(KEYS.procurementNotices, []).filter(
        (n) => n.id !== id,
      ),
    );
  },

```

- [ ] **Step 3: Add the HTTP (Cloudflare Functions) adapter**

Add these methods to the `http` object, after `deleteAppointment` and before the `// datasets` comment:

```ts
  listProcurementNotices: () =>
    api<ProcurementNotice[]>("/procurement-notices"),
  createProcurementNotice: (input: NewProcurementNotice) =>
    api<ProcurementNotice>("/procurement-notices", {
      method: "POST",
      body: JSON.stringify(input),
      auth: true,
    }),
  updateProcurementNotice: (id: string, patch: Partial<NewProcurementNotice>) =>
    api<ProcurementNotice>(`/procurement-notices/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
      auth: true,
    }),
  deleteProcurementNotice: (id: string) =>
    api<void>(`/procurement-notices/${id}`, { method: "DELETE", auth: true }),

```

- [ ] **Step 4: Wire it into the exported `data` object**

Add to the `export const data = { ... }` block, after the `appointments: {...}` entry:

```ts
  procurementNotices: {
    list: backend.listProcurementNotices,
    create: backend.createProcurementNotice,
    update: backend.updateProcurementNotice,
    remove: backend.deleteProcurementNotice,
  },
```

- [ ] **Step 5: Verify it compiles**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -40`
Expected: build fails later at this point only on missing files referenced by later tasks (e.g. `procurement-section.tsx` doesn't exist yet) — NOT on anything in `types.ts`/`client.ts`. If it fails on those two files, fix before continuing. (If Task 1 is applied in isolation with no other file touching the new exports yet, the build should succeed cleanly — nothing yet imports `data.procurementNotices`.)

- [ ] **Step 6: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/lib/data/types.ts src/lib/data/client.ts
git commit -m "feat: add procurement notice data model + client adapters"
```

---

### Task 2: D1 schema + automatic remote migration in CI

**Files:**
- Modify: `scripts/d1-schema.sql`
- Modify: `.github/workflows/deploy-cloudflare.yml`

**Interfaces:**
- Produces: `procurement_notices` D1 table matching the `ProcurementNotice` shape from Task 1 exactly (column names are identical to the TS field names so the API router in Task 3 can `SELECT *` and return rows as-is).

- [ ] **Step 1: Append the table to `scripts/d1-schema.sql`**

Add at the end of the file, after the existing `users` table + its index:

```sql

-- Procurement/tender notices (Invitation for Bids, RFQ, RFP, EOI) posted by the
-- Procurement department. Public GET; writes are restricted in the API router to
-- 'admin' and 'procurement' roles (D1 has no role concept, so this is enforced in
-- functions/api/[[path]].ts, not here). Documents are stored as data: URLs, same
-- pattern as gallery images/minister portraits — see documentDataUrl.
CREATE TABLE IF NOT EXISTS procurement_notices (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  refNo           TEXT,
  noticeType      TEXT NOT NULL DEFAULT 'ifb',
  summary         TEXT,
  closingAt       TEXT NOT NULL,
  publishedAt     TEXT NOT NULL,
  documentName    TEXT,
  documentDataUrl TEXT
);
CREATE INDEX IF NOT EXISTS idx_procurement_notices_closing ON procurement_notices (closingAt DESC);
```

- [ ] **Step 2: Make CI apply schema changes automatically on every deploy**

Today, `scripts/d1-schema.sql` is only ever applied manually via `wrangler d1 execute` (see `DEPLOY-CLOUDFLARE.md`) — the deploy workflow never runs it, so this new table would never reach the live client-owned D1 database without a manual step none of us can run locally (nobody here has `wrangler login`'d against the client's Cloudflare account). Fix this permanently: the schema file is idempotent (`CREATE TABLE IF NOT EXISTS`), so it's always safe to (re-)apply on every deploy.

In `.github/workflows/deploy-cloudflare.yml`, add a new step between `"Build (live CF Pages mode)"` and `"Deploy to Cloudflare Pages"`:

```yaml
      - name: Apply D1 schema (idempotent)
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler d1 execute mlgrd --remote --file=scripts/d1-schema.sql
```

The full step order in the `deploy` job should now be: checkout → setup-bun → install deps → build → **apply D1 schema** → deploy to Pages → set Pages secrets.

- [ ] **Step 3: Verify the YAML is well-formed**

Run: `cd /home/karetech/projects/mlgrd-guyana && python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-cloudflare.yml'))" && echo "YAML OK"`
Expected: `YAML OK`. (This only checks syntax — the step itself can't be exercised locally since it needs the client's Cloudflare credentials; it will run for real on the next push to `main`.)

- [ ] **Step 4: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add scripts/d1-schema.sql .github/workflows/deploy-cloudflare.yml
git commit -m "feat: add procurement_notices D1 table + auto-apply schema on deploy"
```

---

### Task 3: API router — procurement-notices routes + real role restriction

**Files:**
- Modify: `functions/api/[[path]].ts`

**Interfaces:**
- Consumes: `procurement_notices` table from Task 2 (columns: `id,title,refNo,noticeType,summary,closingAt,publishedAt,documentName,documentDataUrl`).
- Produces: `GET/POST/PUT/DELETE /api/procurement-notices[/:id]` matching the shapes the Task 1 HTTP adapter expects (raw D1 rows, no field renaming needed). Also produces the cross-cutting rule: any authenticated request with `role === "procurement"` gets a 403 on every resource except `procurement-notices`, `auth`, and `health` — this is what later tasks/manual verification will check.

- [ ] **Step 1: Add `"procurement"` to the allowed roles**

Change:
```ts
const ALLOWED_ROLES = new Set(["admin", "editor", "viewer"]);
```
to:
```ts
const ALLOWED_ROLES = new Set(["admin", "editor", "viewer", "procurement"]);
```

- [ ] **Step 2: Add notice-type validation + document validation helpers**

Add near the other `ALLOWED_*` constants (after `const ALLOWED_IMAGE_SCHEMES = new Set(["https:", "data:"]);`):

```ts
const ALLOWED_NOTICE_TYPES = new Set(["ifb", "rfq", "rfp", "eoi"]);
const ALLOWED_DOCUMENT_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
// Documents run through as data: URLs (base64 ~1.37x the source file), so they
// need a much higher cap than the 32KB default used for ordinary JSON bodies —
// but still bounded, so a mis-sent multi-hundred-MB payload can't reach D1.
const MAX_DOCUMENT_JSON_BYTES = 8_000_000; // ~8MB request body
const MAX_DOCUMENT_STRING_LENGTH = 7_500_000; // ~5.4MB decoded, matches the 5MB client-side cap
```

Add a `cleanDocument` helper near `cleanImage` (after the `cleanImage` function). Note this deliberately does NOT reuse `optionalString`'s silent-truncate behavior — an oversized/invalid document must be rejected with an error, not silently corrupted or dropped, since the document IS the point of a procurement notice:

```ts
/** Validates a document data: URL. Returns null only for "no document provided";
 *  throws for a present-but-invalid document so callers can 422 instead of
 *  silently saving a notice with a missing/corrupt attachment. */
function cleanDocument(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  if (raw.length > MAX_DOCUMENT_STRING_LENGTH) {
    throw new Error("Document is too large — please use a file under 5MB.");
  }
  if (!raw.startsWith("data:")) {
    throw new Error("Invalid document — please re-upload the file.");
  }
  const semi = raw.indexOf(";");
  const mime = semi > 5 ? raw.slice(5, semi) : "";
  if (!ALLOWED_DOCUMENT_MIMES.has(mime)) {
    throw new Error("Invalid document type — please upload a PDF or Word document.");
  }
  return raw;
}
```

- [ ] **Step 3: Add the cross-cutting procurement-role restriction**

In the `onRequest` handler, immediately after the line `const requireAdmin = ...` (and its blank line) and BEFORE the `try {` block starts... actually the restriction must run *inside* the `try` so its errors are handled uniformly. Add it as the very first line inside `try {`, before `if (!env.DB && resource !== "auth") {`:

```ts
  try {
    if (
      role === "procurement" &&
      resource !== "procurement-notices" &&
      resource !== "auth" &&
      resource !== "health"
    ) {
      return err("Forbidden — this account can only manage procurement notices.", 403);
    }
    if (!env.DB && resource !== "auth") {
      return err("Database binding 'DB' is not configured.", 500);
    }
```

- [ ] **Step 4: Add a `requireProcurementAccess` guard**

Add next to the existing `requireAuth`/`requireAdmin` guards (after `const requireAdmin = ...`):

```ts
  const requireProcurementAccess = (): Response | null =>
    authed && (role === "admin" || role === "procurement")
      ? null
      : err("Forbidden — procurement staff or administrators only.", 403);
```

- [ ] **Step 5: Add the `procurement-notices` resource block**

Add this new block after the `appointments` resource block (after its closing `}` around line 689) and before the `// ── directory` comment:

```ts
    // ── procurement notices (tenders/bids) ───────────────────────────────────
    // GET is public. Writes are restricted to 'admin' and 'procurement' roles
    // (not 'editor'/'viewer') — this is Procurement's own dedicated space.
    if (resource === "procurement-notices") {
      if (method === "GET" && !id) {
        const { results } = await env.DB.prepare(
          "SELECT * FROM procurement_notices ORDER BY closingAt DESC",
        ).all();
        return json(results);
      }
      if (method === "POST") {
        const guard = requireProcurementAccess();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request, MAX_DOCUMENT_JSON_BYTES);
        const title = asString(b.title, 200);
        const closingAt = asString(b.closingAt, 40);
        if (!title) return err("A title is required.", 422);
        if (!closingAt) return err("A closing date is required.", 422);
        let documentDataUrl: string | null;
        try {
          documentDataUrl = cleanDocument(b.documentDataUrl);
        } catch (e) {
          return err((e as Error).message, 422);
        }
        const now = new Date().toISOString();
        const newId = `notice-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO procurement_notices (id,title,refNo,noticeType,summary,closingAt,publishedAt,documentName,documentDataUrl)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId,
            title,
            optionalString(b.refNo, 80),
            ALLOWED_NOTICE_TYPES.has(String(b.noticeType)) ? String(b.noticeType) : "ifb",
            asString(b.summary, 2000),
            closingAt,
            now,
            documentDataUrl ? optionalString(b.documentName, 200) : null,
            documentDataUrl,
          )
          .run();
        const row = await env.DB.prepare("SELECT * FROM procurement_notices WHERE id = ?").bind(newId).first();
        return json(row, 201);
      }
      if (method === "PUT" && id) {
        const guard = requireProcurementAccess();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request, MAX_DOCUMENT_JSON_BYTES);
        const sets: string[] = [];
        const vals: unknown[] = [];
        if (typeof b.title === "string") { sets.push("title = ?"); vals.push(asString(b.title, 200)); }
        if ("refNo" in b) { sets.push("refNo = ?"); vals.push(optionalString(b.refNo, 80)); }
        if (ALLOWED_NOTICE_TYPES.has(String(b.noticeType))) { sets.push("noticeType = ?"); vals.push(String(b.noticeType)); }
        if (typeof b.summary === "string") { sets.push("summary = ?"); vals.push(asString(b.summary, 2000)); }
        if (typeof b.closingAt === "string" && b.closingAt) { sets.push("closingAt = ?"); vals.push(asString(b.closingAt, 40)); }
        if ("documentDataUrl" in b) {
          let documentDataUrl: string | null;
          try {
            documentDataUrl = cleanDocument(b.documentDataUrl);
          } catch (e) {
            return err((e as Error).message, 422);
          }
          sets.push("documentDataUrl = ?"); vals.push(documentDataUrl);
          sets.push("documentName = ?"); vals.push(documentDataUrl ? optionalString(b.documentName, 200) : null);
        }
        if (!sets.length) return err("Nothing to update.", 422);
        await env.DB.prepare(`UPDATE procurement_notices SET ${sets.join(", ")} WHERE id = ?`).bind(...vals, id).run();
        const row = await env.DB.prepare("SELECT * FROM procurement_notices WHERE id = ?").bind(id).first();
        return row ? json(row) : err("Notice not found.", 404);
      }
      if (method === "DELETE" && id) {
        const guard = requireProcurementAccess();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM procurement_notices WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

```

- [ ] **Step 6: Update the file's route-list doc comment**

In the header comment block at the top of the file (the `Routes:` list), add after the `appointments` lines:

```ts
 *   GET    /api/procurement-notices          public list
 *   POST|PUT|DELETE /api/procurement-notices[/:id] (admin or procurement role only)
```

- [ ] **Step 7: Verify with local unit-style checks (no local D1, so use `tsc`/build + manual reasoning)**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -40`
Expected: build proceeds past the API router (Pages Functions aren't type-checked by `next build`, but a syntax error would still surface if something else imports this file — nothing does, it's a standalone Workers entry point). Also run:
`cd /home/karetech/projects/mlgrd-guyana && npx tsc --noEmit --target es2022 --lib es2022,webworker --module es2022 --moduleResolution bundler functions/api/\[\[path\]\].ts`
Expected: no type errors (or only errors pre-existing before this change — compare against `git stash` if unsure).

- [ ] **Step 8: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add "functions/api/[[path]].ts"
git commit -m "feat: add procurement-notices API routes with real role-scoped access"
```

---

### Task 4: Shared `DocumentUpload` admin component

**Files:**
- Modify: `src/components/admin/shared.tsx`

**Interfaces:**
- Consumes: `readFileAsDataUrl` (already defined in this file).
- Produces: `DocumentUpload({ value, valueName, onChange, label, id, maxBytes? })` — a file-to-data-URL uploader for documents (not images), used by Task 5.

- [ ] **Step 1: Add the component**

Add `import { toast } from "sonner";` to the top imports, and add `FileText, FileUp` to the existing `lucide-react` import line (`Loader2, ImagePlus, X` → `Loader2, ImagePlus, X, FileText, FileUp`).

Add this component after `ImageUpload` (after its closing `}` and before the `// ── Empty + loading states` comment):

```tsx
// ─────────────────────────────────────────────────────────────────────────────
// Document upload — file (PDF/Word) → data URL string
// ─────────────────────────────────────────────────────────────────────────────

export function DocumentUpload({
  value,
  valueName,
  onChange,
  label,
  id,
  maxBytes = 5 * 1024 * 1024,
}: {
  value?: string;
  valueName?: string;
  onChange: (dataUrl: string, fileName: string) => void;
  label: string;
  id: string;
  /** Client-side size guard so users get instant feedback (default 5MB). */
  maxBytes?: number;
}) {
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxBytes) {
      toast.error(
        `That file is too large — please use a document under ${Math.round(maxBytes / (1024 * 1024))}MB.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setBusy(true);
    try {
      const url = await readFileAsDataUrl(file);
      onChange(url, file.name);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-input bg-muted/30 p-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm">
          {valueName || "No document attached"}
        </span>
        {busy && (
          <Loader2 className="size-4 shrink-0 animate-spin text-brand-600" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <FileUp className="size-3.5" />
          {value ? "Replace" : "Upload"}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" />
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -40`
Expected: no new errors from `shared.tsx` (later tasks that import `DocumentUpload` will still fail until Task 5 exists — that's expected at this point).

- [ ] **Step 3: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/components/admin/shared.tsx
git commit -m "feat: add DocumentUpload shared admin component"
```

---

### Task 5: `ProcurementSection` admin component

**Files:**
- Create: `src/components/admin/procurement-section.tsx`

**Interfaces:**
- Consumes: `data.procurementNotices.*` (Task 1), `DocumentUpload` (Task 4), `Field`/`LoadingState`/`EmptyState` (existing `shared.tsx`), `ConfirmDelete` (existing).
- Produces: `ProcurementSection({ notices, onChange, loading })` — consumed by Task 6's dashboard wiring. Props shape mirrors `GallerySection`'s exactly.

- [ ] **Step 1: Write the component**

```tsx
"use client";

/**
 * Procurement Notices — tender/bid notices (Invitation for Bids, RFQ, RFP, EOI)
 * posted by the Procurement department. Available to 'admin' and 'procurement'
 * roles only. Open/Closed status is derived from the closing date, not stored.
 */
import * as React from "react";
import { Plus, Pencil, Trash2, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { data } from "@/lib/data/client";
import type {
  NewProcurementNotice,
  ProcurementNotice,
  ProcurementNoticeType,
} from "@/lib/data/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  Field,
  DocumentUpload,
  LoadingState,
  EmptyState,
} from "@/components/admin/shared";

const NOTICE_TYPES: { value: ProcurementNoticeType; label: string }[] = [
  { value: "ifb", label: "Invitation for Bids (IFB)" },
  { value: "rfq", label: "Request for Quotations (RFQ)" },
  { value: "rfp", label: "Request for Proposals (RFP)" },
  { value: "eoi", label: "Expression of Interest (EOI)" },
];

function noticeTypeLabel(t: ProcurementNoticeType): string {
  return NOTICE_TYPES.find((n) => n.value === t)?.label ?? t.toUpperCase();
}

function isOpen(closingAt: string): boolean {
  const d = new Date(closingAt);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function emptyDraft(): NewProcurementNotice {
  const closing = new Date();
  closing.setDate(closing.getDate() + 14);
  return {
    title: "",
    refNo: "",
    noticeType: "ifb",
    summary: "",
    closingAt: closing.toISOString().slice(0, 16),
    documentName: "",
    documentDataUrl: "",
  };
}

export function ProcurementSection({
  notices,
  onChange,
  loading,
}: {
  notices: ProcurementNotice[];
  onChange: () => Promise<void> | void;
  loading: boolean;
}) {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProcurementNotice | null>(null);
  const [draft, setDraft] = React.useState<NewProcurementNotice>(() => emptyDraft());
  const [busy, setBusy] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ProcurementNotice | null>(null);

  const sorted = React.useMemo(
    () =>
      [...notices].sort((a, b) => {
        const aOpen = isOpen(a.closingAt);
        const bOpen = isOpen(b.closingAt);
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        return a.closingAt.localeCompare(b.closingAt);
      }),
    [notices],
  );

  function openCreate() {
    setEditing(null);
    setDraft(emptyDraft());
    setEditorOpen(true);
  }

  function openEdit(n: ProcurementNotice) {
    setEditing(n);
    setDraft({
      title: n.title,
      refNo: n.refNo ?? "",
      noticeType: n.noticeType,
      summary: n.summary,
      closingAt: n.closingAt.slice(0, 16),
      documentName: n.documentName ?? "",
      documentDataUrl: n.documentDataUrl ?? "",
    });
    setEditorOpen(true);
  }

  function patch(p: Partial<NewProcurementNotice>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    if (!draft.title.trim()) return toast.error("A title is required.");
    if (!draft.closingAt) return toast.error("A closing date is required.");
    setBusy(true);
    try {
      const payload: NewProcurementNotice = {
        ...draft,
        closingAt: new Date(draft.closingAt).toISOString(),
        refNo: draft.refNo || undefined,
        documentName: draft.documentName || undefined,
        documentDataUrl: draft.documentDataUrl || undefined,
      };
      if (editing) {
        await data.procurementNotices.update(editing.id, payload);
        toast.success("Notice updated.");
      } else {
        await data.procurementNotices.create(payload);
        toast.success("Notice posted.");
      }
      setEditorOpen(false);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save notice.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await data.procurementNotices.remove(deleteTarget.id);
      toast.success("Notice deleted.");
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete notice.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Procurement Notices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post tender and bid notices for the public Procurement Notices page.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0 bg-brand-600 hover:bg-brand-700">
          <Plus className="size-4" /> Post notice
        </Button>
      </div>

      {loading ? (
        <LoadingState label="Loading notices…" />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No procurement notices yet"
          description="Post the first tender or bid notice."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Post notice
            </Button>
          }
        />
      ) : (
        <ul className="divide-y rounded-xl border">
          {sorted.map((n) => {
            const open = isOpen(n.closingAt);
            return (
              <li key={n.id} className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium leading-tight">{n.title}</p>
                    <Badge
                      variant="outline"
                      className={
                        open
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700"
                          : "border-border bg-secondary text-muted-foreground"
                      }
                    >
                      {open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {noticeTypeLabel(n.noticeType)}
                    {n.refNo ? ` · ${n.refNo}` : ""} · Closes {formatDateTime(n.closingAt)}
                  </p>
                  {n.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {n.summary}
                    </p>
                  )}
                  {n.documentDataUrl && (
                    <a
                      href={n.documentDataUrl}
                      download={n.documentName || "notice-document"}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:underline"
                    >
                      <Download className="size-3.5" /> {n.documentName || "Attached document"}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit notice"
                    onClick={() => openEdit(n)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete notice"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(n)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit notice" : "Post a procurement notice"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this notice."
                : "This will appear on the public Procurement Notices page."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field label="Title" htmlFor="pn-title">
              <Input
                id="pn-title"
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Supply and Delivery of New Compost Bins"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Notice type" htmlFor="pn-type">
                <Select
                  value={draft.noticeType}
                  onValueChange={(v) => patch({ noticeType: v as ProcurementNoticeType })}
                >
                  <SelectTrigger id="pn-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Reference number (optional)" htmlFor="pn-ref">
                <Input
                  id="pn-ref"
                  value={draft.refNo ?? ""}
                  onChange={(e) => patch({ refNo: e.target.value })}
                  placeholder="MLGRD/PROC/2026/001"
                />
              </Field>
            </div>
            <Field label="Closing date & time" htmlFor="pn-closing">
              <Input
                id="pn-closing"
                type="datetime-local"
                value={draft.closingAt}
                onChange={(e) => patch({ closingAt: e.target.value })}
              />
            </Field>
            <Field label="Summary" htmlFor="pn-summary">
              <Textarea
                id="pn-summary"
                value={draft.summary}
                onChange={(e) => patch({ summary: e.target.value })}
                rows={3}
                placeholder="Short description of what's being procured."
              />
            </Field>
            <DocumentUpload
              id="pn-document"
              label="Notice document (PDF or Word, up to 5MB)"
              value={draft.documentDataUrl}
              valueName={draft.documentName}
              onChange={(url, name) => patch({ documentDataUrl: url, documentName: name })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy} className="bg-brand-600 hover:bg-brand-700">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Post notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this notice?"
        description={
          deleteTarget ? `"${deleteTarget.title}" will be permanently removed.` : undefined
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -40`
Expected: no errors from this file (it isn't imported anywhere yet, so an unused-export lint warning is possible but not a build failure — Task 6 wires it in).

- [ ] **Step 3: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/components/admin/procurement-section.tsx
git commit -m "feat: add ProcurementSection admin CRUD component"
```

---

### Task 6: Wire Procurement Notices into the admin dashboard (real role restriction)

**Files:**
- Modify: `src/components/admin/dashboard.tsx`

**Interfaces:**
- Consumes: `ProcurementSection` (Task 5), `data.procurementNotices.list()` (Task 1).
- Produces: a `procurement`-role user's sidebar shows **only** "Procurement Notices" and lands there on login; `admin` continues to see and use everything, including Procurement Notices.

- [ ] **Step 1: Add imports**

Add `Briefcase` to the existing `lucide-react` icon import list (alongside `LayoutDashboard, Newspaper, ...`).

Add `ProcurementNotice` and `UserRole` to the existing `import type { Appointment, GalleryItem, Message, Minister, Post } from "@/lib/data/types";` block.

Add: `import { ProcurementSection } from "@/components/admin/procurement-section";` (alongside the other section imports, e.g. after `AppointmentsSection`).

- [ ] **Step 2: Extend `SectionId`, `NAV`, and `LABELS`**

Change:
```ts
type SectionId =
  | "overview"
  | "posts"
  | "updates"
  | "gallery"
  | "ministers"
  | "directory"
  | "datasets"
  | "messages"
  | "appointments"
  | "users"
  | "settings";
```
to:
```ts
type SectionId =
  | "overview"
  | "posts"
  | "updates"
  | "gallery"
  | "ministers"
  | "directory"
  | "datasets"
  | "messages"
  | "appointments"
  | "procurement"
  | "users"
  | "settings";
```

Change the `NAV` array's item type and add the new entry (insert right after the `appointments` entry):
```ts
const NAV: {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  /** Restricts this item to specific roles (in addition to admin, who always sees everything). */
  roles?: UserRole[];
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "posts", label: "Posts", icon: Newspaper },
  { id: "updates", label: "Updates", icon: Megaphone },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "ministers", label: "Ministers", icon: Users },
  { id: "directory", label: "Directories", icon: Network },
  { id: "datasets", label: "Directories & Resources", icon: Library },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "appointments", label: "Appointments", icon: CalendarCheck },
  { id: "procurement", label: "Procurement Notices", icon: Briefcase, roles: ["admin", "procurement"] },
  { id: "users", label: "Staff & Roles", icon: UserCog, adminOnly: true },
  { id: "settings", label: "Settings", icon: Settings },
];
```

Add to `LABELS`:
```ts
  procurement: "Procurement Notices",
```

- [ ] **Step 3: Make the sidebar and initial section role-aware**

Replace this block near the top of `Dashboard()`:
```ts
  const [section, setSection] = React.useState<SectionId>("overview");
  const me = data.auth.currentUser();
  const isAdmin = !me || me.role === "admin"; // demo / env-admin → full access
  const nav = NAV.filter((n) => !n.adminOnly || isAdmin);
  const cmd = useCommandPalette();
```
with:
```ts
  const me = data.auth.currentUser();
  const role = me?.role;
  const isAdmin = !me || role === "admin"; // demo / env-admin → full access
  const [section, setSection] = React.useState<SectionId>(() =>
    role === "procurement" ? "procurement" : "overview",
  );
  // A 'procurement' account sees ONLY its own section — not Overview, not
  // anything else — regardless of the adminOnly/roles flags on other items.
  const nav = NAV.filter((n) => {
    if (role === "procurement") return n.id === "procurement";
    if (n.adminOnly) return isAdmin;
    if (n.roles) return isAdmin || (role ? n.roles.includes(role) : false);
    return true;
  });
  const cmd = useCommandPalette();
```

- [ ] **Step 4: Add `notices` state and make `refresh` role-aware**

Add `const [notices, setNotices] = React.useState<ProcurementNotice[]>([]);` alongside the other `useState` declarations (next to `appointments`).

Replace the `refresh` callback:
```ts
  const refresh = React.useCallback(async () => {
    try {
      const [p, g, m, msg, appt] = await Promise.all([
        data.posts.list(),
        data.gallery.list(),
        data.ministers.list(),
        data.messages.list(),
        data.appointments.list(),
      ]);
      setPosts(p);
      setGallery(g);
      setMinisters(m);
      setMessages(msg);
      setAppointments(appt);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, []);
```
with:
```ts
  const refresh = React.useCallback(async () => {
    try {
      if (role === "procurement") {
        // A procurement-role token gets a 403 from every other resource
        // server-side (Task 3) — only fetch what it's actually allowed to read.
        setNotices(await data.procurementNotices.list());
      } else {
        const [p, g, m, msg, appt, pn] = await Promise.all([
          data.posts.list(),
          data.gallery.list(),
          data.ministers.list(),
          data.messages.list(),
          data.appointments.list(),
          data.procurementNotices.list(),
        ]);
        setPosts(p);
        setGallery(g);
        setMinisters(m);
        setMessages(msg);
        setAppointments(appt);
        setNotices(pn);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, [role]);
```

- [ ] **Step 5: Render the section**

Add, after the `{section === "appointments" && (...)}` block and before `{section === "settings" && (...)}`:
```tsx
                {section === "procurement" && (
                  <ProcurementSection
                    notices={notices}
                    onChange={refresh}
                    loading={loading}
                  />
                )}
```

- [ ] **Step 6: Verify it compiles**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -60`
Expected: build succeeds (this is the first task where every piece the dashboard needs actually exists).

- [ ] **Step 7: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/components/admin/dashboard.tsx
git commit -m "feat: wire Procurement Notices into the admin dashboard with role-scoped nav"
```

---

### Task 7: "Procurement" as a selectable staff role

**Files:**
- Modify: `src/components/admin/users-section.tsx`
- Modify: `src/components/admin/account-menu.tsx`

**Interfaces:**
- Consumes: `UserRole` (extended in Task 1 to include `"procurement"`).
- Produces: the Staff & Roles admin screen can create/edit an account with role `procurement`; the account menu and staff list render a badge for it.

- [ ] **Step 1: `users-section.tsx` — add the role option**

Change:
```ts
const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "admin", label: "Admin", desc: "Full access, including managing staff" },
  { value: "editor", label: "Editor", desc: "Manage all content" },
  { value: "viewer", label: "Viewer", desc: "Read-only access" },
];
```
to:
```ts
const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "admin", label: "Admin", desc: "Full access, including managing staff" },
  { value: "editor", label: "Editor", desc: "Manage all content" },
  { value: "viewer", label: "Viewer", desc: "Read-only access" },
  { value: "procurement", label: "Procurement", desc: "Procurement Notices only — nothing else" },
];
```

Change:
```ts
const roleBadge: Record<UserRole, string> = {
  admin: "border-brand/30 bg-brand/10 text-brand-700",
  editor: "border-gold/30 bg-gold/15 text-gold-700",
  viewer: "border-border bg-secondary text-muted-foreground",
};
```
to:
```ts
const roleBadge: Record<UserRole, string> = {
  admin: "border-brand/30 bg-brand/10 text-brand-700",
  editor: "border-gold/30 bg-gold/15 text-gold-700",
  viewer: "border-border bg-secondary text-muted-foreground",
  procurement: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700",
};
```

- [ ] **Step 2: `account-menu.tsx` — add the label/style**

Change:
```ts
const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_STYLE: Record<UserRole, string> = {
  admin: "border-brand/30 bg-brand/10 text-brand-700",
  editor: "border-gold/30 bg-gold/15 text-[#8a6500]",
  viewer: "border-border bg-secondary text-muted-foreground",
};
```
to:
```ts
const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
  procurement: "Procurement",
};

const ROLE_STYLE: Record<UserRole, string> = {
  admin: "border-brand/30 bg-brand/10 text-brand-700",
  editor: "border-gold/30 bg-gold/15 text-[#8a6500]",
  viewer: "border-border bg-secondary text-muted-foreground",
  procurement: "border-emerald-400/30 bg-emerald-500/10 text-emerald-700",
};
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -40`
Expected: clean build (a `Record<UserRole, string>` missing the new `"procurement"` key would be a TS error, so this step also double-checks Task 7's two edits are both complete).

- [ ] **Step 4: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/components/admin/users-section.tsx src/components/admin/account-menu.tsx
git commit -m "feat: add Procurement as a selectable staff role"
```

---

### Task 8: Public `/procurement` page

**Files:**
- Create: `src/components/procurement/procurement-list.tsx`
- Create: `src/app/procurement/page.tsx`

**Interfaces:**
- Consumes: `data.procurementNotices.list()` (Task 1), `PageHero` (existing `src/components/site/page-hero.tsx`).
- Produces: `/procurement` route listing every notice, Open first (soonest-closing first), then Closed.

- [ ] **Step 1: Write the list component**

```tsx
"use client";

import * as React from "react";
import { Download, FileText } from "lucide-react";

import { data } from "@/lib/data/client";
import type { ProcurementNotice, ProcurementNoticeType } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const NOTICE_TYPE_LABEL: Record<ProcurementNoticeType, string> = {
  ifb: "Invitation for Bids",
  rfq: "Request for Quotations",
  rfp: "Request for Proposals",
  eoi: "Expression of Interest",
};

function isOpen(closingAt: string): boolean {
  const d = new Date(closingAt);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProcurementList() {
  const [notices, setNotices] = React.useState<ProcurementNotice[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    data.procurementNotices
      .list()
      .then((live) => {
        if (alive) setNotices(live);
      })
      .catch(() => {
        /* fall back to the empty state below */
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const sorted = React.useMemo(
    () =>
      [...notices].sort((a, b) => {
        const aOpen = isOpen(a.closingAt);
        const bOpen = isOpen(b.closingAt);
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        return a.closingAt.localeCompare(b.closingAt);
      }),
    [notices],
  );

  if (loaded && sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        <FileText className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-medium">No procurement notices right now</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon, or contact the Ministry&apos;s Procurement department directly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sorted.map((n) => {
        const open = isOpen(n.closingAt);
        return (
          <Card key={n.id} className={open ? "border-brand/15" : "opacity-70"}>
            <CardContent className="flex flex-col gap-2 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    open
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700"
                      : "border-border bg-secondary text-muted-foreground"
                  }
                >
                  {open ? "Open" : "Closed"}
                </Badge>
                <Badge variant="outline" className="border-gold/30 bg-gold/10 text-[#8a6500]">
                  {NOTICE_TYPE_LABEL[n.noticeType]}
                </Badge>
                {n.refNo && <span className="text-xs text-muted-foreground">{n.refNo}</span>}
              </div>
              <h3 className="font-heading text-lg font-bold">{n.title}</h3>
              {n.summary && <p className="text-sm text-muted-foreground">{n.summary}</p>}
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Closes {formatDateTime(n.closingAt)}
                </span>
                {n.documentDataUrl && (
                  <a
                    href={n.documentDataUrl}
                    download={n.documentName || "notice-document"}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
                  >
                    <Download className="size-4" /> {n.documentName || "Download document"}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Write the page**

```tsx
import type { Metadata } from "next";

import { PageHero } from "@/components/site/page-hero";
import { ProcurementList } from "@/components/procurement/procurement-list";

export const metadata: Metadata = {
  alternates: { canonical: "/procurement" },
};

export default function ProcurementPage() {
  return (
    <>
      <PageHero
        eyebrow="Procurement"
        title="Procurement Notices"
        lead="Current tenders, requests for quotations and requests for proposals from the Ministry of Local Government & Regional Development."
        crumbs={[{ label: "Procurement Notices" }]}
      />
      <section className="container-gov py-12 sm:py-16">
        <ProcurementList />
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -60`
Expected: clean build; `out/procurement/index.html` is produced. Check: `ls out/procurement/index.html`

- [ ] **Step 4: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/components/procurement/procurement-list.tsx src/app/procurement/page.tsx
git commit -m "feat: add public /procurement notices page"
```

---

### Task 9: Homepage hero teaser (fills the blank space Kishana circled)

**Files:**
- Create: `src/components/site/procurement-notices-teaser.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `data.procurementNotices.list()` (Task 1).
- Produces: a compact card rendered in the homepage hero's left column, directly below the "official Government of Guyana website" line.

- [ ] **Step 1: Write the teaser component**

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { data } from "@/lib/data/client";
import type { ProcurementNotice } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";

function isOpen(closingAt: string): boolean {
  const d = new Date(closingAt);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function ProcurementNoticesTeaser() {
  const [notices, setNotices] = React.useState<ProcurementNotice[]>([]);

  React.useEffect(() => {
    let alive = true;
    data.procurementNotices
      .list()
      .then((live) => {
        if (alive && Array.isArray(live)) setNotices(live);
      })
      .catch(() => {
        /* keep empty state */
      });
    return () => {
      alive = false;
    };
  }, []);

  const open = React.useMemo(
    () =>
      notices
        .filter((n) => isOpen(n.closingAt))
        .sort((a, b) => a.closingAt.localeCompare(b.closingAt))
        .slice(0, 2),
    [notices],
  );

  return (
    <div className="mt-8 rounded-2xl border border-brand/10 bg-white/70 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
        <FileText className="size-4" />
        Procurement Notices
      </div>
      {open.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No open procurement notices right now.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {open.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="line-clamp-1 font-medium">{n.title}</span>
              <Badge variant="outline" className="shrink-0 border-gold/30 bg-gold/10 text-[#8a6500]">
                Closes {formatDate(n.closingAt)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/procurement"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        View all procurement notices <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Insert it into the homepage hero**

In `src/app/page.tsx`, add `import { ProcurementNoticesTeaser } from "@/components/site/procurement-notices-teaser";` alongside the other imports.

Find this block (the end of the hero's left column):
```tsx
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start">
              <ShieldCheck className="size-4 text-gold" />
              An official Government of Guyana website
            </div>
          </div>

          {/* Emblem + latest updates */}
          <HeroEmblemNews />
```
Replace with:
```tsx
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start">
              <ShieldCheck className="size-4 text-gold" />
              An official Government of Guyana website
            </div>
            <ProcurementNoticesTeaser />
          </div>

          {/* Emblem + latest updates */}
          <HeroEmblemNews />
```

- [ ] **Step 3: Verify it compiles and renders**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -60`
Expected: clean build.

Then start a local dev server and visually confirm the gap is filled (this is the UI vision check — do not skip it):
```bash
cd /home/karetech/projects/mlgrd-guyana && bun run dev -- -p 3055 &
sleep 4 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3055/
```
Take a screenshot of `http://localhost:3055/` at viewport 1440×900 (e.g. via the Playwright MCP browser tool) and visually confirm: the "Procurement Notices" card now fills the blank space below the CTA buttons, with no layout overlap or shift versus the right-column emblem/updates card. Then stop the dev server: `pkill -f "next dev -p 3055"`.

- [ ] **Step 4: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/components/site/procurement-notices-teaser.tsx src/app/page.tsx
git commit -m "feat: add procurement notices teaser to homepage hero"
```

---

### Task 10: Retire the placeholder "Tenders" directory

**Files:**
- Modify: `src/lib/data/datasets.ts`
- Delete: `src/data/datasets/tenders.json`
- Modify: `src/lib/site.ts`

**Interfaces:**
- Produces: no more `/directories/tenders` route (its dataset registry entry is removed, so `generateStaticParams` no longer builds it — Next will correctly 404 the old URL rather than serving stale fake content); the Directories → Resources nav now says "Procurement Notices" and points at `/procurement`.

- [ ] **Step 1: Remove the `tenders` entry from `src/lib/data/datasets.ts`**

Delete this whole block (found between the `developments-2026` entry and the `resources` entry):
```ts
  {
    key: "tenders",
    label: "Tenders",
    singular: "Tender",
    description:
      "Current procurement opportunities and invitations to bid.",
    icon: "FileText",
    route: "/directories/tenders",
    navGroup: "resources",
    columns: [
      { key: "title", label: "Tender", primary: true, searchable: true },
      { key: "ref_no", label: "Reference", searchable: true },
      { key: "category", label: "Category", badge: true, searchable: true },
      { key: "status", label: "Status", badge: true },
      { key: "issue_date", label: "Issued", type: "date" },
      { key: "close_date", label: "Closes", type: "date" },
      { key: "description", label: "Description", type: "textarea", detail: true },
      { key: "bid_security", label: "Bid security", detail: true },
      { key: "contact", label: "Contact", detail: true },
    ],
  },
```

- [ ] **Step 2: Check for any other reference to the `tenders` dataset key**

Run: `cd /home/karetech/projects/mlgrd-guyana && grep -rn '"tenders"' src/ scripts/ 2>/dev/null`
Expected: no remaining matches after Step 1 (the `datasetRecords` loader in `src/data/datasets/index.ts`-equivalent, if it enumerates by filename/registry key rather than a hardcoded list, needs no separate edit — confirm by checking `src/data/datasets/index.ts` or wherever `datasetRecords` is assembled; if it imports `tenders.json` explicitly by name, remove that import too).

- [ ] **Step 3: Delete the placeholder seed file**

```bash
cd /home/karetech/projects/mlgrd-guyana
git rm src/data/datasets/tenders.json
```

- [ ] **Step 4: Update the nav link in `src/lib/site.ts`**

Change:
```ts
      { label: "Tenders", href: "/directories/tenders" },
```
to:
```ts
      { label: "Procurement Notices", href: "/procurement" },
```

- [ ] **Step 5: Verify the build is clean and the old route is gone**

Run: `cd /home/karetech/projects/mlgrd-guyana && bun run build 2>&1 | tail -60`
Expected: clean build. Then: `ls out/directories/tenders 2>&1` should report "No such file or directory" (confirms the stale placeholder page is no longer generated), and `ls out/procurement/index.html` should exist.

- [ ] **Step 6: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add src/lib/data/datasets.ts src/lib/site.ts
git commit -m "chore: retire placeholder Tenders directory in favor of real Procurement Notices"
```

(Note: if a live D1 database still has old `kind = 'tenders'` rows in its `datasets` table from before this change, they simply become unreachable dead rows — no code path reads `kind = 'tenders'` anymore. Not required for correctness, but optionally clean up later with `DELETE FROM datasets WHERE kind = 'tenders'` via `wrangler d1 execute` if it ever needs tidying.)

---

### Task 11: E2E coverage, full verification, and docs

**Files:**
- Modify: `tests/e2e/portal-smoke.spec.ts`
- Modify: `mlgrd-guyana/CLAUDE.md` (repo path: `CLAUDE.md` at repo root)

**Interfaces:**
- Consumes: everything from Tasks 1–10.
- Produces: passing e2e coverage for the new public page + admin CRUD flow, and updated project docs so a future session (or engineer) discovers this content type via the existing "Content & data layer" convention list.

- [ ] **Step 1: Add a public-page e2e test**

In `tests/e2e/portal-smoke.spec.ts`, add to the `public portal smoke` describe block (after the helpdesk test):
```ts
  test("procurement notices page renders with an empty state when nothing is posted", async ({ page }) => {
    await page.goto("/mlgrd-guyana/procurement/");
    await expect(page.getByRole("heading", { name: /Procurement Notices/i }).first()).toBeVisible();
    await expect(page.getByText(/No procurement notices right now/i)).toBeVisible();
  });
```

- [ ] **Step 2: Add an admin-flow e2e test**

Add to the `admin smoke` describe block (after the existing login test):
```ts
  test("admin can post a procurement notice and see it on the public page", async ({ page }) => {
    await page.goto("/mlgrd-guyana/admin/");
    await page.getByRole("textbox", { name: "Username" }).fill("admin");
    await page.getByRole("textbox", { name: "Password" }).fill("mlgrd2026");
    await page.getByRole("button", { name: /Sign in/i }).click();

    await page.getByRole("button", { name: /Procurement Notices/i }).click();
    await page.getByRole("button", { name: /Post notice/i }).first().click();
    await page.getByLabel("Title").fill("Supply of Office Furniture — E2E test");
    await page.getByRole("button", { name: /^Post notice$/ }).click();

    await expect(page.getByText("Supply of Office Furniture — E2E test")).toBeVisible();

    await page.goto("/mlgrd-guyana/procurement/");
    await expect(page.getByText("Supply of Office Furniture — E2E test")).toBeVisible();
  });
```

- [ ] **Step 3: Run the e2e suite and fix any selector mismatches**

Run: `cd /home/karetech/projects/mlgrd-guyana && NEXT_PUBLIC_BASE_PATH=/mlgrd-guyana bun run build && npx playwright test tests/e2e/portal-smoke.spec.ts 2>&1 | tail -80`
Expected: all tests pass, including the two new ones. If a selector doesn't match the actual rendered markup (e.g. the sidebar button's accessible name differs from `/Procurement Notices/i`), adjust the test to match reality — do not weaken the assertion to something that would pass regardless of correctness.

- [ ] **Step 4: Run full lint + build one more time end-to-end**

```bash
cd /home/karetech/projects/mlgrd-guyana
bun run lint
bun run build
NEXT_PUBLIC_API_BASE="" bun run build   # live-mode build, same as CI
```
Expected: all three commands exit 0.

- [ ] **Step 5: Manual verification of the server-side role restriction**

This can't be exercised through the GitHub Pages demo (its login is hardcoded to the single `admin` account — see `client.ts`'s `demo.login`), so verify directly against the local Next dev server acting as if it were the live API — actually the role restriction lives in the Cloudflare Pages Function, which only runs under `wrangler pages dev`, not `next dev`. Verify with:
```bash
cd /home/karetech/projects/mlgrd-guyana
NEXT_PUBLIC_API_BASE="" bun run build
npx wrangler pages dev out --d1=DB --compatibility-date=2025-06-01 &
sleep 3
# Create a procurement-role user via the admin API using an env-admin bootstrap login first,
# requires ADMIN_SECRET/ADMIN_PASSWORD to be set for this local wrangler process — if not
# configured, skip this step and note it as deferred to a live smoke test after deploy.
curl -s http://localhost:8788/api/health
pkill -f "wrangler pages dev"
```
If local Pages Functions + D1 emulation isn't practical to stand up in this environment, explicitly note in the task update: "Server-side role restriction verified by code review only; live smoke test deferred to post-deploy" — do not claim it was tested if it wasn't.

- [ ] **Step 6: Update `mlgrd-guyana/CLAUDE.md`**

In the "Content & data layer" section, the file already says "New mutable content type → add to `types.ts`, `seed.ts`, the client adapters, the D1 schema/seed, the API router, and an admin panel." — no edit needed there (this change followed that exact rule; procurement notices don't use a `seed.ts` entry since they start empty, which is consistent with `messages`/`appointments` already documented as citizen-submitted-only collections).

Add one short paragraph after the "Admin" section's existing bullet list (after the "Demo login" bullet):
```markdown
- **Roles:** `admin` (full access), `editor` (manage content), `viewer` (read-only),
  and `procurement` (sees ONLY the Procurement Notices section — enforced
  server-side in `functions/api/[[path]].ts`, not just hidden nav). Manage staff
  accounts and roles from the "Staff & Roles" admin screen.
```

- [ ] **Step 7: Commit**

```bash
cd /home/karetech/projects/mlgrd-guyana
git add tests/e2e/portal-smoke.spec.ts CLAUDE.md
git commit -m "test: add e2e coverage for procurement notices; docs: note the new role"
```

---

## After all tasks: merge readiness

This branch (`feat/procurement-notices`) is client-facing and touches far more than 5 files — per this project's verification rules, generate an HTML merge-gate explainer for Master Kareem before merging to `main` (use `/merge-explainer`), and get an independent reviewer pass on the full diff first. Only after both of those, and a final `bun run build` + e2e pass on the merge commit, merge to `main` and push — CI will build in live mode, apply the D1 schema (Task 2), and deploy to the client's Cloudflare Pages project automatically.
