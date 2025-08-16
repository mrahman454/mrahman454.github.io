# coding: utf-8

import os
import bibtexparser
from datetime import datetime

# Escape YAML-unsafe characters
html_escape_table = {
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;"
}
def html_escape(text):
    if isinstance(text, str):
        return "".join(html_escape_table.get(c, c) for c in text)
    else:
        return str(text)

# ---- Load BibTeX file ----
with open("talks.bib") as bibtex_file:
    bib_database = bibtexparser.load(bibtex_file)

# ---- Process each entry ----
for entry in bib_database.entries:
    title = entry.get("title", "Untitled")
    url_slug = entry.get("url_slug", entry.get("ID", "no-slug"))
    venue = entry.get("venue") or entry.get("booktitle") or entry.get("journal") or ""
    location = entry.get("location", "")
    talk_url = entry.get("talk_url") or (f"https://doi.org/{entry.get('doi','')}" if entry.get("doi") else "")
    description = entry.get("description", "")
    display_date = entry.get("display_date", "")

    # Determine date
    date = entry.get("date", "1900-01-01")
    try:
        date = datetime.strptime(date, "%Y-%m-%d").strftime("%Y-%m-%d")
    except:
        pass

    # ---- Build Markdown ----
    md_filename = f"{date}-{url_slug}.md"
    html_filename = f"{date}-{url_slug}"

    md = "---\n"
    md += f'title: "{html_escape(title)}"\n'
    md += "collection: talks\n"
    md += 'type: "Talk"\n'
    md += f"permalink: /talks/{html_filename}\n"
    if venue:
        md += f'venue: "{html_escape(venue)}"\n'
    if location:
        md += f'location: "{html_escape(location)}"\n'
    md += f"date: {date}\n"
    if display_date:
        md += f"display_date: {html_escape(display_date)}\n"
    md += f"url_slug: {html_escape(url_slug)}\n"
    md += "---\n\n"

    if talk_url:
        md += f"[More information here]({talk_url})\n\n"
    if description:
        md += f"{html_escape(description)}\n"

    # ---- Write to file ----
    os.makedirs("../_talks", exist_ok=True)
    with open(f"../_talks/{md_filename}", "w", encoding="utf-8") as f:
        f.write(md)

print("Markdown files generated successfully!")
