/**
 * MLGRD portal API — Cloudflare Pages Functions + D1.
 *
 * A single catch-all router serving /api/* for the static front-end. It backs the
 * admin dashboard and the public news/gallery pages. Runs on the Workers runtime
 * (Web standards: fetch, Web Crypto) — no Node server, so it deploys for free on
 * Cloudflare Pages alongside the static export.
 *
 * Bindings (configure in wrangler.toml / Pages dashboard):
 *   - DB                  : D1 database (schema in scripts/d1-schema.sql)
 *   - ADMIN_SECRET        : HMAC signing secret for session tokens (REQUIRED in prod)
 *   - ADMIN_USERNAME      : admin login username (default "admin")
 *   - ADMIN_PASSWORD      : admin password (plaintext, stored as a Pages secret), OR
 *   - ADMIN_PASSWORD_HASH : hex SHA-256 of the password (preferred over plaintext)
 *
 * Routes:
 *   POST   /api/auth/login            { username, password } -> { token, expiresAt }
 *   GET    /api/posts                 published posts (all posts if authed)
 *   POST   /api/posts                 (auth) create
 *   PUT    /api/posts/:id             (auth) update
 *   DELETE /api/posts/:id             (auth) delete
 *   GET    /api/gallery               list
 *   POST|PUT|DELETE /api/gallery[/:id](auth)
 *   GET    /api/ministers             list
 *   POST|PUT|DELETE /api/ministers[/:id] (auth)
 *   GET    /api/messages              (auth) list inbox
 *   POST   /api/messages              public submit (helpdesk/contact form)
 *   PUT|DELETE /api/messages/:id      (auth)
 *   GET    /api/updates               public "What's New" changelog
 *   POST|PUT|DELETE /api/updates[/:id] (auth)
 *   GET    /api/appointments          (auth) list REO booking requests
 *   POST   /api/appointments          public submit (citizen REO booking)
 *   PUT|DELETE /api/appointments/:id  (auth) (PUT updates status)
 *   GET    /api/procurement-notices          public list
 *   POST|PUT|DELETE /api/procurement-notices[/:id] (admin or procurement role only)
 */

interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
}

// Minimal D1 typings (avoids needing @cloudflare/workers-types at build time).
interface D1Result<T = unknown> {
  results: T[];
}
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface EventContext {
  request: Request;
  env: Env;
  params: { path?: string[] };
}

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours
const MAX_JSON_BYTES = 32_768;
const ALLOWED_MESSAGE_CHANNELS = new Set(["contact", "helpdesk"]);
const ALLOWED_MESSAGE_STATUSES = new Set(["new", "open", "resolved"]);
const ALLOWED_APPOINTMENT_STATUSES = new Set([
  "requested",
  "confirmed",
  "declined",
  "completed",
]);
const ALLOWED_POST_STATUSES = new Set(["draft", "published", "archived"]);
const ALLOWED_IMAGE_SCHEMES = new Set(["https:", "data:"]);
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


// ── helpers ──────────────────────────────────────────────────────────────────

const json = (data: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(), ...extra },
  });

const err = (message: string, status = 400) => json({ error: message }, status);

function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("Origin") ?? "";
  const allowed = new Set([
    "https://kareemschultz.github.io",
    "https://mlgrd.gov.gy",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
  return {
    "Access-Control-Allow-Origin": allowed.has(origin) ? origin : "https://kareemschultz.github.io",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const a = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomSaltHex(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

/** PBKDF2-SHA256 (100k iterations) salted password hash → hex. */
async function hashPassword(password: string, saltHex: string): Promise<string> {
  const salt = Uint8Array.from(saltHex.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return toHex(bits);
}

const ALLOWED_ROLES = new Set(["admin", "editor", "viewer", "procurement"]);

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function adminSecret(env: Env): string | null {
  return env.ADMIN_SECRET && env.ADMIN_SECRET.length >= 32 ? env.ADMIN_SECRET : null;
}

function hasConfiguredAdminPassword(env: Env): boolean {
  return !!(env.ADMIN_PASSWORD_HASH || env.ADMIN_PASSWORD);
}

type AuthClaims = { exp: number; sub: string; role: string; name: string; username: string };

async function signToken(
  env: Env,
  claims: Omit<AuthClaims, "exp">,
): Promise<{ token: string; expiresAt: number }> {
  const secret = adminSecret(env);
  if (!secret) throw new Error("ADMIN_SECRET is not configured securely.");
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = b64url(enc.encode(JSON.stringify({ exp: expiresAt, ...claims })));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return { token: `${payload}.${b64url(sig)}`, expiresAt };
}

/** Verify the token signature + expiry; returns the claims or null. */
async function getAuth(env: Env, token: string | null): Promise<AuthClaims | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const secret = adminSecret(env);
  if (!secret) return null;
  const key = await hmacKey(secret);
  const expected = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  if (b64url(expected) !== sig) return null;
  try {
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as AuthClaims;
    return decoded.exp > Date.now() ? decoded : null;
  } catch {
    return null;
  }
}

function bearer(request: Request): string | null {
  const h = request.headers.get("Authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

async function readBody<T>(request: Request, maxBytes = MAX_JSON_BYTES): Promise<T> {
  const length = Number(request.headers.get("Content-Length") || "0");
  if (length > maxBytes) throw new Error("Request body is too large.");
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

function asString(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalString(value: unknown, max = 500): string | null {
  const s = asString(value, max);
  return s || null;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanUrl(value: unknown, max = 2048): string | null {
  const raw = optionalString(value, max);
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

function cleanImage(value: unknown): string | null {
  const raw = optionalString(value, 20_000);
  if (!raw) return null;
  if (raw.startsWith("/")) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol === "data:") {
      return raw.startsWith("data:image/") ? raw : null;
    }
    return ALLOWED_IMAGE_SCHEMES.has(url.protocol) ? raw : null;
  } catch {
    return null;
  }
}

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

// Map a D1 minister row (current as 0/1) to the API shape (boolean).
function rowToMinister(r: Record<string, unknown>) {
  return { ...r, current: !!r.current };
}

// Map a D1 post row (tags stored as a JSON string) to the API shape.
function rowToPost(r: Record<string, unknown>) {
  let tags: unknown = [];
  try {
    tags = r.tags ? JSON.parse(String(r.tags)) : [];
  } catch {
    tags = [];
  }
  return { ...r, tags };
}

// Map a D1 directory row (officials stored as a JSON string) to the API shape.
function rowToDirectory(r: Record<string, unknown>) {
  let officials: unknown = [];
  try {
    officials = r.officials ? JSON.parse(String(r.officials)) : [];
  } catch {
    officials = [];
  }
  return { ...r, officials };
}

// Map a D1 portal-update row (sections stored as a JSON string) to the API shape.
function rowToUpdate(r: Record<string, unknown>) {
  let sections: unknown = [];
  try {
    sections = r.sections ? JSON.parse(String(r.sections)) : [];
  } catch {
    sections = [];
  }
  return { ...r, sections };
}

// Dataset fields that must never reach unauthenticated callers (mirrors the
// `sensitive` flags in src/lib/data/datasets.ts). The D1 row may hold the full
// record; public GETs strip these. Keep in sync if more sensitive fields appear.
const SENSITIVE_DATASET_FIELDS: Record<string, string[]> = {
  "amerindian-villages": ["leader_name", "contact"],
};

function rowToDataset(
  r: Record<string, unknown>,
  authed: boolean,
  kind: string,
): Record<string, unknown> {
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(String(r.data)) as Record<string, unknown>;
  } catch {
    /* corrupt row — return id only */
  }
  const out: Record<string, unknown> = { ...data, id: r.id };
  if (!authed) {
    for (const f of SENSITIVE_DATASET_FIELDS[kind] ?? []) delete out[f];
  }
  return out;
}

// ── entry point ──────────────────────────────────────────────────────────────

export const onRequest = async (ctx: EventContext): Promise<Response> => {
  const { request, env } = ctx;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const segments = ctx.params.path || [];
  const [resource, id] = segments;
  const method = request.method;
  const auth = await getAuth(env, bearer(request));
  const authed = !!auth;
  const role = auth?.role ?? null;

  const requireAuth = (): Response | null =>
    authed ? null : err("Unauthorized", 401);
  const requireAdmin = (): Response | null =>
    role === "admin" ? null : err("Forbidden — administrators only.", 403);
  const requireProcurementAccess = (): Response | null =>
    authed && (role === "admin" || role === "procurement")
      ? null
      : err("Forbidden — procurement staff or administrators only.", 403);

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

    // ── auth ────────────────────────────────────────────────────────────────
    if (resource === "auth" && id === "login" && method === "POST") {
      const { username, password } = await readBody<{
        username?: string;
        password?: string;
      }>(request);
      if (!adminSecret(env)) {
        return err("Admin authentication is not configured.", 503);
      }
      const uname = (username || "").trim();
      const pass = password || "";
      const invalid = () => err("Invalid username or password.", 401);
      if (!uname || !pass) return invalid();

      // 1) A staff account in the users table (PBKDF2 salted hash).
      if (env.DB) {
        const u = await env.DB.prepare(
          "SELECT * FROM users WHERE username = ? AND active = 1",
        )
          .bind(uname)
          .first<Record<string, unknown>>();
        if (u) {
          const hash = await hashPassword(pass, String(u.passwordSalt));
          if (hash !== String(u.passwordHash)) return invalid();
          const signed = await signToken(env, {
            sub: String(u.id),
            role: String(u.role),
            name: String(u.name),
            username: String(u.username),
          });
          return json({
            ...signed,
            user: { id: u.id, name: u.name, role: u.role, username: u.username },
          });
        }
      }

      // 2) Bootstrap admin from the ADMIN_PASSWORD env (always full admin).
      if (hasConfiguredAdminPassword(env) && uname === (env.ADMIN_USERNAME || "admin")) {
        const ok = env.ADMIN_PASSWORD_HASH
          ? (await sha256Hex(pass)) === env.ADMIN_PASSWORD_HASH.toLowerCase()
          : pass === env.ADMIN_PASSWORD;
        if (!ok) return invalid();
        const signed = await signToken(env, {
          sub: "env-admin",
          role: "admin",
          name: "Administrator",
          username: uname,
        });
        return json({
          ...signed,
          user: { id: "env-admin", name: "Administrator", role: "admin", username: uname },
        });
      }

      return invalid();
    }

    // ── posts ─────────────────────────────────────────────────────────────────
    if (resource === "posts") {
      if (method === "GET" && !id) {
        const sql = authed
          ? "SELECT * FROM posts ORDER BY date DESC"
          : "SELECT * FROM posts WHERE status = 'published' ORDER BY date DESC";
        const { results } = await env.DB.prepare(sql).all<Record<string, unknown>>();
        return json(results.map(rowToPost));
      }
      if (method === "POST") {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        const now = new Date().toISOString();
        const newId = `post-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO posts (id,slug,title,excerpt,body,category,tags,coverImage,sourceUrl,status,date,createdAt,updatedAt)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId,
            asString(b.slug, 120),
            asString(b.title, 200),
            asString(b.excerpt, 500),
            asString(b.body, 10_000),
            asString(b.category, 80),
            JSON.stringify(Array.isArray(b.tags) ? b.tags.map((t) => asString(t, 40)).filter(Boolean).slice(0, 12) : []),
            cleanImage(b.coverImage),
            cleanUrl(b.sourceUrl),
            ALLOWED_POST_STATUSES.has(String(b.status)) ? String(b.status) : "draft",
            asString(b.date, 20) || now.slice(0, 10),
            now,
            now,
          )
          .run();
        const created = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(newId).first<Record<string, unknown>>();
        return json(rowToPost(created!), 201);
      }
      if (method === "PUT" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        if ("tags" in b) b.tags = JSON.stringify(b.tags);
        const fields = ["slug", "title", "excerpt", "body", "category", "tags", "coverImage", "sourceUrl", "status", "date"];
        const sets = fields.filter((f) => f in b);
        if (sets.length) {
          const sql = `UPDATE posts SET ${sets.map((f) => `${f} = ?`).join(", ")}, updatedAt = ? WHERE id = ?`;
          await env.DB.prepare(sql).bind(...sets.map((f) => b[f]), new Date().toISOString(), id).run();
        }
        const updated = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<Record<string, unknown>>();
        return updated ? json(rowToPost(updated)) : err("Post not found.", 404);
      }
      if (method === "DELETE" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

    // ── gallery ───────────────────────────────────────────────────────────────
    if (resource === "gallery") {
      if (method === "GET" && !id) {
        const { results } = await env.DB.prepare('SELECT * FROM gallery ORDER BY "order" ASC').all();
        return json(results);
      }
      if (method === "POST") {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        const now = new Date().toISOString();
        const newId = `gal-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO gallery (id,title,caption,image,category,date,"order",createdAt) VALUES (?,?,?,?,?,?,?,?)`,
        )
          .bind(newId, b.title ?? "", b.caption ?? null, b.image ?? "", b.category ?? null, b.date ?? null, b.order ?? 0, now)
          .run();
        return json(await env.DB.prepare("SELECT * FROM gallery WHERE id = ?").bind(newId).first(), 201);
      }
      if (method === "PUT" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        const fields = ["title", "caption", "image", "category", "date", "order"];
        const sets = fields.filter((f) => f in b);
        if (sets.length) {
          const sql = `UPDATE gallery SET ${sets.map((f) => `"${f}" = ?`).join(", ")} WHERE id = ?`;
          await env.DB.prepare(sql).bind(...sets.map((f) => b[f]), id).run();
        }
        const row = await env.DB.prepare("SELECT * FROM gallery WHERE id = ?").bind(id).first();
        return row ? json(row) : err("Gallery item not found.", 404);
      }
      if (method === "DELETE" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM gallery WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

    // ── ministers ───────────────────────────────────────────────────────────
    if (resource === "ministers") {
      if (method === "GET" && !id) {
        const { results } = await env.DB.prepare('SELECT * FROM ministers ORDER BY "order" ASC').all<Record<string, unknown>>();
        return json(results.map(rowToMinister));
      }
      if (method === "POST") {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        const now = new Date().toISOString();
        const newId = `minister-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO ministers (id,name,title,portrait,initials,bio,profileUrl,termStart,termEnd,current,"order",createdAt)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId,
            b.name ?? "",
            b.title ?? "",
            b.portrait ?? null,
            b.initials ?? null,
            b.bio ?? null,
            b.profileUrl ?? null,
            b.termStart ?? null,
            b.termEnd ?? null,
            b.current ? 1 : 0,
            b.order ?? 0,
            now,
          )
          .run();
        const row = await env.DB.prepare("SELECT * FROM ministers WHERE id = ?").bind(newId).first<Record<string, unknown>>();
        return json(rowToMinister(row!), 201);
      }
      if (method === "PUT" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        if ("current" in b) b.current = b.current ? 1 : 0;
        const fields = ["name", "title", "portrait", "initials", "bio", "profileUrl", "termStart", "termEnd", "current", "order"];
        const sets = fields.filter((f) => f in b);
        if (sets.length) {
          const sql = `UPDATE ministers SET ${sets.map((f) => `"${f}" = ?`).join(", ")} WHERE id = ?`;
          await env.DB.prepare(sql).bind(...sets.map((f) => b[f]), id).run();
        }
        const row = await env.DB.prepare("SELECT * FROM ministers WHERE id = ?").bind(id).first<Record<string, unknown>>();
        return row ? json(rowToMinister(row)) : err("Minister not found.", 404);
      }
      if (method === "DELETE" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM ministers WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

    // ── messages ──────────────────────────────────────────────────────────────
    if (resource === "messages") {
      if (method === "GET" && !id) {
        const guard = requireAuth();
        if (guard) return guard;
        const { results } = await env.DB.prepare("SELECT * FROM messages ORDER BY createdAt DESC").all();
        return json(results);
      }
      if (method === "POST") {
        // Public: anyone can submit a helpdesk/contact message.
        const b = await readBody<Record<string, unknown>>(request);
        const channel = ALLOWED_MESSAGE_CHANNELS.has(String(b.channel)) ? String(b.channel) : "contact";
        const name = asString(b.name, 120);
        const email = asString(b.email, 254).toLowerCase();
        const body = asString(b.body, 5_000);
        if (!name) return err("Name is required.", 422);
        if (!email || !isEmail(email)) return err("A valid email address is required.", 422);
        if (!body) return err("Message body is required.", 422);
        const now = new Date().toISOString();
        const newId = `msg-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO messages (id,channel,name,email,subject,category,body,status,createdAt)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId,
            channel,
            name,
            email,
            optionalString(b.subject, 180),
            optionalString(b.category, 120),
            body,
            "new",
            now,
          )
          .run();
        return json(await env.DB.prepare("SELECT * FROM messages WHERE id = ?").bind(newId).first(), 201);
      }
      if (method === "PUT" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<{ status?: string }>(request);
        if (b.status && !ALLOWED_MESSAGE_STATUSES.has(b.status)) {
          return err("Invalid message status.", 422);
        }
        if (b.status) {
          await env.DB.prepare("UPDATE messages SET status = ? WHERE id = ?").bind(b.status, id).run();
        }
        const row = await env.DB.prepare("SELECT * FROM messages WHERE id = ?").bind(id).first();
        return row ? json(row) : err("Message not found.", 404);
      }
      if (method === "DELETE" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

    // ── appointments (REO booking) ──────────────────────────────────────────
    // POST is public (citizen booking); list/update/delete require auth.
    if (resource === "appointments") {
      if (method === "GET" && !id) {
        const guard = requireAuth();
        if (guard) return guard;
        const { results } = await env.DB.prepare(
          "SELECT * FROM appointments ORDER BY createdAt DESC",
        ).all();
        return json(results);
      }
      if (method === "POST") {
        // Public: anyone can request an appointment with their REO.
        const b = await readBody<Record<string, unknown>>(request);
        const name = asString(b.name, 120);
        const email = asString(b.email, 254).toLowerCase();
        const region = asString(b.region, 40);
        const reoName = asString(b.reoName, 120);
        const date = asString(b.date, 20);
        const subject = asString(b.subject, 180);
        if (!name) return err("Name is required.", 422);
        if (!email || !isEmail(email)) {
          return err("A valid email address is required.", 422);
        }
        if (!region) return err("A region is required.", 422);
        if (!date) return err("A preferred date is required.", 422);
        if (!subject) return err("A subject is required.", 422);
        const now = new Date().toISOString();
        const newId = `appt-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO appointments (id,region,regionName,reoName,name,email,phone,date,time,subject,notes,status,createdAt)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId,
            region,
            optionalString(b.regionName, 120),
            reoName,
            name,
            email,
            optionalString(b.phone, 40),
            date,
            optionalString(b.time, 40),
            subject,
            optionalString(b.notes, 3_000),
            "requested",
            now,
          )
          .run();
        return json(
          await env.DB.prepare("SELECT * FROM appointments WHERE id = ?").bind(newId).first(),
          201,
        );
      }
      if (method === "PUT" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<{ status?: string }>(request);
        if (b.status && !ALLOWED_APPOINTMENT_STATUSES.has(b.status)) {
          return err("Invalid appointment status.", 422);
        }
        if (b.status) {
          await env.DB.prepare("UPDATE appointments SET status = ? WHERE id = ?").bind(b.status, id).run();
        }
        const row = await env.DB.prepare("SELECT * FROM appointments WHERE id = ?").bind(id).first();
        return row ? json(row) : err("Appointment not found.", 404);
      }
      if (method === "DELETE" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM appointments WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

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

    // ── directory (admin-only: full records incl. sensitive fields) ──────────
    if (resource === "directory") {
      const guard = requireAuth();
      if (guard) return guard;
      if (method === "GET" && !id) {
        const { results } = await env.DB.prepare(
          "SELECT * FROM directory ORDER BY kind, region, name",
        ).all<Record<string, unknown>>();
        return json(results.map(rowToDirectory));
      }
      if (method === "POST") {
        const b = await readBody<Record<string, unknown>>(request);
        const now = new Date().toISOString();
        const newId = `dir-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO directory (id,kind,region,regionName,name,council,status,officials,officeAddress,officePhone,email,facebook,website,comments,createdAt)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId, b.kind ?? "ndc", b.region ?? "", b.regionName ?? "", b.name ?? "",
            b.council ?? "", b.status ?? "", JSON.stringify(b.officials ?? []),
            b.officeAddress ?? "", b.officePhone ?? "", b.email ?? "", b.facebook ?? "",
            b.website ?? "", b.comments ?? "", now,
          )
          .run();
        const row = await env.DB.prepare("SELECT * FROM directory WHERE id = ?").bind(newId).first<Record<string, unknown>>();
        return json(rowToDirectory(row!), 201);
      }
      if (method === "PUT" && id) {
        const b = await readBody<Record<string, unknown>>(request);
        if ("officials" in b) b.officials = JSON.stringify(b.officials);
        const fields = ["kind", "region", "regionName", "name", "council", "status", "officials", "officeAddress", "officePhone", "email", "facebook", "website", "comments"];
        const sets = fields.filter((f) => f in b);
        if (sets.length) {
          const sql = `UPDATE directory SET ${sets.map((f) => `"${f}" = ?`).join(", ")} WHERE id = ?`;
          await env.DB.prepare(sql).bind(...sets.map((f) => b[f]), id).run();
        }
        const row = await env.DB.prepare("SELECT * FROM directory WHERE id = ?").bind(id).first<Record<string, unknown>>();
        return row ? json(rowToDirectory(row)) : err("Directory record not found.", 404);
      }
      if (method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM directory WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

    // ── updates ("What's New" portal changelog) ─────────────────────────────
    // GET is public (like published posts); writes require auth.
    if (resource === "updates") {
      if (method === "GET" && !id) {
        const { results } = await env.DB.prepare(
          'SELECT * FROM updates ORDER BY "order" ASC',
        ).all<Record<string, unknown>>();
        return json(results.map(rowToUpdate));
      }
      if (method === "POST") {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        const now = new Date().toISOString();
        const newId = `update-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO updates (id,version,date,title,summary,icon,sections,"order",createdAt)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId,
            asString(b.version, 40),
            asString(b.date, 60),
            asString(b.title, 200),
            asString(b.summary, 1000),
            asString(b.icon, 60),
            JSON.stringify(Array.isArray(b.sections) ? b.sections : []),
            typeof b.order === "number" ? b.order : 0,
            now,
          )
          .run();
        const row = await env.DB.prepare("SELECT * FROM updates WHERE id = ?").bind(newId).first<Record<string, unknown>>();
        return json(rowToUpdate(row!), 201);
      }
      if (method === "PUT" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        if ("sections" in b) b.sections = JSON.stringify(b.sections);
        const fields = ["version", "date", "title", "summary", "icon", "sections", "order"];
        const sets = fields.filter((f) => f in b);
        if (sets.length) {
          const sql = `UPDATE updates SET ${sets.map((f) => `"${f}" = ?`).join(", ")} WHERE id = ?`;
          await env.DB.prepare(sql).bind(...sets.map((f) => b[f]), id).run();
        }
        const row = await env.DB.prepare("SELECT * FROM updates WHERE id = ?").bind(id).first<Record<string, unknown>>();
        return row ? json(rowToUpdate(row)) : err("Update not found.", 404);
      }
      if (method === "DELETE" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM updates WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

    // ── datasets (generic reference data) ────────────────────────────────────
    // /datasets/:kind  and  /datasets/:kind/:rowId
    // GET is public; sensitive fields are stripped for unauthenticated callers.
    if (resource === "datasets") {
      const kind = id; // segments[1]
      const rowId = segments[2];
      if (!kind) return err("Dataset kind is required.", 400);

      if (method === "GET" && !rowId) {
        const { results } = await env.DB.prepare(
          "SELECT id, data FROM datasets WHERE kind = ? ORDER BY id",
        )
          .bind(kind)
          .all<Record<string, unknown>>();
        return json(results.map((r) => rowToDataset(r, authed, kind)));
      }
      if (method === "POST") {
        const guard = requireAuth();
        if (guard) return guard;
        const b = await readBody<Record<string, unknown>>(request);
        const data = { ...b };
        delete data.id;
        const now = new Date().toISOString();
        const newId = `ds-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          "INSERT INTO datasets (id,kind,data,createdAt) VALUES (?,?,?,?)",
        )
          .bind(newId, kind, JSON.stringify(data), now)
          .run();
        const row = await env.DB.prepare("SELECT id, data FROM datasets WHERE id = ?").bind(newId).first<Record<string, unknown>>();
        return json(rowToDataset(row!, true, kind), 201);
      }
      if (method === "PUT" && rowId) {
        const guard = requireAuth();
        if (guard) return guard;
        const existing = await env.DB.prepare("SELECT data FROM datasets WHERE id = ?").bind(rowId).first<Record<string, unknown>>();
        if (!existing) return err("Record not found.", 404);
        let current: Record<string, unknown> = {};
        try {
          current = JSON.parse(String(existing.data)) as Record<string, unknown>;
        } catch {
          /* corrupt — replace */
        }
        const b = await readBody<Record<string, unknown>>(request);
        const patch = { ...b };
        delete patch.id;
        await env.DB.prepare("UPDATE datasets SET data = ? WHERE id = ?")
          .bind(JSON.stringify({ ...current, ...patch }), rowId)
          .run();
        const row = await env.DB.prepare("SELECT id, data FROM datasets WHERE id = ?").bind(rowId).first<Record<string, unknown>>();
        return json(rowToDataset(row!, true, kind));
      }
      if (method === "DELETE" && rowId) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM datasets WHERE id = ?").bind(rowId).run();
        return json(null, 204);
      }
    }

    // ── users (staff accounts + roles) — ADMIN ONLY ─────────────────────────
    if (resource === "users") {
      const guard = requireAdmin();
      if (guard) return guard;
      const rowToUser = (r: Record<string, unknown>) => ({
        id: r.id,
        username: r.username,
        name: r.name,
        email: r.email,
        role: r.role,
        active: Number(r.active) === 1,
        createdAt: r.createdAt,
      });

      if (method === "GET" && !id) {
        const { results } = await env.DB.prepare(
          "SELECT * FROM users ORDER BY name",
        ).all<Record<string, unknown>>();
        return json(results.map(rowToUser));
      }
      if (method === "POST") {
        const b = await readBody<Record<string, unknown>>(request);
        const username = asString(b.username, 60).toLowerCase().replace(/\s+/g, "");
        const name = asString(b.name, 120);
        const password = asString(b.password, 200);
        const userRole = ALLOWED_ROLES.has(String(b.role)) ? String(b.role) : "editor";
        if (!username) return err("Username is required.", 422);
        if (!name) return err("Name is required.", 422);
        if (password.length < 8) return err("Password must be at least 8 characters.", 422);
        const exists = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
        if (exists) return err("That username is already taken.", 409);
        const salt = randomSaltHex();
        const hash = await hashPassword(password, salt);
        const newId = `user-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO users (id,username,name,email,role,passwordSalt,passwordHash,active,createdAt)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
          .bind(newId, username, name, optionalString(b.email, 254), userRole, salt, hash, 1, new Date().toISOString())
          .run();
        const row = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(newId).first<Record<string, unknown>>();
        return json(rowToUser(row!), 201);
      }
      if (method === "PUT" && id) {
        const b = await readBody<Record<string, unknown>>(request);
        const sets: string[] = [];
        const vals: unknown[] = [];
        if (typeof b.name === "string") { sets.push("name = ?"); vals.push(asString(b.name, 120)); }
        if ("email" in b) { sets.push("email = ?"); vals.push(optionalString(b.email, 254)); }
        if (ALLOWED_ROLES.has(String(b.role))) { sets.push("role = ?"); vals.push(String(b.role)); }
        if (typeof b.active === "boolean") { sets.push("active = ?"); vals.push(b.active ? 1 : 0); }
        if (typeof b.password === "string" && b.password) {
          if (b.password.length < 8) return err("Password must be at least 8 characters.", 422);
          const salt = randomSaltHex();
          sets.push("passwordSalt = ?"); vals.push(salt);
          sets.push("passwordHash = ?"); vals.push(await hashPassword(b.password, salt));
        }
        if (!sets.length) return err("Nothing to update.", 422);
        await env.DB.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).bind(...vals, id).run();
        const row = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<Record<string, unknown>>();
        return row ? json(rowToUser(row)) : err("User not found.", 404);
      }
      if (method === "DELETE" && id) {
        if (auth && auth.sub === id) return err("You cannot delete your own account.", 422);
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
        return json(null, 204);
      }
    }

    // health check
    if (resource === "health") return json({ ok: true, mode: "live" });

    return err(`Not found: /${segments.join("/")}`, 404);
  } catch (e) {
    return err(`Server error: ${(e as Error).message}`, 500);
  }
};
