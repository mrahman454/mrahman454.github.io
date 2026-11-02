---
title: "Exploring SHA Instructions and Its Application to AES-based Schemes"
collection: publications
permalink: /publication/2025-01-01-Exploring-SHA-Instructions-and-Its-Application-to-AES-based-Schemes
date: 2025-01-01
pubtype: journal
area: "Design"
authors: "Takuro Shiraya, Subhadeep Banik, Tatsuya Ishikawa, Ryoma Ito, Mostafizar Rahman, Kosei Sakamoto, Atsushi Tanaka, Shion Utsumi, Takanori Isobe"
venue: "IACR Communications in Cryptology"
venue_short: "CiC 2025"
details: "vol. 2, issue 3"
doi: "10.62056/anxrudy6b"
citation: "Takuro Shiraya, Subhadeep Banik, Tatsuya Ishikawa, Ryoma Ito, Mostafizar Rahman, Kosei Sakamoto, Atsushi Tanaka, Shion Utsumi, Takanori Isobe. Exploring SHA Instructions and Its Application to AES-based Schemes. IACR Communications in Cryptology, vol. 2, issue 3, 2025."
highlights:
  - "SHA instructions run in parallel with AES instructions on modern CPUs; gives guidelines for combining them."
  - "Simpira and Areion short-input hashes become about 50% faster."
  - "A hybrid AEGIS-128L reaches full 256-bit forgery security while keeping its performance."
abstract: "In this paper, we explore the potential of improving AES-based schemes by integrating SHA instructions alongside AES instructions, starting from the key observation that SHA instructions can be executed in parallel with AES instructions on modern processors. We investigate conditions for parallel execution, the invocation ratio, and overhead of type conversions, and then provide guidelines for efficient SHA instruction usage with AES instructions. Applying these guidelines, we integrate SHA round functions into the AES-based short-input hash functions of Simpira and Areion, resulting in approximately 50% faster performance by achieving security with fewer iterations. Besides, we apply integration of SHA instructions to AES-based AEAD schemes of AEGIS-128L, which supports a 256-bit tag but has recently been shown to fall short of providing full 256-bit forgery security. We demonstrate that hybrid schemes can achieve 256-bit forgery security for AEGIS-128L while preserving performance."
---

**Authors:** Takuro Shiraya, Subhadeep Banik, Tatsuya Ishikawa, Ryoma Ito, Mostafizar Rahman, Kosei Sakamoto, Atsushi Tanaka, Shion Utsumi, Takanori Isobe

**Published in:** IACR Communications in Cryptology, vol. 2, issue 3, 2025.

**DOI:** [10.62056/anxrudy6b](https://doi.org/10.62056/anxrudy6b)
