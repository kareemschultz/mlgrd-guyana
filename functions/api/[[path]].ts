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

// ── helpers ──────────────────────────────────────────────────────────────────

const json = (data: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(status === 204 ? null : JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(), ...extra },
  });

const err = (message: string, status = 400) => json({ error: message }, status);

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
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

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signToken(env: Env): Promise<{ token: string; expiresAt: number }> {
  const secret = env.ADMIN_SECRET || "mlgrd-dev-secret-change-me";
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = b64url(enc.encode(JSON.stringify({ exp: expiresAt })));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return { token: `${payload}.${b64url(sig)}`, expiresAt };
}

async function verifyToken(env: Env, token: string | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const secret = env.ADMIN_SECRET || "mlgrd-dev-secret-change-me";
  const key = await hmacKey(secret);
  const expected = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  if (b64url(expected) !== sig) return false;
  try {
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp: number };
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function bearer(request: Request): string | null {
  const h = request.headers.get("Authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

async function readBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
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

// ── entry point ──────────────────────────────────────────────────────────────

export const onRequest = async (ctx: EventContext): Promise<Response> => {
  const { request, env } = ctx;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const segments = ctx.params.path || [];
  const [resource, id, sub] = segments;
  const method = request.method;
  const authed = await verifyToken(env, bearer(request));

  const requireAuth = (): Response | null =>
    authed ? null : err("Unauthorized", 401);

  try {
    if (!env.DB && resource !== "auth") {
      return err("Database binding 'DB' is not configured.", 500);
    }

    // ── auth ────────────────────────────────────────────────────────────────
    if (resource === "auth" && id === "login" && method === "POST") {
      const { username, password } = await readBody<{
        username?: string;
        password?: string;
      }>(request);
      const expectedUser = env.ADMIN_USERNAME || "admin";
      let ok = username === expectedUser;
      if (ok && password) {
        if (env.ADMIN_PASSWORD_HASH) {
          ok = (await sha256Hex(password)) === env.ADMIN_PASSWORD_HASH.toLowerCase();
        } else {
          ok = password === (env.ADMIN_PASSWORD || "mlgrd2026");
        }
      } else {
        ok = false;
      }
      if (!ok) return err("Invalid username or password.", 401);
      return json(await signToken(env));
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
            b.slug ?? "",
            b.title ?? "",
            b.excerpt ?? "",
            b.body ?? "",
            b.category ?? "",
            JSON.stringify(b.tags ?? []),
            b.coverImage ?? null,
            b.sourceUrl ?? null,
            b.status ?? "draft",
            b.date ?? now.slice(0, 10),
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
        return json(rowToPost(updated!));
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
        return json(await env.DB.prepare("SELECT * FROM gallery WHERE id = ?").bind(id).first());
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
        return json(rowToMinister(row!));
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
        const now = new Date().toISOString();
        const newId = `msg-${crypto.randomUUID().slice(0, 8)}`;
        await env.DB.prepare(
          `INSERT INTO messages (id,channel,name,email,subject,category,body,status,createdAt)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
          .bind(
            newId,
            b.channel ?? "contact",
            b.name ?? "",
            b.email ?? "",
            b.subject ?? null,
            b.category ?? null,
            b.body ?? "",
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
        if (b.status) {
          await env.DB.prepare("UPDATE messages SET status = ? WHERE id = ?").bind(b.status, id).run();
        }
        return json(await env.DB.prepare("SELECT * FROM messages WHERE id = ?").bind(id).first());
      }
      if (method === "DELETE" && id) {
        const guard = requireAuth();
        if (guard) return guard;
        await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
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
        return json(rowToDirectory(row!));
      }
      if (method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM directory WHERE id = ?").bind(id).run();
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
