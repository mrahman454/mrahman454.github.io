---
title: "Cryptanalysis of FlexAEAD"
collection: publications
permalink: /publication/2020-01-01-Cryptanalysis-of-FlexAEAD
date: 2020-01-01
pubtype: conference
area: "Classical Cryptanalysis"
authors: "Mostafizar Rahman, Dhiman Saha, Goutam Paul"
venue: "Progress in Cryptology – AFRICACRYPT 2020"
venue_short: "AFRICACRYPT 2020"
details: "LNCS vol. 12174, Springer"
doi: "10.1007/978-3-030-51938-4_8"
eprint: "https://eprint.iacr.org/2019/539"
citation: "Mostafizar Rahman, Dhiman Saha, Goutam Paul. Cryptanalysis of FlexAEAD. Progress in Cryptology – AFRICACRYPT 2020, LNCS vol. 12174, Springer, 2020."
highlights:
  - "Iterated truncated differential with probability $2^{-7}$ per round on FlexAEAD’s keyed permutation (NIST LWC round 1)."
  - "6-round deterministic distinguisher and 7-round key recovery using the Yoyo game on a Super-Sbox structure."
  - "First key-recovery attack on FlexAEAD’s internal permutation; all practical attacks verified experimentally."
abstract: "This paper analyzes the internal keyed permutation of FlexAEAD which is a round-1 candidate of the NIST LightWeight Cryptography Competition. In our analysis, we report an iterated truncated differential leveraging on a particular property of the AES S-box that becomes useful due to the particular nature of the diffusion layer of the round function. The differential holds with a low probability of $2^{-7}$ for one round which allows it to penetrate the same number of rounds as claimed by the designers, but with a much lower complexity. Moreover, it can be easily extended to a key-recovery attack at a little extra cost. We further report a Super-Sbox construction in the internal permutation, which is exploited using the Yoyo game to devise a 6-round deterministic distinguisher and a 7-round key recovery attack for the 128-bit internal permutation. Similar attacks can be mounted for the 64-bit and 256-bit variants. All these attacks outperform the existing results of the designers as well as other third-party results. The iterated truncated differentials can be tweaked to mount forgery attacks similar to the ones given by Eichlseder et al. Success probabilities of all the reported distinguishing attacks are shown to be high. All practical attacks have been experimentally verified. To the best of our knowledge, this work reports the first key-recovery attack on the internal keyed permutation of FlexAEAD."
---

**Authors:** Mostafizar Rahman, Dhiman Saha, Goutam Paul

**Published in:** Progress in Cryptology – AFRICACRYPT 2020, LNCS vol. 12174, Springer, 2020.

**DOI:** [10.1007/978-3-030-51938-4_8](https://doi.org/10.1007/978-3-030-51938-4_8)
