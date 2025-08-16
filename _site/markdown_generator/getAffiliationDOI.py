import bibtexparser
import requests
import time

SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/{}?fields=title,authors"
CROSSREF_API = "https://api.crossref.org/works"

def get_doi_from_crossref(title):
    """Search Crossref for DOI using paper title."""
    params = {"query.title": title, "rows": 1}
    r = requests.get(CROSSREF_API, params=params)
    if r.status_code == 200:
        items = r.json().get("message", {}).get("items", [])
        if items:
            return items[0].get("DOI")
    return None

def get_authors_from_semanticscholar(doi):
    """Fetch authors, affiliations, countries using Semantic Scholar API."""
    r = requests.get(SEMANTIC_SCHOLAR_API.format(doi))
    if r.status_code != 200:
        return []
    data = r.json()
    authors_info = []
    for author in data.get("authors", []):
        authors_info.append({
            "name": author.get("name", ""),
            "affiliation": author.get("affiliations", [{}])[0].get("name", "") if author.get("affiliations") else "",
            "country": author.get("affiliations", [{}])[0].get("country", "") if author.get("affiliations") else ""
        })
    return authors_info

# Load your BibTeX file
with open("pubs.bib") as bibfile:
    bib_database = bibtexparser.load(bibfile)

for entry in bib_database.entries:
    title = entry.get("title", "")
    doi = entry.get("doi", "")
    
    # If DOI missing, try Crossref
    if not doi:
        doi = get_doi_from_crossref(title)
        print("doi: "+doi)
        if doi:
            entry["doi"] = doi  # optionally update bib entry

    print(f"\nPaper: {title}")
    if doi:
        authors = get_authors_from_semanticscholar(doi)
        if not authors:
            print("No author affiliation info found.")
        else:
            for a in authors:
                print(a)
    else:
        print("DOI not found; cannot fetch affiliations.")

    time.sleep(1)  # polite API usage
