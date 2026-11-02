---
title: "Breaking the Twinkle Authentication Scheme and Analyzing Its Underlying Permutation"
collection: publications
permalink: /publication/2025-01-01-Breaking-the-Twinkle-Authentication-Scheme
date: 2025-01-01
pubtype: conference
area: "Classical Cryptanalysis"
authors: "Debasmita Chakraborty, Hosein Hadipour, Anup Kumar Kundu, Mostafizar Rahman, Prathamesh Ram, Yu Sasaki, Dilip Sau, Aman Sinha"
venue: "Selected Areas in Cryptography (SAC 2025)"
venue_short: "SAC 2025"
details: "LNCS vol. 16207, Springer"
doi: "10.1007/978-3-032-10536-3_4"
eprint: "https://eprint.iacr.org/2025/1339"
citation: "Debasmita Chakraborty, Hosein Hadipour, Anup Kumar Kundu, Mostafizar Rahman, Prathamesh Ram, Yu Sasaki, Dilip Sau, Aman Sinha. Breaking the Twinkle Authentication Scheme and Analyzing Its Underlying Permutation. Selected Areas in Cryptography (SAC 2025), LNCS vol. 16207, Springer, 2025."
abstract: "This paper studies the Twinkle family of low-latency symmetric key schemes designed by Wang et al. (CiC 2024). In particular, it presents cryptanalysis of both the mode and the underlying primitive. Twinkle is a PRF-based design, and an authenticated encryption scheme Twinkle-AE is specified based on a dedicated PRF called Twinkle-PRF. To achieve low latency, Twinkle-PRF uses a large key and state to produce sufficient randomness in a single step. Twinkle-AE uses a 1024- or 512-bit key for authentication and generates a $t$-bit tag, where $t \\in \\{64, 128\\}$. It claims to provide $t$ bits of integrity. Several Twinkle-AE parameter sets claim higher confidentiality than integrity. In this setup, for any ciphertext, an adversary can obtain the message after $O(2^t)$ decryption attempts by guessing the tag, allowing attacks in the chosen-ciphertext setting. We show that a 1024- or 512-bit authentication key can be recovered using only $O(2^t)$ queries. The recovered authentication key enables the generation of valid ciphertexts for arbitrary plaintexts, thus achieving universal forgery. In the second part of the paper, we perform cryptanalysis on reduced-round variants of the 1280-bit public permutation Twinkle-P, which serves as a core component of Twinkle-PRF. We investigate impossible differential, zero-correlation linear, integral, and differential-linear distinguishers by developing automated analytic tools. We provide practical distinguishers for up to 5 rounds, and the longest distinguisher reaches 6 rounds with a complexity of $2^{74.32}$. This surpasses the round bounds evaluated by the designers. We stress that our attacks on mode exploits the gap between the claimed confidentiality and integrity levels, thus have no impact on the parameter sets having the same security level. Our attacks on the permutation do not have any significant impact on the whole specifications. Moreover, we note that Twinkle-AE-512b/Twinkle-AE-1024b and Twinkle-PA remain secure, and the versions we attacked would also be secure if the claimed confidentiality level matched the integrity level."
---

**Authors:** Debasmita Chakraborty, Hosein Hadipour, Anup Kumar Kundu, Mostafizar Rahman, Prathamesh Ram, Yu Sasaki, Dilip Sau, Aman Sinha

**Published in:** Selected Areas in Cryptography (SAC 2025), LNCS vol. 16207, Springer, 2025.

**DOI:** [10.1007/978-3-032-10536-3_4](https://doi.org/10.1007/978-3-032-10536-3_4)
