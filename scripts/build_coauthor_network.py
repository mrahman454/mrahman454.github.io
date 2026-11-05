#!/usr/bin/env python3
"""Build the co-authorship network page (assets/canv/coauthors.html).

Uses the author lists in _publications/*.md and the CANV page template in
tools/canv/template.html (https://github.com/Xovee/canv, GPL-3.0).

    python3 scripts/build_coauthor_network.py

How the graph is built (same as CANV's canv.py):
  * every author is a node;
  * a paper with n authors adds 1/(n-1) to the edge between each pair of its authors,
    so the edge weight is the number of joint papers, discounted for large author lists;
  * node size/colour = sum of a node's edge weights ("strength");
  * the names of the most frequent co-authors are shown by default.
Only the Python standard library is needed.
"""
import glob
import itertools
import json
import os
import re

CENTRE = "Mostafizar Rahman"
SHOW_TOP_PERCENT = 15          # label this share of the strongest co-authors by default
ALIASES = {                    # different spellings of the same person -> one name
    # "T. Isobe": "Takanori Isobe",
}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, "tools", "canv", "template.html")
OUT = os.path.join(ROOT, "assets", "canv", "coauthors.html")
LIST_OUT = os.path.join(ROOT, "_data", "coauthors.json")


def author_lists():
    papers = []
    for path in sorted(glob.glob(os.path.join(ROOT, "_publications", "*.md"))):
        text = open(path, encoding="utf-8").read()
        m = re.search(r"^authors:\s*(.+)$", text, re.M)
        if not m:
            continue
        raw = m.group(1).strip()
        try:
            raw = json.loads(raw)
        except ValueError:
            raw = raw.strip("'\"")
        names = [ALIASES.get(n.strip(), n.strip()) for n in raw.split(",") if n.strip()]
        names = list(dict.fromkeys(names))  # drop accidental duplicates, keep order
        if len(names) >= 2:
            papers.append(names)
    return papers


def build(papers):
    weight = {}
    for names in papers:
        share = 1.0 / (len(names) - 1)
        for a, b in itertools.combinations(names, 2):
            key = tuple(sorted((a, b)))
            weight[key] = weight.get(key, 0.0) + share
    strength = {}
    for (a, b), w in weight.items():
        strength[a] = strength.get(a, 0.0) + w
        strength[b] = strength.get(b, 0.0) + w
    edges = [[a, b, round(w, 4)] for (a, b), w in sorted(weight.items())]

    others = sorted((n for n in strength if n != CENTRE), key=lambda n: -strength[n])
    k = max(1, round(len(others) * SHOW_TOP_PERCENT / 100))
    frequent = [CENTRE] + others[:k]
    papers_with = {}
    for names in papers:
        for n in names:
            papers_with[n] = papers_with.get(n, 0) + 1
    people = [{"name": n, "papers": papers_with[n], "strength": round(strength[n], 3)}
              for n in sorted(others, key=lambda n: (-papers_with[n], -strength[n], n.split()[-1]))]
    return edges, frequent, len(others), people


def main():
    papers = author_lists()
    edges, frequent, n_coauthors, people = build(papers)
    data = {
        "display": {
            "colorBy": "strength", "sizeBy": "strength", "charge": 256, "linkLength": 200,
            "scaleLinkOpacity": 1, "scaleLinkWidth": 1, "nameToMatch": "", "radius": 15,
            "showNodeNames": 0, "hideMenu": 1, "showLegend": 0,
            "frequentCoAuthors": frequent,
            "numberCoAuthor": n_coauthors, "displayName": CENTRE,
            # no "w"/"h": the template sizes the canvas to the frame it is shown in
        },
        "networks": {"coauthors": {"layers": [{"edgeList": edges, "nodes": {}, "metadata": None}]}},
        "title": f"Co-authorship network of {CENTRE}",
    }
    page = open(TEMPLATE, encoding="utf-8").read()
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    page = page.replace("/*CANV_DATA*/null", blob).replace("__CANV_CENTRE__", CENTRE.replace("'", "\\'"))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    if page != old:
        with open(OUT, "w", encoding="utf-8") as fh:
            fh.write(page)
        print(f"Wrote {os.path.relpath(OUT, ROOT)}: {len(papers)} papers, {n_coauthors} co-authors, {len(edges)} links")
    else:
        print("Co-author network unchanged.")
    listing = json.dumps({"total": n_coauthors, "papers": len(papers), "people": people}, ensure_ascii=False, indent=1) + "\n"
    old = open(LIST_OUT, encoding="utf-8").read() if os.path.exists(LIST_OUT) else ""
    if listing != old:
        with open(LIST_OUT, "w", encoding="utf-8") as fh:
            fh.write(listing)


if __name__ == "__main__":
    main()
