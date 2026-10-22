#!/usr/bin/env python3
"""Generate Android launcher resources from android-capacitor/assets/icon.png."""
from pathlib import Path
from PIL import Image
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
source = root / "assets" / "icon.png"
res = root / "android" / "app" / "src" / "main" / "res"
if not source.is_file():
    raise SystemExit(f"Icon not found: {source}")
im = Image.open(source).convert("RGBA")
if min(im.size) < 192:
    raise SystemExit(f"Icon must be at least 192x192; got {im.size}")
# Crop centered square to avoid distorted launcher artwork.
side = min(im.size)
left = (im.width - side) // 2
top = (im.height - side) // 2
im = im.crop((left, top, left + side, top + side))
# Preserve the transparent surround and keep the full squircle inside Android's
# adaptive icon safe area. Android masks adaptive icons into different shapes.
densities = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for density, size in densities.items():
    dest = res / f"mipmap-{density}"
    dest.mkdir(parents=True, exist_ok=True)
    legacy_icon = im.resize((size, size), Image.Resampling.LANCZOS)
    for filename in ("ic_launcher.png", "ic_launcher_round.png"):
        legacy_icon.save(dest / filename, optimize=True)
    # Foreground canvas is 108dp; keep artwork within central 72dp safe zone.
    foreground = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    art_size = round(size * 0.64)
    art = im.resize((art_size, art_size), Image.Resampling.LANCZOS)
    offset = (size - art_size) // 2
    foreground.alpha_composite(art, (offset, offset))
    foreground.save(dest / "ic_launcher_foreground.png", optimize=True)
# The Capacitor starter's adaptive icon resources can override the legacy icon.
# Replace adaptive launcher XML with a background + the supplied artwork.
# Adaptive icons require API 26+. Never place adaptive-icon XML in mipmap-anydpi.
legacy = res / "mipmap-anydpi"
for filename in ("ic_launcher.xml", "ic_launcher_round.xml"):
    (legacy / filename).unlink(missing_ok=True)
for folder in (res / "mipmap-anydpi-v26",):
    folder.mkdir(parents=True, exist_ok=True)
    for filename in ("ic_launcher.xml", "ic_launcher_round.xml"):
        (folder / filename).write_text(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
            '  <background android:drawable="@android:color/transparent" />\n'
            '  <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n'
            '</adaptive-icon>\n', encoding="utf-8")
print(f"Generated Android launcher resources from {source} ({im.size[0]}px).")
