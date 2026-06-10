#!/usr/bin/env python
"""
Import & clean the ministry's "Website Information - Agencies & Administrators"
spreadsheet into the portal's data files.

It enforces a public-vs-sensitive split:

  PUBLIC  (written to src/data/*.json, bundled & served on the public directories)
    - council/town/group names, regions
    - office-holder NAMES + TITLES
    - institutional contact only: office address, office landline, official
      email, Facebook, website
    - CDCs: ACTIVE groups only

  ADMIN-ONLY (written to src/lib/data/seed-directory.ts + scripts/d1-seed-directory.sql,
              surfaced only inside /admin behind login)
    - every record in full, INCLUDING personal mobile numbers, personal email
      addresses, NDC operational "Comments", and inactive CDCs.

Re-run after the client updates the sheet:
    python scripts/import-agencies.py ["path/to/xlsx"]
"""
import json, re, sys, pathlib
import openpyxl

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_XLSX = pathlib.Path.home() / "Downloads" / "Website Information - Agencies & Administrators.xlsx"
XLSX = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX

REGIONS = {
    1: "Barima-Waini", 2: "Pomeroon-Supenaam", 3: "Essequibo Islands-West Demerara",
    4: "Demerara-Mahaica", 5: "Mahaica-Berbice", 6: "East Berbice-Corentyne",
    7: "Cuyuni-Mazaruni", 8: "Potaro-Siparuni", 9: "Upper Takutu-Upper Essequibo",
    10: "Upper Demerara-Berbice",
}

# ── cleaning helpers ─────────────────────────────────────────────────────────

def fix_text(v):
    if v is None:
        return ""
    s = str(v).strip()
    s = s.replace("�", "'").replace("’", "'")  # mojibake / curly apostrophe
    s = re.sub(r"\s+", " ", s)
    return s

def clean_phone(v):
    """Normalise a phone cell. Excel turned some into floats (e.g. 3333120.0)."""
    if v is None:
        return ""
    if isinstance(v, float):
        v = int(v)
    s = str(v).strip()
    s = re.sub(r"\.0$", "", s)
    s = s.replace("�", "").strip()
    if s.lower() in ("nil", "n/a", "na", "none", "-", ""):
        return ""
    # Single clean 7-digit local number -> XXX-XXXX
    if re.fullmatch(r"\d{7}", s):
        return f"{s[:3]}-{s[3:]}"
    return re.sub(r"\s+", " ", s)

def looks_personal_email(e):
    e = (e or "").lower()
    return any(d in e for d in ("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "guysuco.com"))

def slugify(name):
    s = name.lower().replace("&", " and ")
    s = s.replace("/", " ")
    s = re.sub(r"['’.]", "", s)        # drop apostrophes/periods (Matthew's -> matthews)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")

def region_label(n):
    return f"Region {n}"

# ── load workbook ────────────────────────────────────────────────────────────

if not XLSX.exists():
    sys.exit(f"Spreadsheet not found: {XLSX}")
wb = openpyxl.load_workbook(XLSX, data_only=True)

def rows(sheet):
    out = []
    for r in wb[sheet].iter_rows(values_only=True):
        out.append(list(r))
    return out

# Accumulators
public_rdcs, public_munis, public_ndcs, public_cdcs = [], [], [], []
admin_entries = []  # full DirectoryEntry records (with sensitive fields)

def add_admin(kind, region, name, *, council="", status="", officials=None,
              office_address="", office_phone="", email="", facebook="", website="",
              comments="", region_name=""):
    admin_entries.append({
        "kind": kind, "region": region, "regionName": region_name, "name": name,
        "council": council, "status": status, "officials": officials or [],
        "officeAddress": office_address, "officePhone": office_phone, "email": email,
        "facebook": facebook, "website": website, "comments": comments,
    })

# ── 1. RDCs & Municipalities sheet ───────────────────────────────────────────
rm = rows("RDCs and Municipalities")
for r in rm:
    c0 = fix_text(r[0])
    m = re.match(r"^(\d{1,2})\s+(.*)$", c0)
    if not m or "Municipality" in c0:
        continue
    rn = int(m.group(1))
    if rn not in REGIONS:
        continue
    region, region_name = region_label(rn), REGIONS[rn]
    reo, dreo, rho, redo, eho = (fix_text(r[i]) for i in range(1, 6))
    address = fix_text(r[6]); phone = clean_phone(r[7]); email = fix_text(r[8])
    facebook = fix_text(r[9]); website = fix_text(r[10]) if len(r) > 10 else ""
    officials = [
        {"role": "Regional Executive Officer (REO)", "name": reo},
        {"role": "Deputy REO", "name": dreo},
        {"role": "Regional Health Officer (RHO)", "name": rho},
        {"role": "Regional Education & Dev. Officer (REDO)", "name": redo},
        {"role": "Environmental Health Officer (EHO)", "name": eho},
    ]
    officials = [o for o in officials if o["name"]]
    # PUBLIC: names+titles + institutional contact (office email/phone/address/socials)
    public_rdcs.append({
        "region": region, "name": region_name,
        "council": f"Regional Democratic Council, {region}",
        "address": address, "phone": phone,
        "email": email, "facebook": facebook, "website": website,
        "officials": officials,
    })
    # ADMIN: same (RDC contacts here are institutional, no extra personal fields)
    add_admin("rdc", region, region_name, council=f"Regional Democratic Council, {region}",
              officials=officials, office_address=address, office_phone=phone,
              email=email, facebook=facebook, website=website, region_name=region_name)

# Municipalities — merge region from existing municipalities.json by name
existing_munis = json.loads((ROOT / "src/data/municipalities.json").read_text(encoding="utf-8"))
def muni_region(name):
    n = slugify(name)
    for em in existing_munis:
        if slugify(em["name"]) == n or n.startswith(slugify(em["name"])[:6]):
            return em["region"], em["regionName"], em.get("type", "Town")
    return "", "", "Town"

in_muni = False
for r in rm:
    c0 = fix_text(r[0])
    if c0 == "Municipality":
        in_muni = True; continue
    if not in_muni or not c0 or c0.startswith("Regional Democratic Council"):
        continue
    mayor = fix_text(r[1]); mayor_phone = clean_phone(r[2]); mayor_email = fix_text(r[3])
    dmayor = fix_text(r[4]); dmayor_phone = clean_phone(r[5]); dmayor_email = fix_text(r[6])
    clerk = fix_text(r[7]); clerk_phone = clean_phone(r[8]); clerk_email = fix_text(r[9])
    region, region_name, mtype = muni_region(c0)
    officials_public = [
        {"role": "Mayor", "name": mayor},
        {"role": "Deputy Mayor", "name": dmayor},
        {"role": "Town Clerk", "name": clerk},
    ]
    officials_public = [o for o in officials_public if o["name"]]
    # PUBLIC: names + titles only (all municipal numbers/emails are personal mobiles/gmail)
    public_munis.append({
        "name": c0, "type": mtype, "region": region, "regionName": region_name,
        "officials": officials_public,
    })
    # ADMIN: full personal contacts
    officials_admin = [
        {"role": "Mayor", "name": mayor, "personalPhone": mayor_phone, "email": mayor_email},
        {"role": "Deputy Mayor", "name": dmayor, "personalPhone": dmayor_phone, "email": dmayor_email},
        {"role": "Town Clerk", "name": clerk, "personalPhone": clerk_phone, "email": clerk_email},
    ]
    add_admin("municipality", region, c0, officials=[o for o in officials_admin if o["name"]],
              region_name=region_name, council=mtype)

# ── 2. NDC sheet ─────────────────────────────────────────────────────────────
cur_region = None
for r in rows("NDC"):
    c0 = fix_text(r[0])
    rm2 = re.match(r"^region\s*#?\s*(\d+)\b", c0, re.I)
    if rm2:
        cur_region = int(rm2.group(1)); continue
    if not re.match(r"^\d+(\.\d+)?$", c0):  # data rows start with a number like "1.0"
        continue
    if cur_region is None:
        continue
    name = fix_text(r[1])
    if not name:
        continue
    office = clean_phone(r[2])
    chair, chair_m = fix_text(r[3]), clean_phone(r[4])
    deputy, deputy_m = fix_text(r[5]), clean_phone(r[6])
    overseer, overseer_m = fix_text(r[7]), clean_phone(r[8])
    comments = fix_text(r[9]) if len(r) > 9 else ""
    region, region_name = region_label(cur_region), REGIONS[cur_region]
    # PUBLIC: matches existing ndcs.json shape (names + office landline only)
    public_ndcs.append({
        "slug": slugify(name), "name": name, "region": region, "regionName": region_name,
        "contact": {"chairperson": chair, "deputy": deputy, "overseer": overseer,
                    "officeNumber": office},
    })
    # ADMIN: + personal mobiles + comments
    add_admin("ndc", region, name, office_phone=office, comments=comments,
              region_name=region_name,
              officials=[o for o in [
                  {"role": "Chairperson", "name": chair, "personalPhone": chair_m},
                  {"role": "Deputy Chairperson", "name": deputy, "personalPhone": deputy_m},
                  {"role": "Overseer", "name": overseer, "personalPhone": overseer_m},
              ] if o["name"]])

# ── 3. CDC sheet ─────────────────────────────────────────────────────────────
cur_region = None
for r in rows("CDC"):
    c0 = fix_text(r[0])
    rm3 = re.match(r"^region\s*#?\s*(\d+)\b", c0, re.I)
    if rm3:
        cur_region = int(rm3.group(1)); continue
    if not c0 or c0.upper() in ("NAME OF GROUP",) or cur_region is None:
        continue
    chairman = fix_text(r[1]) if len(r) > 1 else ""
    status = (fix_text(r[2]) if len(r) > 2 else "").lower()
    status = "inactive" if status.startswith("inact") else ("active" if status.startswith("act") else "")
    region, region_name = region_label(cur_region), REGIONS[cur_region]
    # PUBLIC: active only, name + chairman + region
    if status != "inactive":
        public_cdcs.append({"region": region, "regionName": region_name,
                            "name": c0, "chairman": chairman})
    # ADMIN: all incl. inactive + status flag
    add_admin("cdc", region, c0, status=status or "active", region_name=region_name,
              officials=[{"role": "Chairman", "name": chairman}] if chairman else [])

# ── write public JSON (safe subset) ──────────────────────────────────────────
def write_json(rel, data):
    (ROOT / rel).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  wrote {rel}  ({len(data)} records)")

print("PUBLIC directories:")
write_json("src/data/rdcs.json", public_rdcs)
write_json("src/data/municipalities.json", public_munis)
write_json("src/data/ndcs.json", public_ndcs)
write_json("src/data/cdcs.json", public_cdcs)

# ── assign ids / timestamps ──────────────────────────────────────────────────
for i, e in enumerate(admin_entries):
    e["id"] = f"dir-{e['kind']}-{i:03d}"
    e["createdAt"] = "2026-01-01T00:00:00.000Z"

# ── SAFE seed (COMMITTED) — src/lib/data/seed-directory.ts ───────────────────
# Strips every sensitive field so it is safe to commit to the PUBLIC repo and
# bundle for the demo: NO personal mobiles, NO personal emails, NO comments.
# Used as the admin's demo-mode dataset; in live mode the admin reads the full
# records from D1 instead.
def safe_official(o):
    out = {"role": o["role"], "name": o["name"]}
    if o.get("officePhone"):
        out["officePhone"] = o["officePhone"]
    return out

safe_entries = []
for e in admin_entries:
    safe_entries.append({
        "id": e["id"], "kind": e["kind"], "region": e["region"],
        "regionName": e["regionName"], "name": e["name"], "council": e["council"],
        "status": e["status"],
        "officials": [safe_official(o) for o in e["officials"]],
        "officeAddress": e["officeAddress"], "officePhone": e["officePhone"],
        "email": e["email"] if e["kind"] == "rdc" else "",  # RDC email is institutional
        "facebook": e["facebook"], "website": e["website"],
        "comments": "",  # never commit comments
        "createdAt": e["createdAt"],
    })

ts = (
    "/**\n"
    " * SAFE directory seed (NDC / RDC / Municipality / CDC officials) for the admin\n"
    " * in DEMO mode. GENERATED by scripts/import-agencies.py — do not hand-edit.\n"
    " *\n"
    " * Sensitive fields (personal mobile numbers, personal emails, NDC operational\n"
    " * comments) are intentionally STRIPPED here because this file is committed to the\n"
    " * public repo. In LIVE mode the admin reads the full records from D1, seeded from\n"
    " * scripts/d1-seed-directory.sql (git-ignored).\n"
    " */\n"
    'import type { DirectoryEntry } from "./types";\n\n'
    f"export const seedDirectory: DirectoryEntry[] = {json.dumps(safe_entries, indent=2, ensure_ascii=False)};\n"
)
(ROOT / "src/lib/data/seed-directory.ts").write_text(ts, encoding="utf-8")
print(f"SAFE admin seed (committed): src/lib/data/seed-directory.ts  ({len(safe_entries)} records)")

# ── D1 seed for the directory table (admin-only, full records) ───────────────
def sql_str(v):
    return "'" + str(v).replace("'", "''") + "'"

lines = [
    "-- Admin-only directory records (full, incl. sensitive fields).",
    "-- GENERATED by scripts/import-agencies.py. Apply after d1-schema.sql:",
    "--   wrangler d1 execute mlgrd --remote --file=scripts/d1-seed-directory.sql",
    "",
]
for e in admin_entries:
    lines.append(
        "INSERT OR IGNORE INTO directory (id,kind,region,regionName,name,council,status,officials,officeAddress,officePhone,email,facebook,website,comments,createdAt) VALUES ("
        + ",".join([
            sql_str(e["id"]), sql_str(e["kind"]), sql_str(e["region"]), sql_str(e["regionName"]),
            sql_str(e["name"]), sql_str(e["council"]), sql_str(e["status"]),
            sql_str(json.dumps(e["officials"], ensure_ascii=False)),
            sql_str(e["officeAddress"]), sql_str(e["officePhone"]), sql_str(e["email"]),
            sql_str(e["facebook"]), sql_str(e["website"]), sql_str(e["comments"]),
            sql_str(e["createdAt"]),
        ]) + ");"
    )
(ROOT / "scripts/d1-seed-directory.sql").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"ADMIN D1 seed: scripts/d1-seed-directory.sql")

print("\nSUMMARY")
print(f"  RDCs:           {len(public_rdcs)}")
print(f"  Municipalities: {len(public_munis)}")
print(f"  NDCs:           {len(public_ndcs)}")
print(f"  CDCs (public/active): {len(public_cdcs)}")
print(f"  Admin directory total: {len(admin_entries)}")
