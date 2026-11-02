#!/usr/bin/env python3
"""Add new papers to _publications/ and, for top venues, a News item.

Runs every ~15 days from .github/workflows/update-publications.yml, or by hand:

    python3 scripts/update_publications.py            # update files
    python3 scripts/update_publications.py --dry-run  # only show what would change

Where the data comes from
  * OpenAlex (api.openalex.org) lists works linked to the ORCID below.
  * Crossref (api.crossref.org) gives the exact title, authors and venue for each DOI.
  Google Scholar and DBLP are not used: Scholar has no API and DBLP blocks automated
  clients, so scripts cannot read either of them reliably.

What gets added
  * Only papers with a DOI that are journal articles or conference papers.
  * Only if Crossref lists "Mostafizar Rahman" as an author (filters out mix-ups).
  * Not if the DOI or title is already in _publications/, or the DOI is listed in
    _data/publication_ignore.yml.
  * A News item is added only for IACR venues or the top-4 security conferences,
    and only for papers from this year or last year.

Abstracts (shown when hovering a paper on the website)
  * Filled in for any paper that has none yet, from OpenAlex, then Semantic Scholar,
    then the IACR ePrint metadata feed (OAI-PMH, CC0) when the paper has an `eprint:` link.
  * To add or fix one by hand, put  abstract: "..."  in the paper's front matter.
"""
import datetime
import glob
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ORCID = "0000-0003-0934-4769"
MY_GIVEN, MY_FAMILY = "mostafizar", "rahman"
MY_NAME = "Mostafizar Rahman"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB_DIR = os.path.join(ROOT, "_publications")
NEWS_FILE = os.path.join(ROOT, "_data", "news.yml")
IGNORE_FILE = os.path.join(ROOT, "_data", "publication_ignore.yml")
UA = "mrahman454.github.io publication updater (+https://mrahman454.github.io)"

# (pattern on venue text, full name or None to keep Crossref's, short name, type, news-worthy)
# Order matters: the first match wins.
VENUES = [
    # IACR journals
    (r"transactions on symmetric cryptology", "IACR Transactions on Symmetric Cryptology", "ToSC", "journal", True),
    (r"transactions on cryptographic hardware and embedded systems", "IACR Transactions on Cryptographic Hardware and Embedded Systems", "TCHES", "journal", True),
    (r"communications in cryptology", "IACR Communications in Cryptology", "CiC", "journal", True),
    (r"journal of cryptology", "Journal of Cryptology", "JoC", "journal", True),
    # IACR conferences
    (r"advances in cryptology\W+crypto\b|^crypto\b", None, "CRYPTO", "conference", True),
    (r"eurocrypt", None, "EUROCRYPT", "conference", True),
    (r"asiacrypt", None, "ASIACRYPT", "conference", True),
    (r"fast software encryption", None, "FSE", "conference", True),
    (r"cryptographic hardware and embedded systems", None, "CHES", "conference", True),
    (r"public-key cryptography\W+pkc|\bpkc\b", None, "PKC", "conference", True),
    (r"theory of cryptography", None, "TCC", "conference", True),
    # Top-4 security conferences
    (r"symposium on security and privacy", None, "IEEE S&P", "conference", True),
    (r"computer and communications security", None, "ACM CCS", "conference", True),
    (r"usenix security", None, "USENIX Security", "conference", True),
    (r"network and distributed system security", None, "NDSS", "conference", True),
    # Other journals
    (r"international journal of applied cryptography", "International Journal of Applied Cryptography", "IJACT", "journal", False),
    (r"transactions on information theory", "IEEE Transactions on Information Theory", "IEEE TIT", "journal", False),
    (r"transactions on quantum engineering", "IEEE Transactions on Quantum Engineering", "IEEE TQE", "journal", False),
    (r"transactions on information forensics and security", "IEEE Transactions on Information Forensics and Security", "IEEE TIFS", "journal", False),
    (r"transactions on dependable and secure computing", "IEEE Transactions on Dependable and Secure Computing", "IEEE TDSC", "journal", False),
    (r"transactions on computers", "IEEE Transactions on Computers", "IEEE TC", "journal", False),
    (r"journal of cryptographic engineering", "Journal of Cryptographic Engineering", "JCEN", "journal", False),
    (r"designs, codes and cryptography", "Designs, Codes and Cryptography", "DCC", "journal", False),
    (r"scientific reports", "Scientific Reports", "Sci. Rep.", "journal", False),
    # Other conferences
    (r"selected areas in cryptography", None, "SAC", "conference", False),
    (r"indocrypt", None, "INDOCRYPT", "conference", False),
    (r"africacrypt", None, "AFRICACRYPT", "conference", False),
    (r"latincrypt", None, "LATINCRYPT", "conference", False),
    (r"applied cryptography and network security", None, "ACNS", "conference", False),
    (r"information security and privacy", None, "ACISP", "conference", False),
    (r"esorics", None, "ESORICS", "conference", False),
    (r"topics in cryptology|ct-rsa", None, "CT-RSA", "conference", False),
    (r"cryptology and network security", None, "CANS", "conference", False),
    (r"advances in information and computer security|iwsec", None, "IWSEC", "conference", False),
]
SKIP_CONTAINERS = {"lecture notes in computer science", "communications in computer and information science"}


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def norm_title(t):
    return re.sub(r"[^a-z0-9]", "", (t or "").lower())


def norm_doi(d):
    d = (d or "").strip().lower()
    return re.sub(r"^https?://(dx\.)?doi\.org/", "", d)


def clean(text):
    text = re.sub(r"<[^>]+>", "", text or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def openalex_abstract(inv):
    """OpenAlex stores abstracts as {word: [positions]}; rebuild the text."""
    if not inv:
        return ""
    pos = {}
    for word, idxs in inv.items():
        for i in idxs:
            pos[i] = word
    text = " ".join(pos[i] for i in sorted(pos))
    return re.sub(r"^(abstract|summary)[\s.:]+", "", clean(text), flags=re.I)


def tidy_abstract(text):
    """Remove LaTeX preambles some sources wrap around formulas; keep the formula."""
    text = re.sub(r"\\documentclass.*?\\begin\{document\}(.*?)\\end\{document\}", r"\1", text, flags=re.S)
    text = re.sub(r"\$\$(.+?)\$\$", r"$\1$", text)
    return re.sub(r"\s+", " ", text).strip()


def fetch_abstract(doi, eprint_url):
    """Try OpenAlex, Semantic Scholar, then IACR ePrint. Returns '' if none found."""
    if doi:
        try:
            w = get_json("https://api.openalex.org/works/doi:" + urllib.parse.quote(doi))
            text = openalex_abstract(w.get("abstract_inverted_index"))
            if len(text) > 80:
                return text
        except Exception:
            pass
        try:
            w = get_json("https://api.semanticscholar.org/graph/v1/paper/DOI:"
                         + urllib.parse.quote(doi) + "?fields=abstract")
            text = clean(w.get("abstract") or "")
            if len(text) > 80:
                return text
        except Exception:
            pass  # rate limits are common here; the next run will try again
    m = re.search(r"eprint\.iacr\.org/(\d{4}/\d+)", eprint_url or "")
    if m:
        try:
            url = ("https://eprint.iacr.org/oai?verb=GetRecord&metadataPrefix=oai_dc"
                   "&identifier=oai:eprint.iacr.org:" + m.group(1))
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            xml = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
            d = re.search(r"<dc:description>(.*?)</dc:description>", xml, re.S)
            text = clean(d.group(1)) if d else ""
            if len(text) > 80:
                return text
        except Exception:
            pass
    return ""


def fill_missing_abstracts(dry):
    """Add `abstract:` to publication files that do not have one yet."""
    added = 0
    for path in sorted(glob.glob(os.path.join(PUB_DIR, "*.md"))):
        text = open(path, encoding="utf-8").read()
        front = text.split("---", 2)[1] if text.startswith("---") else ""
        if re.search(r"^abstract:", front, re.M):
            continue
        doi = re.search(r'^doi:\s*"?([^"\n]+)"?', front, re.M)
        ep = re.search(r'^eprint:\s*"?([^"\n]+)"?', front, re.M)
        abstract = tidy_abstract(fetch_abstract(norm_doi(doi.group(1)) if doi else "", ep.group(1) if ep else ""))
        time.sleep(1)  # be gentle with the free APIs
        if not abstract:
            continue
        added += 1
        print("  abstract for", os.path.basename(path))
        if dry:
            continue
        # append the abstract as the last front-matter line
        body = text.split("---", 2)[2]
        text = "---" + front.rstrip("\n") + "\n" + f"abstract: {yaml_str(abstract)}\n" + "---" + body
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(text)
    print(f"Abstracts added: {added}")


def yaml_str(s):
    # JSON strings are valid double-quoted YAML strings
    return json.dumps(s, ensure_ascii=False)


def existing_publications():
    dois, titles = set(), set()
    for path in glob.glob(os.path.join(PUB_DIR, "*.md")):
        text = open(path, encoding="utf-8").read()
        m = re.search(r'^doi:\s*"?([^"\n]+)"?', text, re.M)
        if m:
            dois.add(norm_doi(m.group(1)))
        m = re.search(r'^title:\s*"?(.*?)"?\s*$', text, re.M)
        if m:
            titles.add(norm_title(m.group(1)))
    if os.path.exists(IGNORE_FILE):
        for line in open(IGNORE_FILE, encoding="utf-8"):
            m = re.match(r'\s*-\s*"?([^"#\s]+)', line)
            if m:
                dois.add(norm_doi(m.group(1)))
    return dois, titles


def classify(container_titles, event_name):
    texts = [t for t in container_titles if t.lower() not in SKIP_CONTAINERS]
    blob = " | ".join(texts + [event_name or ""]).lower()
    for pattern, full, short, ptype, news in VENUES:
        if re.search(pattern, blob):
            return full, short, ptype, news, texts
    return None, None, None, False, texts


def guess_area(title):
    t = title.lower()
    if re.search(r"quantum|grover|simon's", t):
        return "Quantum Cryptanalysis"
    if "fault" in t:
        return "Fault Attacks"
    if re.search(r"attack|cryptanalys|analys|differential|boomerang|distinguish|yoyo|key.recovery|breaking|commit", t):
        return "Classical Cryptanalysis"
    return "Design"


def slugify(title):
    s = re.sub(r"[^A-Za-z0-9]+", "-", title).strip("-")
    return s[:90].rstrip("-")


def build_entry(doi, cr):
    title = clean((cr.get("title") or [""])[0])
    authors = [f'{clean(a.get("given", ""))} {clean(a.get("family", ""))}'.strip() for a in cr.get("author", [])]
    if not any(a.get("family", "").lower() == MY_FAMILY and a.get("given", "").lower().startswith(MY_GIVEN)
               for a in cr.get("author", [])):
        return None, "not listed as an author on Crossref"

    containers = [clean(c) for c in cr.get("container-title", [])]
    event = clean((cr.get("event") or {}).get("name", ""))
    full, short, ptype, news, texts = classify(containers, event)
    cr_type = cr.get("type", "")
    if ptype is None:
        if cr_type == "journal-article":
            ptype = "journal"
        elif cr_type in ("proceedings-article", "book-chapter"):
            ptype = "conference"
        else:
            return None, f"unsupported type {cr_type!r}"
        short = clean((cr.get("short-container-title") or [""])[0]) or (texts[0] if texts else "")
    venue = full or (texts[0] if texts else event)

    date_parts = (cr.get("issued") or cr.get("published") or {}).get("date-parts", [[None]])[0]
    year = date_parts[0] if date_parts else None
    if ptype == "conference":
        m = re.search(r"\b(19|20)\d\d\b", " ".join(texts + [event]))
        if m:
            year = int(m.group(0))
    if not year:
        return None, "no publication year"

    vol, iss, page = cr.get("volume", ""), cr.get("issue", ""), cr.get("page", "").replace("-", "–")
    details = []
    if ptype == "journal":
        if re.fullmatch(r"(19|20)\d\d", vol or "") and iss:
            details.append(f"{vol}({iss})")
            short_full = f"{short} {vol}({iss})"
        else:
            if vol:
                details.append(f"vol. {vol}")
            if iss:
                details.append(f"issue {iss}")
            short_full = f"{short} {year}"
    else:
        short_full = f"{short} {year}" if not re.search(r"\d{4}", short or "") else short
    if page:
        details.append(f"pp. {page}")

    return {
        "doi": doi, "title": title, "authors": ", ".join(authors), "venue": venue,
        "venue_short": short_full.strip(), "details": ", ".join(details), "pubtype": ptype,
        "area": guess_area(title), "year": int(year), "news": news,
    }, None


def write_publication(e):
    slug = f'{e["year"]}-01-01-{slugify(e["title"])}'
    path = os.path.join(PUB_DIR, slug + ".md")
    if os.path.exists(path):
        slug += "-" + re.sub(r"[^a-z0-9]", "", e["doi"])[-6:]
        path = os.path.join(PUB_DIR, slug + ".md")
    cit = f'{e["authors"]}. {e["title"]}. {e["venue"]}' + (f', {e["details"]}' if e["details"] else "") + f', {e["year"]}.'
    lines = [
        "---",
        f'title: {yaml_str(e["title"])}',
        "collection: publications",
        f"permalink: /publication/{slug}",
        f'date: {e["year"]}-01-01',
        f'pubtype: {e["pubtype"]}',
        f'area: {yaml_str(e["area"])}',
        f'authors: {yaml_str(e["authors"])}',
        f'venue: {yaml_str(e["venue"])}',
        f'venue_short: {yaml_str(e["venue_short"])}',
    ]
    if e["details"]:
        lines.append(f'details: {yaml_str(e["details"])}')
    lines.append(f'doi: {yaml_str(e["doi"])}')
    if e.get("abstract"):
        lines.append(f'abstract: {yaml_str(e["abstract"])}')
    lines += [f"citation: {yaml_str(cit)}", "added_automatically: true", "---", ""]
    body = (f'**Authors:** {e["authors"]}\n\n**Published in:** {e["venue"]}'
            + (f', {e["details"]}' if e["details"] else "") + f', {e["year"]}.\n\n'
            + f'**DOI:** [{e["doi"]}](https://doi.org/{e["doi"]})\n')
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + body)
    return path


def add_news(entries):
    text = open(NEWS_FILE, encoding="utf-8").read()
    month = datetime.date.today().strftime("%Y-%m")
    block = ""
    for e in entries:
        msg = (f'New paper <a href="https://doi.org/{html.escape(e["doi"])}">“{html.escape(e["title"])}”</a> '
               f'in <span class="hl">{html.escape(e["venue_short"])}</span>.')
        block += f"- date: {yaml_str(month)}\n  text: {yaml_str(msg)}\n\n"
    i = text.find("- date:")
    text = text + "\n" + block if i < 0 else text[:i] + block + text[i:]
    with open(NEWS_FILE, "w", encoding="utf-8") as fh:
        fh.write(text)


def main():
    dry = "--dry-run" in sys.argv
    known_dois, known_titles = existing_publications()

    url = ("https://api.openalex.org/works?" + urllib.parse.urlencode({
        "filter": f"author.orcid:{ORCID}", "per-page": 200, "sort": "publication_date:desc"}))
    works = get_json(url)["results"]
    print(f"OpenAlex: {len(works)} works linked to ORCID {ORCID}")

    new, seen = [], set()
    for w in works:
        doi = norm_doi(w.get("doi"))
        title = clean(w.get("title") or "")
        if not doi or w.get("type") not in ("article", "conference-paper", "book-chapter", "proceedings-article"):
            continue
        if doi in known_dois or doi in seen or norm_title(title) in known_titles:
            continue
        seen.add(doi)
        try:
            cr = get_json("https://api.crossref.org/works/" + urllib.parse.quote(doi))["message"]
        except Exception as exc:  # one bad DOI should not stop the rest
            print(f"  skip {doi}: Crossref lookup failed ({exc})")
            continue
        entry, why = build_entry(doi, cr)
        if not entry:
            print(f"  skip {doi}: {why}")
            continue
        if norm_title(entry["title"]) in known_titles:
            continue
        known_titles.add(norm_title(entry["title"]))
        entry["abstract"] = tidy_abstract(openalex_abstract(w.get("abstract_inverted_index")))
        new.append(entry)

    if not new:
        print("No new publications.")
        fill_missing_abstracts(dry)
        return

    this_year = datetime.date.today().year
    newsworthy = [e for e in new if e["news"] and e["year"] >= this_year - 1]
    for e in new:
        print(f'  NEW  [{e["venue_short"]}] {e["title"]}' + ("  (+ news)" if e in newsworthy else ""))
    if dry:
        print("Dry run: no files changed.")
        return
    for e in new:
        print("  wrote", os.path.relpath(write_publication(e), ROOT))
    if newsworthy:
        add_news(newsworthy)
        print(f"  added {len(newsworthy)} news item(s)")
    fill_missing_abstracts(dry)


if __name__ == "__main__":
    main()
