---
permalink: /
title: "Mostafizar Rahman"
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

{% include base_path %}

<div class="acad" markdown="1">

<p class="acad-lead">
I am a <strong>Research Fellow</strong> at <strong>Nanyang Technological University (NTU), Singapore</strong>, working on symmetric-key cryptography. Before joining NTU, I was a Program-Specific Researcher at Kyoto University and a postdoctoral researcher at the University of Hyogo, Japan. I received my Ph.D. in Computer Science from the <strong>Indian Statistical Institute, Kolkata</strong>, with a thesis on cryptanalysis of symmetric-key schemes using classical and quantum techniques.
</p>

My work spans both sides of symmetric-key cryptography. On the **design** side, I am a co-designer of several primitives, including Gleeok, AETHER, Dialga, MSX, Ghidle and ASURA, targeting low latency, high throughput and post-quantum security. On the **analysis** side, I work on classical cryptanalysis (yoyo, boomerang, differential and division-property based attacks), automated cryptanalysis with MILP and SAT tools, quantum cryptanalysis using Grover's and Simon's algorithms, and the security of symmetric-key schemes in real-world protocols, such as key commitment in AEAD.

## Research interests

- Design and analysis of symmetric-key primitives
- Analysis of symmetric-key ciphers in the quantum computing model
- Analysis of symmetric-key based real-world protocols

## News

<ul class="news">
  <li><span class="news__date">Jul 2026</span><span>Research visit to Prof. Takanori Isobe at The University of Osaka on the design of a post-quantum wide block cipher.</span></li>
  <li><span class="news__date">Dec 2025</span><span>Invited talks at the Crypto Winter School 2025 and the National Workshop on Cryptology, IIT Bhilai.</span></li>
  <li><span class="news__date">Oct 2025</span><span>Joined Nanyang Technological University, Singapore as a Research Fellow.</span></li>
  <li><span class="news__date">2025</span><span><strong>AETHER</strong> received the <strong>Excellent Paper Award</strong> at the Computer Security Symposium 2025.</span></li>
  <li><span class="news__date">2025</span><span><strong>Dialga</strong> published in IACR ToSC 2025(4); <strong>MSX</strong> and <strong>SHA instructions for AES-based schemes</strong> published in IACR Communications in Cryptology; <strong>Twinkle</strong> cryptanalysis at SAC 2025.</span></li>
  <li><span class="news__date">2025</span><span>Joined the editorial board of IACR Communications in Cryptology.</span></li>
  <li><span class="news__date">May 2025</span><span>Joined Kyoto University as a Program-Specific Researcher.</span></li>
</ul>

## Selected publications

</div>

<div class="acad">
<ul class="pub-list">
{% assign selected = site.publications | where: "selected", true | sort: "date" | reverse %}
{% for p in selected %}{% include pub-entry.html pub=p %}{% endfor %}
</ul>
<p><a href="{{ base_path }}/publications/">All publications &rarr;</a></p>

<h2>Contact</h2>
<p>
  Nanyang Technological University, Singapore<br>
  <i class="fas fa-envelope" aria-hidden="true"></i> <a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a>
</p>
</div>
