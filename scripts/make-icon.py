#!/usr/bin/env python3
"""
Draw the app icon: a tumour cell on the dark field of the figure.

Renders a 1024px master, writes an .iconset, and lets iconutil produce the
.icns. Uses Pillow from the repo's .venv-pillow if present.
"""

import math
import os
import random
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "build" / "icon"
S = 1024


def blob(cx, cy, r, wob, n, seed, squash=1.0):
    """Organic closed outline, same idea as the figure's membranes."""
    rnd = random.Random(seed)
    offs = [rnd.uniform(-1, 1) for _ in range(n)]
    pts = []
    steps = 360
    for i in range(steps):
        a = i / steps * math.tau
        k = a / math.tau * n
        i0 = int(k) % n
        i1 = (i0 + 1) % n
        t = k - int(k)
        t = t * t * (3 - 2 * t)  # smoothstep between control offsets
        rr = r * (1 + wob * (offs[i0] * (1 - t) + offs[i1] * t))
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr * squash))
    return pts


def radial(size, inner, outer, power=1.0):
    """Radial gradient image, inner colour at the centre."""
    img = Image.new("RGBA", (size, size))
    px = img.load()
    c = size / 2
    for y in range(size):
        for x in range(size):
            d = min(1.0, math.hypot(x - c, y - c) / c) ** power
            px[x, y] = tuple(round(inner[i] + (outer[i] - inner[i]) * d) for i in range(4))
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    iconset = OUT / "icon.iconset"
    iconset.mkdir(exist_ok=True)

    # dark field, matching the figure's background
    img = radial(S, (24, 44, 62, 255), (7, 14, 21, 255), 1.2)
    d = ImageDraw.Draw(img, "RGBA")

    # ambient glow behind the cell
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([S * 0.1, S * 0.1, S * 0.9, S * 0.9], fill=(255, 95, 133, 70))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(S * 0.09)))

    cx = cy = S / 2
    # membrane
    d.polygon(blob(cx, cy, S * 0.345, 0.085, 13, 11), fill=(214, 70, 108, 255))

    # cytoplasm shading, blurred so the layers read as one gradient
    cyto = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    dc = ImageDraw.Draw(cyto, "RGBA")
    dc.polygon(blob(cx - S * 0.02, cy - S * 0.025, S * 0.30, 0.075, 12, 23), fill=(255, 118, 152, 255))
    dc.polygon(blob(cx - S * 0.05, cy - S * 0.06, S * 0.225, 0.07, 11, 31), fill=(255, 156, 180, 235))
    dc.polygon(blob(cx - S * 0.075, cy - S * 0.09, S * 0.14, 0.07, 10, 37), fill=(255, 190, 206, 190))
    cyto = cyto.filter(ImageFilter.GaussianBlur(S * 0.022))
    img.alpha_composite(cyto)

    # vesicles, soft and sparse
    ves = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    dv = ImageDraw.Draw(ves, "RGBA")
    rnd = random.Random(7)
    for _ in range(7):
        a = rnd.uniform(0, math.tau)
        rr = rnd.uniform(0.17, 0.27) * S
        sz = rnd.uniform(0.014, 0.026) * S
        x, y = cx + math.cos(a) * rr, cy + math.sin(a) * rr
        dv.ellipse([x - sz, y - sz, x + sz, y + sz], fill=(255, 214, 226, 70))
    img.alpha_composite(ves.filter(ImageFilter.GaussianBlur(S * 0.006)))

    # nucleus
    nuc = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    dn = ImageDraw.Draw(nuc, "RGBA")
    dn.polygon(blob(cx + S * 0.02, cy + S * 0.03, S * 0.15, 0.1, 11, 41, squash=0.92), fill=(138, 34, 64, 255))
    dn.polygon(blob(cx + S * 0.025, cy + S * 0.035, S * 0.132, 0.1, 11, 41, squash=0.92), fill=(96, 21, 46, 255))
    nuc = nuc.filter(ImageFilter.GaussianBlur(S * 0.004))
    img.alpha_composite(nuc)

    # nucleolus
    halo = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse(
        [cx - S * 0.028, cy - S * 0.022, cx + S * 0.032, cy + S * 0.038],
        fill=(188, 84, 114, 210),
    )
    img.alpha_composite(halo.filter(ImageFilter.GaussianBlur(S * 0.008)))

    master = OUT / "icon_1024.png"
    img.save(master)

    for size in (16, 32, 64, 128, 256, 512, 1024):
        img.resize((size, size), Image.LANCZOS).save(iconset / f"icon_{size}x{size}.png")
        if size <= 512:
            img.resize((size * 2, size * 2), Image.LANCZOS).save(
                iconset / f"icon_{size}x{size}@2x.png"
            )

    icns = OUT / "icon.icns"
    r = subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(icns)])
    if r.returncode != 0:
        print("iconutil failed; the app will use the default icon", file=sys.stderr)
        return 1
    print(f"icon: {icns}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
