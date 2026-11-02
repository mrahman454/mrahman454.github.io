---
title: "Implementing Grover's on AES-based AEAD Schemes"
collection: publications
permalink: /publication/2024-01-01-Implementing-Grovers-on-AES-based-AEAD-schemes
date: 2024-01-01
pubtype: journal
area: "Quantum Cryptanalysis"
authors: "Surajit Mandal, Ravi Anand, Mostafizar Rahman, Santanu Sarkar, Takanori Isobe"
venue: "Scientific Reports"
venue_short: "Sci. Rep. 2024"
details: "vol. 14, art. 21105"
doi: "10.1038/s41598-024-69188-8"
citation: "Surajit Mandal, Ravi Anand, Mostafizar Rahman, Santanu Sarkar, Takanori Isobe. Implementing Grover's on AES-based AEAD Schemes. Scientific Reports, vol. 14, art. 21105, 2024."
abstract: "Extensive research is currently underway to determine the security of existing ciphers in light of the advancements in quantum computing. Against symmetric key cryptography, Grover’s search algorithm is a prominent attack, capable of reducing search costs to the square root. For using Grover’s algorithm, it is imperative to embed the target cipher into a quantum circuit. Even so, this area of research is relatively new; it has garnered significant attention from the research community. In this study, we provide the first estimation of the cost of Grover’s key search attack against the AES-based AEAD schemes Rocca-S, AEGIS-128, and Tiaoxin-346. Our analysis considers circuit depth restrictions specified in NIST’s PQC standardization process. Considering NIST’s maximum depth constraints, We present the overall cost of these attacks using gate count and depth-times-width metrics. We observed that for $$\\textsf{MAXDEPTH} = 2^{40}$$ , Rocca-S, AEGIS-128, and Tiaoxin-346 can be retrieved using Grover’s search algorithm with gate count of 1.09 × 2253, 1.14 × 2124, and 1.22 × 2124 respectively. Concerning the current updated values by NIST, these ciphers are secure in terms of the cost of implementing Grover’s attack for key recovery. The quantum circuits of these ciphers are implemented using QISKIT, an open-source software development kit (SDK) designed for working with quantum computers running on the IBM Quantum Experience platform."
---

**Authors:** Surajit Mandal, Ravi Anand, Mostafizar Rahman, Santanu Sarkar, Takanori Isobe

**Published in:** Scientific Reports, vol. 14, art. 21105, 2024.

**DOI:** [10.1038/s41598-024-69188-8](https://doi.org/10.1038/s41598-024-69188-8)
