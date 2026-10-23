#!/usr/bin/env python3
"""Read-only SafaMarwah design preservation checks. Run: python3 scripts/check_design_preservation.py"""
from pathlib import Path
import re
import sys

html = Path(__file__).resolve().parents[1].joinpath("index.html").read_text(encoding="utf-8")
checks = {
    "Panduan master banner helper": "function smSubpageMasterBanner(" in html,
    "Subpage banner CSS": 'id="sm-subpage-panduan-master-v1"' in html,
    "Kaabah banner image": "kaaba.jpg" in html,
    "Emerald theme meta": 'name="theme-color" content="#14382E"' in html,
    "Shared emerald page color": "#14382E" in html,
    "FAQ rendering": "function phase2Page(type)" in html and "phase2FilterFaq()" in html,
    "Checklist rendering": "function phasePage(type)" in html and "phaseCheck(false)" in html,
    "Language rendering": "function phase3Page(type)" in html and "phase3Text(type)" in html,
    "Article listing": "sm-articles-results" in html,
    "Prayer search": 'id="q"' in html,
    "Footer nav": 'class="bottom' in html or 'class=\'bottom' in html,
    "Responsive media queries": "@media" in html,
}
style_ids = re.findall(r'<style\s+id="([^"]+)"', html)
checks["Unique style IDs"] = len(style_ids) == len(set(style_ids))
checks["Balanced style tags"] = len(re.findall(r"<style(?:\s[^>]*)?>", html)) == len(re.findall(r"</style>", html))
checks["No unresolved merge markers"] = not re.search(r"^(?:<<<<<<< |=======|>>>>>>> )", html, re.M)
for name, passed in checks.items():
    print(f"{'PASS' if passed else 'FAIL'}  {name}")
print(f"Total: {sum(checks.values())}/{len(checks)} checks passed")
print("Note: static checks do not prove browser appearance or functional correctness.")
sys.exit(0 if all(checks.values()) else 1)
