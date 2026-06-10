"""Render report.html -> ../SECURITY-AUDIT.pdf using Playwright + system Chrome."""
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
html = (HERE / "report.html").resolve().as_uri()
out  = (HERE.parent / "SECURITY-AUDIT.pdf").resolve()

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    page = browser.new_page()
    page.goto(html, wait_until="networkidle")
    page.emulate_media(media="print")
    page.wait_for_timeout(800)  # let webfonts settle
    page.pdf(path=str(out), format="A4", print_background=True,
             margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    browser.close()
print("PDF ->", out)
