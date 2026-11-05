#!/usr/bin/env python3
"""Build the two network pages shown on the Co-authors tab.

    python3 scripts/build_coauthor_network.py           # build from saved data
    python3 scripts/build_coauthor_network.py --fetch   # first fetch affiliations for new papers

Outputs
  assets/canv/coauthors.html     co-authorship network (people)
  assets/canv/institutions.html  institution network (my institutions + co-authors')
  _data/coauthors.json           lists shown under the networks

Data
  * People come from the author lists in _publications/*.md.
  * Institutions come from OpenAlex (each author's institution on each paper), saved in
    _data/affiliations.json so the build does not need the internet. `--fetch` adds
    papers that are not saved yet.
  * For my own affiliation, publisher metadata is sometimes wrong (it copies a co-author's
    affiliation), so only institutions from my CV are accepted; otherwise the CV position
    for the publication year is used. Exact per-paper fixes go in OWN_AFFILIATION_FIXES.

Graph (same as CANV, https://github.com/Xovee/canv): a paper with n authors (or n
institutions) adds 1/(n-1) to the link between each pair; node size/colour is the sum of
a node's links. Uses only the Python standard library.
"""
import glob
import itertools
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ME = "Mostafizar Rahman"
SHOW_TOP_PERCENT = 15  # label this share of the strongest nodes by default

# Different spellings of the same person -> one name
AUTHOR_ALIASES = {
    # "T. Isobe": "Takanori Isobe",
}

# My institutions (from the CV) and where I was in each year (fallback for bad metadata)
MY_INSTITUTIONS = ["Indian Statistical Institute", "IIT Bhilai", "University of Hyogo",
                   "Kyoto University", "Nanyang Technological University"]
CURRENT_INSTITUTION = "Nanyang Technological University"  # also highlighted as mine
MY_POSITION_BY_YEAR = [(2022, "Indian Statistical Institute"), (2024, "University of Hyogo"),
                       (2025, "Kyoto University"), (9999, "Nanyang Technological University")]
OWN_AFFILIATION_FIXES = {
    # "doi": ["Institution", ...],
}
PAPERS_WITHOUT_DOI = {  # institutions per author for papers OpenAlex cannot look up
    "grover on present: quantum resource estimation": [
        ["Mostafizar Rahman", ["Indian Statistical Institute"]],
        ["Goutam Paul", ["Indian Statistical Institute"]],
    ],
}

# Institution names: merge sub-units and shorten long names for the graph
INSTITUTION_NAMES = {
    "CAPSULE: Cryptographie Appliquée et Sécurité des Implémentations": "IRISA / Université de Rennes",
    "Centre Inria de l'Université de Rennes": "IRISA / Université de Rennes",
    "Institut de Recherche en Informatique et Systèmes Aléatoires": "IRISA / Université de Rennes",
    "Université de Rennes": "IRISA / Université de Rennes",
    "Institute of Information Engineering": "Institute of Information Engineering, CAS",
    "Indian Institute of Technology Bhilai": "IIT Bhilai",
    "Indian Institute of Technology Madras": "IIT Madras",
    "Indian Institute of Technology Kharagpur": "IIT Kharagpur",
    "Indraprastha Institute of Information Technology Delhi": "IIIT Delhi",
    "École Polytechnique Fédérale de Lausanne": "EPFL",
    "FHNW University of Applied Sciences and Arts Northwestern Switzerland": "FHNW",
    "National Institute of Information and Communications Technology": "NICT",
    "Mitsubishi Electric (Japan)": "Mitsubishi Electric",
    "NEC (Japan)": "NEC",
    "NTT (Japan)": "NTT",
    "NEC Solution Innovators, Ltd. (Japan)": "NEC Solution Innovators",
}
# Umbrella bodies, dropped when the same author also lists a more specific institution
UMBRELLAS = {"Centre National de la Recherche Scientifique",
             "Institut national de recherche en sciences et technologies du numérique",
             "Chinese Academy of Sciences"}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, "tools", "canv", "template.html")
OUT_DIR = os.path.join(ROOT, "assets", "canv")
AFFIL_FILE = os.path.join(ROOT, "_data", "affiliations.json")
LIST_OUT = os.path.join(ROOT, "_data", "coauthors.json")
UA = {"User-Agent": "mrahman454.github.io publication updater (+https://mrahman454.github.io)"}


def norm_title(t):
    return re.sub(r"[^a-z0-9]", "", (t or "").lower())


def read_papers():
    papers = []
    for path in sorted(glob.glob(os.path.join(ROOT, "_publications", "*.md"))):
        text = open(path, encoding="utf-8").read()
        front = text.split("---", 2)[1] if text.startswith("---") else text

        def field(name):
            m = re.search(rf"^{name}:\s*(.+)$", front, re.M)
            if not m:
                return ""
            v = m.group(1).strip()
            try:
                return json.loads(v)
            except ValueError:
                return v.strip("'\"")
        authors = [AUTHOR_ALIASES.get(n.strip(), n.strip()) for n in str(field("authors")).split(",") if n.strip()]
        year = int(str(field("date"))[:4] or 0)
        papers.append({"title": str(field("title")), "doi": str(field("doi")).lower(),
                       "year": year, "authors": list(dict.fromkeys(authors))})
    return papers


# ---------------------------------------------------------------- affiliations
def fetch_affiliations(papers):
    saved = json.load(open(AFFIL_FILE, encoding="utf-8")) if os.path.exists(AFFIL_FILE) else {}
    added = 0
    for p in papers:
        if not p["doi"] or p["doi"] in saved:
            continue
        url = "https://api.openalex.org/works/doi:" + urllib.parse.quote(p["doi"])
        try:
            w = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except Exception as exc:
            print(f"  could not fetch affiliations for {p['doi']}: {exc}")
            continue
        saved[p["doi"]] = [
            [a["author"]["display_name"],
             [[i["display_name"], i.get("country_code") or ""] for i in a.get("institutions", [])]]
            for a in w.get("authorships", [])]
        added += 1
        time.sleep(0.3)
    if added:
        with open(AFFIL_FILE, "w", encoding="utf-8") as fh:
            json.dump(saved, fh, ensure_ascii=False, indent=1, sort_keys=True)
            fh.write("\n")
        print(f"Saved affiliations for {added} new paper(s)")
    return saved


def clean_institutions(raw):
    names = [(INSTITUTION_NAMES.get(n, n), c) for n, c in raw]
    specific = [x for x in names if x[0] not in UMBRELLAS]
    names = specific or names
    seen, out = set(), []
    for n, c in names:
        if n not in seen:
            seen.add(n)
            out.append((n, c))
    return out


def is_me(name):
    n = name.lower()
    return "rahman" in n and "mostafizar" in n


def my_position(year):
    for until, inst in MY_POSITION_BY_YEAR:
        if year <= until:
            return inst
    return MY_POSITION_BY_YEAR[-1][1]


def institutions_per_paper(papers, saved):
    """For each paper: the set of institutions involved, and mine."""
    result, countries = [], {}
    for p in papers:
        entries = saved.get(p["doi"]) if p["doi"] else PAPERS_WITHOUT_DOI.get(p["title"].lower())
        if not entries:
            continue
        insts, mine = [], []
        for author, raw in entries:
            raw = [r if isinstance(r, list) else [r, ""] for r in raw]
            cleaned = clean_institutions(raw)
            for n, c in cleaned:
                if c:
                    countries.setdefault(n, c)
            if is_me(author):
                fix = OWN_AFFILIATION_FIXES.get(p["doi"])
                ok = [n for n, _ in cleaned if n in MY_INSTITUTIONS]
                chosen = fix or ok or [my_position(p["year"])]
                mine += chosen
                insts += chosen
            else:
                insts += [n for n, _ in cleaned]
        result.append({"title": p["title"], "institutions": list(dict.fromkeys(insts)), "mine": list(dict.fromkeys(mine))})
    return result, countries


# ---------------------------------------------------------------- graph + page
def build_graph(groups, centres):
    weight = {}
    for names in groups:
        if len(names) < 2:
            continue
        share = 1.0 / (len(names) - 1)
        for a, b in itertools.combinations(names, 2):
            key = tuple(sorted((a, b)))
            weight[key] = weight.get(key, 0.0) + share
    strength = {}
    for (a, b), w in weight.items():
        strength[a] = strength.get(a, 0.0) + w
        strength[b] = strength.get(b, 0.0) + w
    edges = [[a, b, round(w, 4)] for (a, b), w in sorted(weight.items())]
    others = sorted((n for n in strength if n not in centres), key=lambda n: -strength[n])
    k = max(1, round(len(others) * SHOW_TOP_PERCENT / 100))
    frequent = [c for c in centres if c in strength] + others[:k]
    return edges, frequent, strength


def write_page(filename, edges, frequent, centres, n_nodes, title, singular, plural, counts=None, unit="paper"):
    data = {
        "display": {
            "colorBy": "strength", "sizeBy": "strength", "charge": 256, "linkLength": 200,
            "scaleLinkOpacity": 1, "scaleLinkWidth": 1, "nameToMatch": "", "radius": 15,
            "showNodeNames": 0, "hideMenu": 1, "showLegend": 0,
            "frequentCoAuthors": frequent, "numberCoAuthor": n_nodes, "displayName": ME,
            # no "w"/"h": the template sizes the canvas to the frame it is shown in
        },
        "networks": {"network": {"layers": [{"edgeList": edges, "nodes": {}, "metadata": None}]}},
        "title": title,
    }
    page = open(TEMPLATE, encoding="utf-8").read()
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    page = (page.replace("/*CANV_DATA*/null", blob)
                .replace("/*CANV_CENTRES*/[]", json.dumps(centres, ensure_ascii=False).replace("</", "<\\/"))
                .replace("/*CANV_COUNTS*/{}", json.dumps(counts or {}, ensure_ascii=False).replace("</", "<\\/"))
                .replace("__CANV_UNIT__", unit)
                .replace("__CANV_PLURAL__", plural).replace("__CANV_SINGULAR__", singular))
    path = os.path.join(OUT_DIR, filename)
    os.makedirs(OUT_DIR, exist_ok=True)
    old = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
    if page != old:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(page)
        print(f"Wrote {os.path.relpath(path, ROOT)}: {n_nodes} {plural}, {len(edges)} links")


def main():
    papers = read_papers()

    # People
    groups = [p["authors"] for p in papers if len(p["authors"]) >= 2]
    edges, frequent, strength = build_graph(groups, [ME])
    count = {}
    for g in groups:
        for n in g:
            count[n] = count.get(n, 0) + 1
    people = [{"name": n, "papers": count[n]} for n in
              sorted((n for n in strength if n != ME), key=lambda n: (-count[n], -strength[n], n.split()[-1]))]
    write_page("coauthors.html", edges, frequent, [ME], len(people),
               f"Co-authorship network of {ME}", "co-author", "co-authors")

    # Institutions
    saved = fetch_affiliations(papers) if "--fetch" in sys.argv else (
        json.load(open(AFFIL_FILE, encoding="utf-8")) if os.path.exists(AFFIL_FILE) else {})
    per_paper, countries = institutions_per_paper(papers, saved)
    mine = list(dict.fromkeys(n for p in per_paper for n in p["mine"]))
    if any(CURRENT_INSTITUTION in p["institutions"] for p in per_paper) and CURRENT_INSTITUTION not in mine:
        mine.append(CURRENT_INSTITUTION)
    i_edges, i_frequent, i_strength = build_graph([p["institutions"] for p in per_paper], mine)
    i_count = {}
    for p in per_paper:
        for n in p["institutions"]:
            i_count[n] = i_count.get(n, 0) + 1
    institutions = [{"name": n, "papers": i_count[n], "country": countries.get(n, ""), "mine": n in mine}
                    for n in sorted(i_count, key=lambda n: (n not in mine, -i_count[n], n))]
    write_page("institutions.html", i_edges, i_frequent, mine, len(institutions),
               f"Institutions of {ME} and co-authors", "institution", "institutions",
               counts=i_count, unit="paper")

    listing = json.dumps({"total": len(people), "papers": len(papers), "people": people,
                          "institutions_total": len(institutions), "institutions_papers": len(per_paper),
                          "institutions": institutions}, ensure_ascii=False, indent=1) + "\n"
    old = open(LIST_OUT, encoding="utf-8").read() if os.path.exists(LIST_OUT) else ""
    if listing != old:
        with open(LIST_OUT, "w", encoding="utf-8") as fh:
            fh.write(listing)
    print(f"{len(people)} co-authors; {len(institutions)} institutions from {len(per_paper)} papers")


if __name__ == "__main__":
    main()
