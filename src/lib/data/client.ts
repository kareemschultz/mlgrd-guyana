/**
 * Pluggable data client.
 *
 * One API surface, two backends chosen at runtime:
 *
 *  - LIVE  (Cloudflare Pages): set NEXT_PUBLIC_API_BASE (usually "" so it calls
 *    same-origin /api/*). Reads/writes hit the Pages Functions + D1.
 *  - DEMO  (GitHub Pages / no backend): falls back to localStorage, seeded from
 *    src/lib/data/seed.ts, so the admin and public pages genuinely work as a
 *    static showcase with in-browser persistence.
 *
 * Selection rule: if NEXT_PUBLIC_API_BASE is defined (even empty string ""), we
 * use the HTTP backend; otherwise demo. On Cloudflare set it to "" in the build
 * env. On GitHub Pages leave it unset.
 *
 * Every method is async and returns plain JSON-serialisable objects so the two
 * adapters are interchangeable.
 */
import type {
  AuthResult,
  DirectoryEntry,
  GalleryItem,
  Message,
  Minister,
  NewDirectoryEntry,
  NewGalleryItem,
  NewMessage,
  NewMinister,
  NewPost,
  Post,
} from "./types";
import { seedGallery, seedMinisters, seedPosts, demoAdmin } from "./seed";
import { seedDirectory } from "./seed-directory";

const API_BASE =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE : undefined;

/** True when a real backend (Cloudflare Functions) should be used. */
export const isLiveBackend = API_BASE !== undefined && API_BASE !== null;

const TOKEN_KEY = "mlgrd:auth";

// ─────────────────────────────────────────────────────────────────────────────
// Token storage (shared by both adapters)
// ─────────────────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthResult;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

function setSession(auth: AuthResult) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(auth));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage (demo) adapter
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  posts: "mlgrd:posts",
  gallery: "mlgrd:gallery",
  ministers: "mlgrd:ministers",
  messages: "mlgrd:messages",
  directory: "mlgrd:directory",
} as const;

/**
 * Bump when the seed content changes so returning visitors (who already have a
 * `mlgrd:*` store in localStorage from a previous visit) get the new content.
 * Citizen-submitted messages are preserved; only seeded collections are reset.
 */
const SEED_VERSION = "2026.06-tags";

function ensureSeedVersion() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem("mlgrd:seedv") === SEED_VERSION) return;
    for (const k of [KEYS.posts, KEYS.gallery, KEYS.ministers, KEYS.directory]) {
      window.localStorage.removeItem(k);
    }
    window.localStorage.setItem("mlgrd:seedv", SEED_VERSION);
  } catch {
    /* ignore */
  }
}

function readStore<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  ensureSeedVersion();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return seed;
  }
}

function writeStore<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `${prefix}-${rand.slice(0, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

const demo = {
  // posts -------------------------------------------------------------------
  listPosts: async (): Promise<Post[]> =>
    readStore(KEYS.posts, seedPosts).sort((a, b) => b.date.localeCompare(a.date)),

  createPost: async (input: NewPost): Promise<Post> => {
    const posts = readStore(KEYS.posts, seedPosts);
    const post: Post = {
      ...input,
      id: uid("post"),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    writeStore(KEYS.posts, [post, ...posts]);
    return post;
  },

  updatePost: async (id: string, patch: Partial<NewPost>): Promise<Post> => {
    const posts = readStore(KEYS.posts, seedPosts);
    const next = posts.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p,
    );
    writeStore(KEYS.posts, next);
    return next.find((p) => p.id === id)!;
  },

  deletePost: async (id: string): Promise<void> => {
    writeStore(
      KEYS.posts,
      readStore(KEYS.posts, seedPosts).filter((p) => p.id !== id),
    );
  },

  // gallery -----------------------------------------------------------------
  listGallery: async (): Promise<GalleryItem[]> =>
    readStore(KEYS.gallery, seedGallery).sort((a, b) => a.order - b.order),

  createGallery: async (input: NewGalleryItem): Promise<GalleryItem> => {
    const items = readStore(KEYS.gallery, seedGallery);
    const item: GalleryItem = { ...input, id: uid("gal"), createdAt: nowIso() };
    writeStore(KEYS.gallery, [...items, item]);
    return item;
  },

  updateGallery: async (
    id: string,
    patch: Partial<NewGalleryItem>,
  ): Promise<GalleryItem> => {
    const items = readStore(KEYS.gallery, seedGallery);
    const next = items.map((g) => (g.id === id ? { ...g, ...patch } : g));
    writeStore(KEYS.gallery, next);
    return next.find((g) => g.id === id)!;
  },

  deleteGallery: async (id: string): Promise<void> => {
    writeStore(
      KEYS.gallery,
      readStore(KEYS.gallery, seedGallery).filter((g) => g.id !== id),
    );
  },

  // ministers ---------------------------------------------------------------
  listMinisters: async (): Promise<Minister[]> =>
    readStore(KEYS.ministers, seedMinisters).sort((a, b) => a.order - b.order),

  createMinister: async (input: NewMinister): Promise<Minister> => {
    const items = readStore(KEYS.ministers, seedMinisters);
    const m: Minister = { ...input, id: uid("minister"), createdAt: nowIso() };
    writeStore(KEYS.ministers, [...items, m]);
    return m;
  },

  updateMinister: async (
    id: string,
    patch: Partial<NewMinister>,
  ): Promise<Minister> => {
    const items = readStore(KEYS.ministers, seedMinisters);
    const next = items.map((m) => (m.id === id ? { ...m, ...patch } : m));
    writeStore(KEYS.ministers, next);
    return next.find((m) => m.id === id)!;
  },

  deleteMinister: async (id: string): Promise<void> => {
    writeStore(
      KEYS.ministers,
      readStore(KEYS.ministers, seedMinisters).filter((m) => m.id !== id),
    );
  },

  // messages ----------------------------------------------------------------
  listMessages: async (): Promise<Message[]> =>
    readStore<Message>(KEYS.messages, []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),

  createMessage: async (input: NewMessage): Promise<Message> => {
    const items = readStore<Message>(KEYS.messages, []);
    const msg: Message = {
      ...input,
      id: uid("msg"),
      status: "new",
      createdAt: nowIso(),
    };
    writeStore(KEYS.messages, [msg, ...items]);
    return msg;
  },

  updateMessage: async (
    id: string,
    patch: Partial<Pick<Message, "status">>,
  ): Promise<Message> => {
    const items = readStore<Message>(KEYS.messages, []);
    const next = items.map((m) => (m.id === id ? { ...m, ...patch } : m));
    writeStore(KEYS.messages, next);
    return next.find((m) => m.id === id)!;
  },

  deleteMessage: async (id: string): Promise<void> => {
    writeStore(
      KEYS.messages,
      readStore<Message>(KEYS.messages, []).filter((m) => m.id !== id),
    );
  },

  // directory (admin) -------------------------------------------------------
  listDirectory: async (): Promise<DirectoryEntry[]> =>
    readStore<DirectoryEntry>(KEYS.directory, seedDirectory),

  createDirectory: async (input: NewDirectoryEntry): Promise<DirectoryEntry> => {
    const items = readStore<DirectoryEntry>(KEYS.directory, seedDirectory);
    const entry: DirectoryEntry = { ...input, id: uid("dir"), createdAt: nowIso() };
    writeStore(KEYS.directory, [...items, entry]);
    return entry;
  },

  updateDirectory: async (
    id: string,
    patch: Partial<NewDirectoryEntry>,
  ): Promise<DirectoryEntry> => {
    const items = readStore<DirectoryEntry>(KEYS.directory, seedDirectory);
    const next = items.map((d) => (d.id === id ? { ...d, ...patch } : d));
    writeStore(KEYS.directory, next);
    return next.find((d) => d.id === id)!;
  },

  deleteDirectory: async (id: string): Promise<void> => {
    writeStore(
      KEYS.directory,
      readStore<DirectoryEntry>(KEYS.directory, seedDirectory).filter((d) => d.id !== id),
    );
  },

  // auth --------------------------------------------------------------------
  login: async (username: string, password: string): Promise<AuthResult> => {
    if (username !== demoAdmin.username || password !== demoAdmin.password) {
      throw new Error("Invalid username or password.");
    }
    const auth: AuthResult = {
      token: `demo.${uid("tok")}`,
      expiresAt: Date.now() + 1000 * 60 * 60 * 8, // 8h
    };
    setSession(auth);
    return auth;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HTTP (Cloudflare Functions) adapter
// ─────────────────────────────────────────────────────────────────────────────

async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth, headers, ...rest } = options;
  const token = auth ? getToken() : null;
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) message = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const http = {
  // Sends the token when present so the admin receives drafts too; public callers
  // have no token and receive published posts only.
  listPosts: () => api<Post[]>("/posts", { auth: true }),
  createPost: (input: NewPost) =>
    api<Post>("/posts", { method: "POST", body: JSON.stringify(input), auth: true }),
  updatePost: (id: string, patch: Partial<NewPost>) =>
    api<Post>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(patch), auth: true }),
  deletePost: (id: string) =>
    api<void>(`/posts/${id}`, { method: "DELETE", auth: true }),

  listGallery: () => api<GalleryItem[]>("/gallery"),
  createGallery: (input: NewGalleryItem) =>
    api<GalleryItem>("/gallery", { method: "POST", body: JSON.stringify(input), auth: true }),
  updateGallery: (id: string, patch: Partial<NewGalleryItem>) =>
    api<GalleryItem>(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(patch), auth: true }),
  deleteGallery: (id: string) =>
    api<void>(`/gallery/${id}`, { method: "DELETE", auth: true }),

  listMinisters: () => api<Minister[]>("/ministers"),
  createMinister: (input: NewMinister) =>
    api<Minister>("/ministers", { method: "POST", body: JSON.stringify(input), auth: true }),
  updateMinister: (id: string, patch: Partial<NewMinister>) =>
    api<Minister>(`/ministers/${id}`, { method: "PUT", body: JSON.stringify(patch), auth: true }),
  deleteMinister: (id: string) =>
    api<void>(`/ministers/${id}`, { method: "DELETE", auth: true }),

  listMessages: () => api<Message[]>("/messages", { auth: true }),
  createMessage: (input: NewMessage) =>
    api<Message>("/messages", { method: "POST", body: JSON.stringify(input) }),
  updateMessage: (id: string, patch: Partial<Pick<Message, "status">>) =>
    api<Message>(`/messages/${id}`, { method: "PUT", body: JSON.stringify(patch), auth: true }),
  deleteMessage: (id: string) =>
    api<void>(`/messages/${id}`, { method: "DELETE", auth: true }),

  // directory reads are admin-only (the public site uses the static safe JSONs).
  listDirectory: () => api<DirectoryEntry[]>("/directory", { auth: true }),
  createDirectory: (input: NewDirectoryEntry) =>
    api<DirectoryEntry>("/directory", { method: "POST", body: JSON.stringify(input), auth: true }),
  updateDirectory: (id: string, patch: Partial<NewDirectoryEntry>) =>
    api<DirectoryEntry>(`/directory/${id}`, { method: "PUT", body: JSON.stringify(patch), auth: true }),
  deleteDirectory: (id: string) =>
    api<void>(`/directory/${id}`, { method: "DELETE", auth: true }),

  login: async (username: string, password: string): Promise<AuthResult> => {
    const auth = await api<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setSession(auth);
    return auth;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Public client — picks the adapter once.
// ─────────────────────────────────────────────────────────────────────────────

const backend = isLiveBackend ? http : demo;

export const data = {
  posts: {
    list: backend.listPosts,
    create: backend.createPost,
    update: backend.updatePost,
    remove: backend.deletePost,
  },
  gallery: {
    list: backend.listGallery,
    create: backend.createGallery,
    update: backend.updateGallery,
    remove: backend.deleteGallery,
  },
  ministers: {
    list: backend.listMinisters,
    create: backend.createMinister,
    update: backend.updateMinister,
    remove: backend.deleteMinister,
  },
  messages: {
    list: backend.listMessages,
    create: backend.createMessage,
    update: backend.updateMessage,
    remove: backend.deleteMessage,
  },
  directory: {
    list: backend.listDirectory,
    create: backend.createDirectory,
    update: backend.updateDirectory,
    remove: backend.deleteDirectory,
  },
  auth: {
    login: backend.login,
    logout: clearSession,
    isAuthenticated,
    getToken,
  },
  /** "live" (Cloudflare) or "demo" (localStorage). */
  mode: isLiveBackend ? ("live" as const) : ("demo" as const),
};
