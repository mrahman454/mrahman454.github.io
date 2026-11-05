#!/usr/bin/env python3
"""Make the static world map used on the Co-authors (map view) and Talks pages.

    curl -sL https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json -o /tmp/countries-110m.json
    python3 scripts/build_world_map.py /tmp/countries-110m.json

Writes _includes/world-map.svg: one <path> per country (data-id = ISO 3166-1 numeric code),
drawn with the Equal Earth projection. Pages place their own dots on top with the same
projection (assets/js/maps.js reads the scale/offset from the <svg> data attributes).
Country outlines: Natural Earth (public domain) via the world-atlas package.
Only the Python standard library is needed.
"""
import json
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "_includes", "world-map.svg")
WIDTH = 1000
SKIP = {"010"}  # Antarctica

A1, A2, A3, A4 = 1.340264, -0.081106, 0.000893, 0.003796
M = math.sqrt(3) / 2
X_MAX = math.pi / (M * A1)  # equal-earth x at lon=180, lat=0


def equal_earth(lon, lat):
    lam, phi = math.radians(lon), math.radians(lat)
    t = math.asin(M * math.sin(phi))
    t2, t6 = t * t, t ** 6
    x = lam * math.cos(t) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)))
    y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
    return x, y


def decode_arcs(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return arcs


def ring_points(ring, arcs):
    pts = []
    for i in ring:
        a = arcs[i] if i >= 0 else list(reversed(arcs[~i]))
        pts.extend(a if not pts else a[1:])
    return pts


def main():
    topo = json.load(open(sys.argv[1], encoding="utf-8"))
    arcs = decode_arcs(topo)
    scale = WIDTH / (2 * X_MAX)
    shapes, ys = [], []
    for g in topo["objects"]["countries"]["geometries"]:
        cid = str(g.get("id", ""))
        if cid in SKIP or g["type"] not in ("Polygon", "MultiPolygon"):
            continue
        polys = [g["arcs"]] if g["type"] == "Polygon" else g["arcs"]
        d = []
        for poly in polys:
            for ring in poly:
                prev = None
                for k, (lon, lat) in enumerate(ring_points(ring, arcs)):
                    x, y = equal_earth(lon, lat)
                    px, py = WIDTH / 2 + x * scale, -y * scale
                    ys.append(py)
                    pt = (round(px, 1), round(py, 1))
                    if pt == prev:
                        continue
                    # start a new sub-path instead of drawing a line across the whole map
                    jump = prev is not None and abs(pt[0] - prev[0]) > WIDTH / 2
                    d.append(("M" if k == 0 or jump else "L") + f"{pt[0]:g},{pt[1]:g}")
                    prev = pt
                d.append("Z")
        name = g.get("properties", {}).get("name", "")
        shapes.append((cid, name, "".join(d)))
    top, bottom = min(ys) - 4, max(ys) + 4
    paths = "\n".join(f'<path data-id="{cid}" data-name="{name}" d="{d}"><title>{name}</title></path>'
                      for cid, name, d in shapes)
    svg = (f'<svg class="world-map" viewBox="0 {top:.1f} {WIDTH} {bottom - top:.1f}" '
           f'data-scale="{scale:.6f}" data-width="{WIDTH}" role="img" aria-label="World map" '
           f'xmlns="http://www.w3.org/2000/svg">\n<g class="world-map__countries">\n{paths}\n</g>\n'
           f'<g class="world-map__dots"></g>\n</svg>\n')
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(svg)
    print(f"Wrote {os.path.relpath(OUT, ROOT)}: {len(shapes)} countries, {len(svg) // 1024} KB")


if __name__ == "__main__":
    main()
