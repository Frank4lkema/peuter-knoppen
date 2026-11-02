#!/usr/bin/env python3
"""Draws the app icons (a red button with a face) using only the standard library."""
import math
import pathlib
import struct
import zlib

BACKGROUND = (43, 42, 107)
TOP = (255, 90, 79)
SIDE = (194, 47, 58)
WHITE = (255, 255, 255)
DARK = (35, 32, 63)
SAMPLES = 2


def color_at(x, y):
    """Returns the color for a point in a 0..100 square."""
    in_circle = lambda cx, cy, r: math.hypot(x - cx, y - cy) <= r
    if in_circle(38, 44, 6.5) or in_circle(62, 44, 6.5):
        return WHITE if not (in_circle(39.5, 45, 3.2) or in_circle(63.5, 45, 3.2)) else DARK
    if abs(math.hypot(x - 50, y - 53) - 13) <= 1.7 and y > 57:
        return DARK
    if in_circle(50, 49, 32):
        return TOP
    if in_circle(50, 53, 32):
        return SIDE
    return BACKGROUND


def render(size):
    rows = bytearray()
    for py in range(size):
        rows.append(0)
        for px in range(size):
            total = [0, 0, 0]
            for sx in range(SAMPLES):
                for sy in range(SAMPLES):
                    x = (px + (sx + 0.5) / SAMPLES) * 100 / size
                    y = (py + (sy + 0.5) / SAMPLES) * 100 / size
                    for i, value in enumerate(color_at(x, y)):
                        total[i] += value
            rows.extend(value // SAMPLES**2 for value in total)
    return rows


def chunk(kind, data):
    checksum = zlib.crc32(kind + data)
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", checksum)


def write_png(path, size):
    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    body = chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(bytes(render(size)), 9)) + chunk(b"IEND", b"")
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + body)


root = pathlib.Path(__file__).resolve().parent.parent
output = root / "icons"
output.mkdir(exist_ok=True)
for size in (180, 192, 512):
    write_png(output / f"icon-{size}.png", size)
write_png(root / "ios" / "Knoppen" / "Assets.xcassets" / "AppIcon.appiconset" / "icon-1024.png", 1024)
