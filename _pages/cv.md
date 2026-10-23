---
layout: archive
title: "Curriculum Vitae"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}
{% assign cvpdf = site.static_files | where: "path", "/files/cv.pdf" | first %}

<div class="acad" markdown="1">

{% if cvpdf %}
<p class="cv-download"><a class="btn btn--primary" href="{{ base_path }}/files/cv.pdf"><i class="fas fa-file-pdf" aria-hidden="true"></i> Download CV (PDF)</a></p>
{% endif %}

## Research interests

- Design and analysis of symmetric-key primitives
- Analysis of symmetric-key ciphers in the quantum computing model
- Analysis of symmetric-key based real-world protocols

## Education

<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Ph.D. in Computer Science</span><span class="cv-entry__org">Indian Statistical Institute, Kolkata</span>Thesis: <em>Cryptanalysis of Symmetric Key Schemes using Classical and Quantum Techniques</em></div><span class="cv-entry__date">Jul 2016 – Jan 2022</span></div>
<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">M.Tech in Computer Science &amp; Engineering</span><span class="cv-entry__org">Zakir Hussain College of Engineering and Technology, Aligarh Muslim University</span></div><span class="cv-entry__date">Jun 2014 – May 2016</span></div>
<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">B.Tech in Computer Engineering</span><span class="cv-entry__org">Zakir Hussain College of Engineering and Technology, Aligarh Muslim University</span></div><span class="cv-entry__date">Jun 2009 – May 2013</span></div>

## Research experience

<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Research Fellow</span><span class="cv-entry__org">Nanyang Technological University, Singapore</span></div><span class="cv-entry__date">Oct 2025 – Present</span></div>
<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Program-Specific Researcher</span><span class="cv-entry__org">Kyoto University, Japan</span></div><span class="cv-entry__date">May 2025 – Sep 2025</span></div>
<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Postdoctoral Researcher</span><span class="cv-entry__org">University of Hyogo, Japan</span></div><span class="cv-entry__date">Feb 2023 – Mar 2025</span></div>
<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Visiting Scientist</span><span class="cv-entry__org">R. C. Bose Centre for Cryptology and Security, Indian Statistical Institute, Kolkata</span></div><span class="cv-entry__date">Sep 2022 – Jan 2023</span></div>
<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Project-linked Personnel</span><span class="cv-entry__org">R. C. Bose Centre for Cryptology and Security, Indian Statistical Institute, Kolkata</span></div><span class="cv-entry__date">Apr 2022 – Jun 2022</span></div>
<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Senior Project Associate</span><span class="cv-entry__org">Indian Institute of Technology Bhilai</span></div><span class="cv-entry__date">Feb 2022 – Mar 2022</span></div>

## Industry experience

<div class="cv-entry"><div class="cv-entry__main"><span class="cv-entry__role">Software Engineer</span><span class="cv-entry__org">Phonato Studios Pvt. Ltd., India</span></div><span class="cv-entry__date">Aug 2013 – Aug 2014</span></div>

## Awards and grants

- **Excellent Paper Award**, Computer Security Symposium (CSS) 2025, for “AETHER: An Ultra-High Throughput and Low Energy Authenticated Encryption Scheme”
- **IACR travel grant** to attend Fast Software Encryption 2019, Paris
- **Junior Research Fellowship (NET)**, CSIR–UGC, All India Rank 45, 2016
- **GATE fellowship**, CSIR, 2013

## Publications

</div>

<div class="acad">
{% assign pubs = site.publications | sort: "date" | reverse %}
<h3>Journal papers</h3>
<ul class="pub-list">
{% for p in pubs %}{% if p.pubtype == "journal" %}{% include pub-entry.html pub=p %}{% endif %}{% endfor %}
</ul>
<h3>Conference papers</h3>
<ul class="pub-list">
{% for p in pubs %}{% if p.pubtype == "conference" %}{% include pub-entry.html pub=p %}{% endif %}{% endfor %}
</ul>

<h2>Talks</h2>
<ul class="pub-list">
{% assign talks = site.talks | sort: "date" | reverse %}
{% for t in talks %}
  <li class="pub">
    <span class="pub__title">{{ t.title }}</span>
    <span class="pub__venue">{{ t.type }}, {{ t.venue }}, {{ t.location }} &middot; {{ t.date | date: "%B %-d, %Y" }}</span>
  </li>
{% endfor %}
</ul>

<h2>Teaching and service</h2>
<p>See the <a href="{{ base_path }}/teaching/">Teaching</a> and <a href="{{ base_path }}/service/">Service</a> pages.</p>
</div>
