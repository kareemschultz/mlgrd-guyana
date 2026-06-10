-- MLGRD portal — Cloudflare D1 schema.
-- Apply with:  wrangler d1 execute mlgrd --remote --file=scripts/d1-schema.sql
-- (use --local instead of --remote to set up the local dev database)

CREATE TABLE IF NOT EXISTS posts (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL,
  title      TEXT NOT NULL,
  excerpt    TEXT,
  body       TEXT,
  category   TEXT,
  tags       TEXT,
  coverImage TEXT,
  sourceUrl  TEXT,
  status     TEXT NOT NULL DEFAULT 'draft',
  date       TEXT NOT NULL,
  createdAt  TEXT NOT NULL,
  updatedAt  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_status_date ON posts (status, date DESC);

CREATE TABLE IF NOT EXISTS gallery (
  id        TEXT PRIMARY KEY,
  title     TEXT NOT NULL,
  caption   TEXT,
  image     TEXT,
  category  TEXT,
  date      TEXT,
  "order"   INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ministers (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  title     TEXT NOT NULL,
  portrait  TEXT,
  initials  TEXT,
  bio       TEXT,
  profileUrl TEXT,
  termStart TEXT,
  termEnd   TEXT,
  current   INTEGER NOT NULL DEFAULT 1,
  "order"   INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id        TEXT PRIMARY KEY,
  channel   TEXT NOT NULL DEFAULT 'contact',
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  subject   TEXT,
  category  TEXT,
  body      TEXT NOT NULL,
  status    TEXT NOT NULL DEFAULT 'new',
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (createdAt DESC);

-- Local-government directory (NDC / RDC / municipality / CDC officials).
-- Holds the FULL records incl. sensitive fields (personal mobiles, emails,
-- comments); reads are admin-only. Seed with scripts/d1-seed-directory.sql
-- (git-ignored — generated locally by scripts/import-agencies.py).
CREATE TABLE IF NOT EXISTS directory (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL,
  region        TEXT,
  regionName    TEXT,
  name          TEXT NOT NULL,
  council       TEXT,
  status        TEXT,
  officials     TEXT,            -- JSON array of {role,name,officePhone?,personalPhone?,email?}
  officeAddress TEXT,
  officePhone   TEXT,
  email         TEXT,
  facebook      TEXT,
  website       TEXT,
  comments      TEXT,
  createdAt     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_directory_kind ON directory (kind, region);
