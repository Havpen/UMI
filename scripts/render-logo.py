"""Rebuild the UMI circular mark as a crisp vector SVG + high-res PNG."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand"
SRC_CANDIDATES = [
    ROOT / "assets" / "umi-mark-source.png",
    ROOT / "public" / "brand" / "umi-mark-source.png",
    Path(
        r"C:\Users\Jeck\.cursor\projects\h-SkardSoft-Umi\assets"
        r"\c__Users_Jeck_AppData_Roaming_Cursor_User_workspaceStorage"
        r"_952db60ba923ba686a40e5d1a2c132c3_images_image-61ead220-435e-4e62-9932-92e094eeb0ef.png"
    ),
]

S0 = 744.0
DISK = (20, 20, 20, 255)
WHITE = (255, 255, 255, 255)
GRAY = (128, 128, 128, 255)
BLACK = (0, 0, 0, 0)

# Visual stroke on the original is ~30px (soft halo included); round caps scale with this.
SW_U, SW_M, SW_I = 30.0, 30.0, 30.0
U_L, U_R, U_TOP = 148.5, 255.0, 252.0
U_RX = (U_R - U_L) / 2
U_RY = U_RX
U_ARC = 512.0 - SW_U / 2 - U_RY
U_CX = (U_L + U_R) / 2
DOT = (U_CX, 445.0, 13.5)
I_X, I_TOP, I_BOT = 586.0, 252.0, 493.0

M_L, M_LI, M_RI, M_R = 318.0, 387.0, 455.0, 523.0
M_MID = (M_LI + M_RI) / 2
M_RX = (M_LI - M_L) / 2
M_IRX = (M_RI - M_LI) / 2
M_ARCH_Y, M_ARCH_RY = 291.5, M_RX
M_INNER_Y, M_INNER_RY = 343.0, M_IRX
M_BOT = 371.0

G_TOP = 409.0
G_INNER_Y, G_INNER_RY = 451.5, M_IRX
G_ARCH_Y, G_ARCH_RY = 463.0, M_RX


def source_path() -> Path:
    for p in SRC_CANDIDATES:
        if p.exists():
            return p
    raise FileNotFoundError("original logo not found")


def stamp(draw: ImageDraw.ImageDraw, x: float, y: float, r: float, color) -> None:
    draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


def stroke_line(draw, x0, y0, x1, y1, radius, color, step=0.32) -> None:
    dx, dy = x1 - x0, y1 - y0
    n = max(1, int(math.hypot(dx, dy) / step))
    for i in range(n + 1):
        t = i / n
        stamp(draw, x0 + dx * t, y0 + dy * t, radius, color)


def stroke_arc(draw, cx, cy, rx, ry, a0, a1, radius, color, step_deg=0.16) -> None:
    span = a1 - a0
    n = max(1, int(abs(span) / step_deg))
    for i in range(n + 1):
        a = math.radians(a0 + span * i / n)
        stamp(draw, cx + rx * math.cos(a), cy + ry * math.sin(a), radius, color)


def paint_mark(
    size: int,
    transparent_corners: bool,
    invert: bool = False,
    draw_disk: bool = True,
) -> Image.Image:
    s = size / S0
    bg = (0, 0, 0, 0) if transparent_corners else ((255, 255, 255, 255) if invert else (0, 0, 0, 255))
    disk = WHITE if invert else DISK
    ink = DISK if invert else WHITE
    img = Image.new("RGBA", (size, size), bg)
    draw = ImageDraw.Draw(img)
    if draw_disk:
        draw.ellipse((0, 0, size - 1, size - 1), fill=disk)

    def X(v: float) -> float:
        return v * s

    ru, rm, ri = (SW_U / 2) * s, (SW_M / 2) * s, (SW_I / 2) * s

    stroke_line(draw, X(U_L), X(U_TOP), X(U_L), X(U_ARC), ru, ink)
    stroke_line(draw, X(U_R), X(U_TOP), X(U_R), X(U_ARC), ru, ink)
    stroke_arc(draw, X(U_CX), X(U_ARC), X(U_RX), X(U_RY), 0, 180, ru, ink)
    stamp(draw, X(DOT[0]), X(DOT[1]), X(DOT[2]), ink)
    stroke_line(draw, X(I_X), X(I_TOP), X(I_X), X(I_BOT), ri, ink)

    cx_l, cx_r = (M_L + M_LI) / 2, (M_RI + M_R) / 2

    def paint_m(top_y, bot_y, arch_y, arch_ry, inner_y, inner_ry, top_arcs: bool, color) -> None:
        r = rm
        stroke_line(draw, X(M_L), X(bot_y), X(M_L), X(arch_y), r, color)
        stroke_line(draw, X(M_R), X(bot_y), X(M_R), X(arch_y), r, color)
        stroke_line(draw, X(M_LI), X(arch_y), X(M_LI), X(inner_y), r, color)
        stroke_line(draw, X(M_RI), X(arch_y), X(M_RI), X(inner_y), r, color)
        if top_arcs:
            stroke_arc(draw, X(cx_l), X(arch_y), X(M_RX), X(arch_ry), 180, 360, r, color)
            stroke_arc(draw, X(cx_r), X(arch_y), X(M_RX), X(arch_ry), 180, 360, r, color)
            stroke_arc(draw, X(M_MID), X(inner_y), X(M_IRX), X(inner_ry), 0, 180, r, color)
        else:
            stroke_arc(draw, X(cx_l), X(arch_y), X(M_RX), X(arch_ry), 0, 180, r, color)
            stroke_arc(draw, X(cx_r), X(arch_y), X(M_RX), X(arch_ry), 0, 180, r, color)
            stroke_arc(draw, X(M_MID), X(inner_y), X(M_IRX), X(inner_ry), 180, 360, r, color)

    paint_m(M_ARCH_Y, M_BOT, M_ARCH_Y, M_ARCH_RY, M_INNER_Y, M_INNER_RY, True, ink)
    paint_m(G_ARCH_Y, G_TOP, G_ARCH_Y, G_ARCH_RY, G_INNER_Y, G_INNER_RY, False, GRAY)
    return img


def svg_markup(*, invert: bool = False, with_square: bool = True, draw_disk: bool = True) -> str:
    disk = "#fff" if invert else "#141414"
    ink = "#141414" if invert else "#fff"
    square = ""
    if with_square:
        square = f'  <rect width="744" height="744" fill="{"#fff" if invert else "#000"}"/>\n'
    disk_el = f'  <circle cx="372" cy="372" r="372" fill="{disk}"/>\n' if draw_disk else ""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 744 744" fill="none">
{square}{disk_el}
  <g stroke="{ink}" stroke-linecap="round" stroke-linejoin="round">
    <path stroke-width="{SW_U}" d="M{U_L} {U_TOP}V{U_ARC}A{U_RX} {U_RY} 0 0 0 {U_R} {U_ARC}V{U_TOP}"/>
    <path stroke-width="{SW_I}" d="M{I_X} {I_TOP}V{I_BOT}"/>
    <path stroke-width="{SW_M}" d="M{M_L} {M_BOT}V{M_ARCH_Y}A{M_RX} {M_ARCH_RY} 0 0 0 {M_LI} {M_ARCH_Y}V{M_INNER_Y}A{M_IRX} {M_INNER_RY} 0 0 1 {M_RI} {M_INNER_Y}V{M_ARCH_Y}A{M_RX} {M_ARCH_RY} 0 0 0 {M_R} {M_ARCH_Y}V{M_BOT}"/>
  </g>
  <circle cx="{DOT[0]}" cy="{DOT[1]}" r="{DOT[2]}" fill="{ink}"/>
  <path stroke="#808080" stroke-width="{SW_M}" stroke-linecap="round" stroke-linejoin="round"
        d="M{M_L} {G_TOP}V{G_ARCH_Y}A{M_RX} {G_ARCH_RY} 0 0 1 {M_LI} {G_ARCH_Y}V{G_INNER_Y}A{M_IRX} {G_INNER_RY} 0 0 0 {M_RI} {G_INNER_Y}V{G_ARCH_Y}A{M_RX} {G_ARCH_RY} 0 0 1 {M_R} {G_ARCH_Y}V{G_TOP}"/>
</svg>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(source_path()).convert("RGBA")
    src.save(OUT / "umi-mark-source.png")
    (ROOT / "assets").mkdir(parents=True, exist_ok=True)
    src.save(ROOT / "assets" / "umi-mark-source.png")
    (OUT / "umi-mark.svg").write_text(svg_markup(), encoding="utf-8")
    (OUT / "umi-mark-invert.svg").write_text(
        svg_markup(invert=True, with_square=False, draw_disk=False), encoding="utf-8"
    )

    hi = paint_mark(744 * 5, transparent_corners=False)
    for size, name in ((2048, "umi-mark.png"), (1024, "umi-mark-1024.png"), (512, "umi-mark-512.png")):
        hi.resize((size, size), Image.Resampling.LANCZOS).save(OUT / name, optimize=True)

    dark_t = paint_mark(744 * 4, transparent_corners=True)
    dark_t.resize((2048, 2048), Image.Resampling.LANCZOS).save(OUT / "umi-mark-transparent-dark.png", optimize=True)

    inverted = paint_mark(744 * 4, transparent_corners=True, invert=True, draw_disk=False)
    inverted.resize((2048, 2048), Image.Resampling.LANCZOS).save(OUT / "umi-mark-transparent.png", optimize=True)

    on_white = paint_mark(744 * 4, transparent_corners=True, invert=True, draw_disk=True)
    on_white.resize((2048, 2048), Image.Resampling.LANCZOS).save(OUT / "umi-mark-white-circle.png", optimize=True)
    (OUT / "umi-mark-white-circle.svg").write_text(
        svg_markup(invert=True, with_square=False, draw_disk=True), encoding="utf-8"
    )

    print("wrote", OUT)


if __name__ == "__main__":
    main()
