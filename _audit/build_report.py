"""
Build a designed PDF security report (with charts) from the audit findings.

Pipeline:  matplotlib -> PNG charts  ->  styled HTML  ->  Playwright (system Chrome) -> PDF
Output:    ../SECURITY-AUDIT.pdf   (charts in ./charts/, report HTML in ./report.html)
"""
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import matplotlib.font_manager as fm

HERE = Path(__file__).parent
CHARTS = HERE / "charts"
CHARTS.mkdir(exist_ok=True)

# ── Palette ─────────────────────────────────────────────────────────────────
GREEN  = "#009E49"   # Guyana flag green
GOLD   = "#FCD116"   # Guyana flag gold
RED    = "#CE1126"   # Guyana flag red
INK    = "#0F172A"
SLATE  = "#475569"
MIST   = "#E2E8F0"
HIGH   = "#CE1126"
MED    = "#F59E0B"
LOW    = "#2563EB"
OK     = "#059669"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.edgecolor": SLATE,
    "axes.linewidth": 0.8,
    "text.color": INK,
    "axes.labelcolor": INK,
    "xtick.color": SLATE,
    "ytick.color": SLATE,
    "figure.dpi": 200,
})

def save(fig, name):
    fig.savefig(CHARTS / name, bbox_inches="tight", transparent=True)
    plt.close(fig)

# ── 1. Severity distribution (donut) ────────────────────────────────────────
def chart_severity():
    labels = ["High", "Medium", "Low"]
    vals   = [2, 4, 1]
    cols   = [HIGH, MED, LOW]
    fig, ax = plt.subplots(figsize=(4.4, 4.4))
    wedges, _ = ax.pie(vals, colors=cols, startangle=90,
                       wedgeprops=dict(width=0.42, edgecolor="white", linewidth=3))
    ax.text(0, 0.12, "7", ha="center", va="center", fontsize=34, fontweight="bold", color=INK)
    ax.text(0, -0.22, "finding groups", ha="center", va="center", fontsize=11, color=SLATE)
    for w, l, v, c in zip(wedges, labels, vals, cols):
        ang = (w.theta2 + w.theta1) / 2
        import math
        x, y = 1.18*math.cos(math.radians(ang)), 1.18*math.sin(math.radians(ang))
        ax.text(x, y, f"{l}\n{v}", ha="center", va="center", fontsize=11,
                fontweight="bold", color=c)
    ax.set(aspect="equal")
    save(fig, "severity.png")

# ── 2. Risk matrix (likelihood x impact) ────────────────────────────────────
def chart_riskmatrix():
    # (id, likelihood 1-3, impact 1-3, severity color, label dx, dy)
    pts = [
        ("F-01", 3, 3, HIGH, 0.12, 0.10),
        ("F-02", 2, 3, HIGH, 0.12, 0.10),
        ("F-03", 3, 2, MED, 0.12, -0.16),
        ("F-04", 3, 2, MED, 0.12, 0.12),
        ("F-05", 2, 3, MED, -0.30, -0.18),
        ("F-06", 1, 3, MED, 0.12, 0.10),
        ("F-07", 2, 1, LOW, 0.12, 0.10),
    ]
    fig, ax = plt.subplots(figsize=(5.6, 4.6))
    # background risk gradient cells
    for i in range(1, 4):
        for j in range(1, 4):
            score = i * j
            c = OK if score <= 2 else (GOLD if score <= 4 else (MED if score <= 6 else HIGH))
            ax.add_patch(plt.Rectangle((i-0.5, j-0.5), 1, 1, color=c, alpha=0.16, zorder=0))
    for label, lk, im, c, dx, dy in pts:
        ax.scatter(lk, im, s=520, color=c, edgecolor="white", linewidth=2, zorder=3, alpha=0.92)
        ax.text(lk+dx, im+dy, label, fontsize=9.5, fontweight="bold", color=INK, zorder=4)
    ax.set_xlim(0.5, 3.6); ax.set_ylim(0.5, 3.6)
    ax.set_xticks([1, 2, 3]); ax.set_xticklabels(["Low", "Medium", "High"])
    ax.set_yticks([1, 2, 3]); ax.set_yticklabels(["Low", "Medium", "High"])
    ax.set_xlabel("Likelihood / ease of exploitation", fontweight="bold")
    ax.set_ylabel("Business impact", fontweight="bold")
    for s in ["top", "right"]:
        ax.spines[s].set_visible(False)
    ax.set_axisbelow(True)
    save(fig, "riskmatrix.png")

# ── 3. Security control coverage (diverging bars) ───────────────────────────
def chart_controls():
    cats = ["HTTP security\nheaders", "Auth hardening\n(2FA / rate-limit)",
            "Info-disclosure\ncontrols", "File / endpoint\nlockdown", "Transport\n(TLS)"]
    present = [0, 0, 1, 6, 2]
    missing = [6, 3, 4, 1, 1]
    y = range(len(cats))
    fig, ax = plt.subplots(figsize=(6.6, 4.2))
    ax.barh(y, present, color=OK, label="Implemented", height=0.62)
    ax.barh(y, [-m for m in missing], color=HIGH, label="Missing / weak", height=0.62)
    for i, (p, m) in enumerate(zip(present, missing)):
        if p: ax.text(p+0.12, i, str(p), va="center", ha="left", fontsize=10, color=OK, fontweight="bold")
        if m: ax.text(-m-0.12, i, str(m), va="center", ha="right", fontsize=10, color=HIGH, fontweight="bold")
    ax.set_yticks(list(y)); ax.set_yticklabels(cats, fontsize=10)
    ax.axvline(0, color=SLATE, linewidth=1)
    ax.set_xlim(-7, 7); ax.set_xticks([])
    for s in ["top", "right", "bottom"]:
        ax.spines[s].set_visible(False)
    ax.legend(loc="lower right", frameon=False, fontsize=10)
    ax.invert_yaxis()
    save(fig, "controls.png")

# ── 4. Attack-surface comparison (WordPress vs static rebuild) ──────────────
def chart_surface():
    comps = ["Server-side\ncode (PHP)", "Database", "Admin login\npanel", "Third-party\nplugins",
             "File-upload\nhandlers", "Public user\nAPI", "Legacy RPC\n/ cron", "AI / MCP\nendpoint"]
    wp     = [1, 1, 1, 1, 1, 1, 1, 1]
    static = [0, 0, 0, 0, 0, 0, 0, 0]
    x = range(len(comps))
    fig, ax = plt.subplots(figsize=(7.0, 3.9))
    w = 0.4
    ax.bar([i-w/2 for i in x], wp, width=w, color=RED, label="Current WordPress site")
    ax.bar([i+w/2 for i in x], static, width=w, color=GREEN, label="Static rebuild")
    ax.set_xticks(list(x)); ax.set_xticklabels(comps, fontsize=8.4)
    ax.set_yticks([0, 1]); ax.set_yticklabels(["Absent", "Present"])
    ax.set_ylim(0, 1.25)
    ax.text(3.5, 1.12, "WordPress exposes 8 surface classes  •  static rebuild exposes 0",
            ha="center", fontsize=9.5, color=SLATE, style="italic")
    for s in ["top", "right"]:
        ax.spines[s].set_visible(False)
    ax.legend(loc="upper right", frameon=False, fontsize=9.5)
    save(fig, "surface.png")

# ── 5. Remediation roadmap (gantt) ──────────────────────────────────────────
def chart_roadmap():
    rows = [
        ("Kill user/email enumeration", 0, 1, HIGH),
        ("Add security headers + HSTS", 0, 1, HIGH),
        ("De-index staging / remove test pages", 0, 1, MED),
        ("Enforce 2FA + login rate-limit", 0, 1.5, MED),
        ("Patch core + all plugins/themes", 0, 1.5, MED),
        ("Disable MCP/AI + app passwords", 1, 3, MED),
        ("security.txt, cookie SameSite, hide versions", 1, 3, LOW),
        ("WAF, monitoring, off-site backups, reviews", 1.5, 6, OK),
    ]
    fig, ax = plt.subplots(figsize=(7.0, 4.0))
    for i, (label, start, end, c) in enumerate(rows):
        ax.barh(i, end-start, left=start, color=c, height=0.55, alpha=0.92,
                edgecolor="white", linewidth=1)
        ax.text(start+0.05, i, label, va="center", ha="left", fontsize=8.8,
                color="white", fontweight="bold")
    ax.axvspan(0, 1, color=HIGH, alpha=0.05)
    ax.axvspan(1, 1.5, color=MED, alpha=0.05)
    ax.set_xlim(0, 6); ax.set_ylim(-0.6, len(rows)-0.4)
    ax.set_yticks([])
    ax.set_xticks([0, 1, 1.5, 3, 6])
    ax.set_xticklabels(["now", "1 wk", "2 wk", "1 mo", "ongoing"], fontsize=9)
    ax.invert_yaxis()
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.set_xlabel("Relative timeline", fontweight="bold")
    save(fig, "roadmap.png")

# ── 6. CVSS-style severity bars for the CVE watch-list ──────────────────────
def chart_cvss():
    items = [
        ("King Addons (CVE-2025-6327/6325)", 10.0, HIGH),
        ("Elementor Forms upload → RCE (CVE-2025-49387)", 9.8, HIGH),
        ("Royal Addons RCE (CVE-2025-13067)", 9.8, HIGH),
        ("Unlimited Elements LFI (CVE-2026-4659)", 8.8, HIGH),
        ("Elementor file read (CVE-2025-8081)", 6.5, MED),
        ("Elementor upload→RCE (CVE-2023-48777)", 9.6, HIGH),
    ]
    items = sorted(items, key=lambda r: r[1])
    labels = [r[0] for r in items]
    vals = [r[1] for r in items]
    cols = [r[2] for r in items]
    fig, ax = plt.subplots(figsize=(7.0, 3.8))
    y = range(len(items))
    ax.barh(y, vals, color=cols, height=0.62, alpha=0.92, edgecolor="white", linewidth=1)
    for i, v in enumerate(vals):
        ax.text(v + 0.1, i, f"{v:.1f}", va="center", ha="left", fontsize=9.5,
                fontweight="bold", color=INK)
    ax.set_yticks(list(y)); ax.set_yticklabels(labels, fontsize=8.6)
    ax.set_xlim(0, 10.8)
    ax.set_xticks([0, 4.0, 7.0, 9.0, 10.0])
    ax.set_xticklabels(["0", "4.0\nMedium", "7.0\nHigh", "9.0\nCritical", "10"], fontsize=8)
    ax.axvline(7.0, color=MED, linewidth=1, linestyle="--", alpha=0.6)
    ax.axvline(9.0, color=HIGH, linewidth=1, linestyle="--", alpha=0.6)
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.set_xlabel("CVSS v3.1 base score (max severity in the affected component family)",
                  fontweight="bold", fontsize=9)
    save(fig, "cvss.png")

for fn in (chart_severity, chart_riskmatrix, chart_controls, chart_surface,
           chart_roadmap, chart_cvss):
    fn()
print("charts done")
