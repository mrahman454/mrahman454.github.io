---
title: "On the Key-Commitment Properties of Forkcipher-based AEADs"
collection: publications
permalink: /publication/2025-01-01-On-the-Key-Commitment-Properties-of-Forkcipher-based-AEADs
date: 2024-01-01
pubtype: journal
area: "Classical Cryptanalysis"
authors: "Mostafizar Rahman, Samir Kundu, Takanori Isobe"
venue: "IACR Communications in Cryptology"
venue_short: "CiC 2024"
details: "vol. 1"
doi: "10.62056/AYFHP2FGX"
citation: "Mostafizar Rahman, Samir Kundu, Takanori Isobe. On the Key-Commitment Properties of Forkcipher-based AEADs. IACR Communications in Cryptology, vol. 1, 2024."
highlights:
  - "Key-commitment analysis of forkcipher-based AEADs: Eevee, PAEF, RPAEF and SAEF."
  - "Several lack key commitment: two keys giving the same ciphertext-tag are found with complexity $O(1)$."
  - "Results extend to CMT-1 and CMT-4; these modes should be avoided where key commitment matters."
abstract: "Forkcipher-based AEADs have emerged as lightweight and efficient cryptographic modes, making them suitable for resource-constrained environments such as IoT devices and distributed decryption through MPC. These schemes, including prominent examples like Eevee (Jolteon, Espeon, and Umbreon), PAEF, RPAEF, and SAEF, leverage the properties of forkciphers to achieve enhanced performance. However, their security in terms of key commitment, a critical property for certain applications such as secure cloud services, as highlighted by Albertini et al. (USENIX 2022), has not been comprehensively analyzed until now. In this work, we analyze the key-commitment properties of forkcipher-based AEADs. We found that some of the forkcipher-based AEAD schemes lack key-commitment properties, primarily due to the distinctive manner in which they process associated data and plaintext. For two different keys and the same nonce, an adversary can identify associated data and plaintext blocks that produce identical ciphertext-tags with a complexity of $O(1)$ . Our findings apply to various forkcipher-based AEADs, including Eevee, PAEF, and SAEF, and naturally extend to less strict frameworks, such as CMT-1 and CMT-4. These findings highlight a significant limitation in the robustness of forkcipher-based AEADs. While these modes are attractive for their lightweight design and efficiency, their deployment should be restricted in scenarios where explicit robustness or key-commitment security is required."
---

**Authors:** Mostafizar Rahman, Samir Kundu, Takanori Isobe

**Published in:** IACR Communications in Cryptology, vol. 1, 2024.

**DOI:** [10.62056/AYFHP2FGX](https://doi.org/10.62056/AYFHP2FGX)
