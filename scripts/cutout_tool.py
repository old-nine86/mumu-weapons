#!/usr/bin/env python3
"""Brick weapon background remover.

This local tool mirrors the browser upload strategy: conservative border
flood-fill, color/edge protection for brick pieces, and light component
cleanup. It is intentionally dependency-light and only requires Pillow.

Usage:
  python3 scripts/cutout_tool.py input.jpg output.png --mode smart
"""

from __future__ import annotations

import argparse
import math
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageFilter

try:
    import cv2  # type: ignore
    import numpy as np  # type: ignore
except Exception:  # pragma: no cover - optional local tool dependency
    cv2 = None
    np = None


@dataclass(frozen=True)
class Mode:
    threshold: float
    floor: float
    shadow: float
    alpha: int
    component: float
    edge: float


MODES = {
    "smart": Mode(0.72, 0.74, 0.70, 8, 0.0012, 0.38),
    "soft": Mode(0.68, 0.72, 0.68, 8, 0.0015, 0.42),
    "balanced": Mode(0.78, 0.88, 0.82, 12, 0.003, 0.58),
    "clean": Mode(0.90, 1.02, 0.94, 16, 0.006, 0.76),
    "strong": Mode(1.06, 1.18, 1.08, 22, 0.010, 0.95),
}


def median(values: list[float]) -> float:
    if not values:
        return 0
    values = sorted(values)
    return values[len(values) // 2]


def color_stats(samples: list[tuple[int, int, int]]) -> tuple[tuple[float, float, float], float]:
    bg = (median([c[0] for c in samples]), median([c[1] for c in samples]), median([c[2] for c in samples]))
    spread = median([math.dist(c, bg) for c in samples])
    return bg, spread


def edge_strength(px, w: int, h: int, x: int, y: int) -> float:
    left = px[max(0, x - 1), y][:3]
    right = px[min(w - 1, x + 1), y][:3]
    up = px[x, max(0, y - 1)][:3]
    down = px[x, min(h - 1, y + 1)][:3]
    return (sum(abs(left[i] - right[i]) for i in range(3)) + sum(abs(up[i] - down[i]) for i in range(3))) / 2


def brick_protected(rgb, bg, threshold: float) -> bool:
    r, g, b = rgb
    bright = r * 0.299 + g * 0.587 + b * 0.114
    sat = max(rgb) - min(rgb)
    dist = math.dist(rgb, bg)
    red = r > 130 and r > g + 14 and r > b + 14
    yellow = r > 128 and g > 94 and b < 150 and r > b + 24 and g > b + 18
    blue = b > r + 12 and b > g + 2
    cyan = g > r + 8 and b > r + 8 and bright < 232
    pink = r > 138 and b > 96 and g < 180 and r > g + 10
    green = g > r + 10 and g > b + 6 and bright < 225
    brown = r > 92 and g > 48 and b < 82 and r > b + 34 and sat > 54 and bright < 150
    white_brick = bright > 180 and sat < 24 and dist > threshold * 0.7
    dark_brick = bright < 92 and dist > threshold * 0.22
    return (
        (max(rgb) - min(rgb) > 18 and (red or yellow or blue or cyan or pink or green or brown))
        or white_brick
        or dark_brick
    )


def cutout(image: Image.Image, mode: Mode) -> Image.Image:
    image = image.convert("RGBA")
    w, h = image.size
    px = image.load()
    step = max(1, min(w, h) // 36)
    samples: list[tuple[int, int, int]] = []
    for x in range(0, w, step):
        samples.append(px[x, 0][:3])
        samples.append(px[x, h - 1][:3])
    for y in range(0, h, step):
        samples.append(px[0, y][:3])
        samples.append(px[w - 1, y][:3])
    bg, spread = color_stats(samples)
    luminance = bg[0] * 0.299 + bg[1] * 0.587 + bg[2] * 0.114
    bg_sat = max(bg) - min(bg)
    threshold = max(28, min(112, spread * 2.15 + (34 if luminance > 170 else 24))) * mode.threshold

    visited = [[False] * h for _ in range(w)]
    queue: deque[tuple[int, int]] = deque()

    def is_background(x: int, y: int) -> bool:
        rgb = px[x, y][:3]
        dist = math.dist(rgb, bg)
        bright = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114
        sat = max(rgb) - min(rgb)
        edge = edge_strength(px, w, h, x, y)
        protected = brick_protected(rgb, bg, threshold) or (edge > 54 and (sat > 28 or dist > threshold * 0.75))
        chroma = math.dist((rgb[0] - bright, rgb[1] - bright, rgb[2] - bright), (bg[0] - luminance, bg[1] - luminance, bg[2] - luminance))
        warm_floor = rgb[0] > rgb[2] + 10 and rgb[1] > rgb[2] + 4 and sat < 44 and bright > 88
        pale = bright > 176 and sat < 34
        shadow = bright > 42 and bright < luminance - 8 and sat < 38 and chroma < threshold * 0.62
        gray_floor = bg_sat < 46 and sat < 38 and bright > 72 and chroma < threshold * 0.68
        same_surface = sat < 46 and chroma < threshold * 0.62 and edge < 86
        smooth = edge < 72 and sat < 50
        return (not protected) and smooth and (
            dist < threshold
            or same_surface
            or (luminance > 165 and pale and chroma < threshold * 0.72)
            or (bg_sat < 58 and warm_floor and chroma < threshold * mode.floor)
            or gray_floor
            or shadow
        )

    def push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not visited[x][y] and is_background(x, y):
            visited[x][y] = True
            queue.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)
    while queue:
        x, y = queue.popleft()
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)

    for y in range(h):
        for x in range(w):
            rgb = px[x, y][:3]
            bright = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114
            sat = max(rgb) - min(rgb)
            edge = edge_strength(px, w, h, x, y)
            chroma = math.dist((rgb[0] - bright, rgb[1] - bright, rgb[2] - bright), (bg[0] - luminance, bg[1] - luminance, bg[2] - luminance))
            same_surface = sat < 46 and chroma < threshold * 0.62 and edge < 86
            protected = brick_protected(rgb, bg, threshold) or (edge > 54 and (sat > 28 or math.dist(rgb, bg) > threshold * 0.75))
            if visited[x][y] or ((not protected) and (same_surface or (sat < 54 and bright > 58) or (sat < 64 and bright > 78 and chroma < threshold * 1.18))):
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)

    return image.filter(ImageFilter.UnsharpMask(radius=0.6, percent=45, threshold=6))


def trim(image: Image.Image) -> Image.Image:
    bbox = image.getchannel("A").point(lambda a: 255 if a > 18 else 0).getbbox()
    if not bbox:
        return image
    w, h = image.size
    pad = round(min(w, h) * 0.04)
    left, top, right, bottom = bbox
    return image.crop((max(0, left - pad), max(0, top - pad), min(w, right + pad), min(h, bottom + pad)))


def grabcut_cutout(image: Image.Image) -> Image.Image:
    if cv2 is None or np is None:
        return cutout(image, MODES["smart"])
    rgba = image.convert("RGBA")
    rgb = np.array(rgba.convert("RGB"))
    h, w = rgb.shape[:2]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 40, 110)

    # Brick weapons are colorful and have hard rectangular edges. Use those as
    # foreground seeds, then let GrabCut refine shadows and floor contact areas.
    fg_seed = ((sat > 45) & (val > 45)) | ((sat > 28) & (edges > 0))
    fg_seed[: max(2, h // 80), :] = False
    fg_seed[-max(2, h // 80) :, :] = False
    fg_seed[:, : max(2, w // 80)] = False
    fg_seed[:, -max(2, w // 80) :] = False
    ys, xs = np.where(fg_seed)
    if len(xs) < 80:
        return cutout(image, MODES["smart"])

    pad = round(min(w, h) * 0.08)
    x0 = max(1, int(xs.min()) - pad)
    y0 = max(1, int(ys.min()) - pad)
    x1 = min(w - 2, int(xs.max()) + pad)
    y1 = min(h - 2, int(ys.max()) + pad)
    rect = (x0, y0, max(2, x1 - x0), max(2, y1 - y0))

    mask = np.full((h, w), cv2.GC_PR_BGD, dtype=np.uint8)
    border = max(2, min(w, h) // 38)
    mask[:border, :] = cv2.GC_BGD
    mask[-border:, :] = cv2.GC_BGD
    mask[:, :border] = cv2.GC_BGD
    mask[:, -border:] = cv2.GC_BGD
    mask[fg_seed] = cv2.GC_FGD
    bg_model = np.zeros((1, 65), np.float64)
    fg_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(rgb, mask, rect, bg_model, fg_model, 6, cv2.GC_INIT_WITH_MASK)

    alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    kernel = np.ones((3, 3), np.uint8)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, kernel, iterations=1)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Keep separated colorful weapon parts that GrabCut sometimes marks as
    # probable background.
    alpha = np.where(fg_seed, 255, alpha).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    out = np.dstack([rgb, alpha])
    return Image.fromarray(out)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--mode", choices=MODES, default="smart")
    parser.add_argument("--engine", choices=["auto", "grabcut", "flood"], default="auto")
    parser.add_argument("--max-edge", type=int, default=1200)
    args = parser.parse_args()

    image = Image.open(args.input)
    scale = min(1.0, args.max_edge / max(image.size))
    if scale < 1:
        image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    use_grabcut = args.engine == "grabcut" or (args.engine == "auto" and cv2 is not None and np is not None)
    result = trim(grabcut_cutout(image) if use_grabcut else cutout(image, MODES[args.mode]))
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    result.save(args.output)


if __name__ == "__main__":
    main()
