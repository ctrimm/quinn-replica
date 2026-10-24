#!/usr/bin/env python3
"""Regenerate the responsive image variants in public/images/.

Run after replacing any photo in public/images/:
    python3 scripts/optimize-images.py
Needs Pillow:  pip install Pillow
Variants are named <name>-<width>.jpg next to the original; the site's
imgSrcset() helper picks up whichever variants exist, so this is optional
-but without it, mobile visitors download the full-size originals.
"""
from pathlib import Path
from PIL import Image, ImageFilter

IMAGES = Path(__file__).resolve().parent.parent / "public" / "images"
PLAN = {"hero": [480, 960], "work": [480, 1600], "default": [550]}

for f in sorted(IMAGES.glob("*.jpg")):
    if any(f.stem.endswith(f"-{w}") for w in (480, 550, 960, 1600)):
        continue  # that's a variant, not a source
    widths = PLAN["hero"] if f.stem == "hero" else PLAN["work"] if f.stem.startswith("work-") else PLAN["default"]
    im = Image.open(f)
    w, h = im.size
    for t in widths:
        out = f.with_name(f"{f.stem}-{t}{f.suffix}")
        v = im.resize((t, int(h * t / w)), Image.LANCZOS)
        if t > w:  # enlarged variant for retina displays
            v = v.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
        v.save(out, quality=80, optimize=True)
        print(out.name, v.size)
