---
title: KANM
summary: Free, open-source Python software that works out what a set of reports is really worth when people repeat each other — exact Bayesian models of testimony, trust and shared sources.
kind: Tool
status: Released
featured: true
focus: Exact Bayesian models of testimony, trust and shared sources, in Python.
version: "0.10.0"
licence: GPL-3.0-only
date: 2026-11-18
source: https://github.com/DANIELKHAN26/kanm-epistemic-inquiry
requirements: Python 3.11 or newer; no other packages
tags: [Bayesian inference, Social epistemology, Evidence provenance, Python]
cover: ../../assets/lab/kanm/kanm-card.png
coverAlt: "The KANM card: “Five people telling you the same thing is not five times the evidence if they all heard it from one place.” Counted as five separate sources, a claim looks 99% certain; traced to the one study they all repeat, which is right three times out of four, it is 75%."
coverPdf: /downloads/kanm-card.pdf
ogImage: ../../assets/lab/kanm/kanm-og.jpg
credit: "Code by Daniel Khan. KANM reimplements the Laputa model of Erik J. Olsson and Staffan Angere from its published equations and descriptions; it contains none of the original Laputa code and is not endorsed by its authors."
figures:
  - src: ../../assets/lab/kanm/fig1-repetition-is-not-replication.png
    alt: "Three panels comparing exact belief with belief that counts every report as independent, as agreeing reports grow from 1 to 8: independent studies (the two curves match), reports relaying one unseen study (exact belief stays at 0.75 while the independent count nears certainty), and partly independent relays (exact belief rises more slowly)."
    title: "Repetition is not replication"
    caption: "How sure you should be of a claim after n agreeing reports, starting from even odds, under three ways the reports can arise. (a) Independent studies, each right three times in four: counting every report is correct. (b) Reports that all relay one unseen study: the exact answer never rises above that study's own 0.75, while counting the reports as independent overstates the evidence (in log-odds) 7.1-fold at n = 8. (c) Reports that check the claim themselves 30% of the time and otherwise relay the study: evidence builds, but counting them as independent still overstates it 3.1-fold at n = 8."
  - src: ../../assets/lab/kanm/fig5-docking-against-laputa.png
    alt: "Two strip plots of the largest difference between KANM and the compiled Laputa 1.6 model in each of 200 scenarios, for credence and for trust. In double precision 199 scenarios fall inside the tolerance and one just outside; with Laputa's single-precision trust arithmetic all 200 pass."
    title: "Docking against the compiled Laputa 1.6 model core"
    caption: "KANM compared with the compiled, checksum-verified Laputa 1.6 model core in 200 random scenarios of 25 steps: (a) credence, (b) trust. In double precision, 199 scenarios fall inside a tolerance fixed in advance (10⁻⁵) and one misses it, at 1.9 × 10⁻⁵ (open circle). Reproducing Laputa's single-precision trust arithmetic closes the gap, so the remaining difference is arithmetic precision, not model logic. A confirmatory run on 200 new scenarios, declared before it ran, passed 200 of 200."
  - src: ../../assets/lab/kanm/fig10-crowd-local-dependence.png
    alt: "Left: the dispersion ratio of shared errors for five public annotation sets (RTE, TEMP, Bluebirds, Product, Sentiment), each above 1 with Holm-adjusted p-values from 0.005 to 0.043. Right: sorted pair z-scores for Bluebirds and Sentiment against their expected values, steeper than the diagonal at both ends."
    title: "Crowd workers do not err independently"
    caption: "In five public, gold-labelled annotation sets, the errors that pairs of workers share are more dispersed than independence allows: (a) the dispersion ratio R is above 1 in every set, significant after Holm correction (TEMP only narrowly); (b, c) pair-level detail for Bluebirds and Sentiment. The test detects dependence, not its cause — copying, shared misconceptions and differing sensitivity to hard items all produce this pattern."
---

If five people tell you the same thing, how much should you believe it? That depends on where they got it. Five people who each checked for themselves are strong evidence. Five people repeating one news story are worth about one story.

KANM works this out exactly. You describe who heard what from whom, and it tells you what the reports are actually worth. It also simulates groups of people who talk, trust each other more or less, and change their minds, building on the Laputa model of Erik Olsson and Staffan Angere.

## A quick example

Five people pass on one study that is right three times out of four:

```python
from kanm.dependence import ProvenanceNetwork, relay, symmetric_primary

net = ProvenanceNetwork()
net.add(symmetric_primary("study", 0.75))         # one study, never seen directly
for k in range(5):
    net.add(relay(f"person{k}", "study", 0.95))    # five people passing it on

heard = {f"person{k}": True for k in range(5)}
net.posterior(0.5, heard)                # 0.75: worth about one study
net.independence_posterior(0.5, heard)   # 0.992: what you get if you count them separately
```

Counted as five separate sources, the reports suggest a claim is 99% certain. Traced to their single origin, they are worth what the study is worth: 75%.

## What's inside

- **Shared sources** (`kanm.dependence`) — exact belief for reports with known sources, including people who copy, relay or partly check for themselves.
- **Chains of testimony** (`kanm.testimony`) — informants who hear each other before speaking, as in the classic balls-and-urns experiments.
- **Networks of inquirers** (`kanm.model`) — simulations of belief and trust with Laputa's update rule or an exact one, also runnable from the command line.
- **Source reliability** (`kanm.reliability`) — learning how reliable each source is from its track record, tested on five public crowdsourcing data sets.
- **What to ask next** (`kanm.inquiry`, `kanm.collaborative`) — deciding which question to ask next, and who should check what.
- **Docking harness** (`docking/`) — compiles the original Laputa 1.6 code and compares it with KANM step by step.

## Install

Python 3.11 or newer, with no other dependencies:

```sh
python -m pip install git+https://github.com/DANIELKHAN26/kanm-epistemic-inquiry
```

Run the tests with `python -m unittest discover -s tests`. The study scripts in `examples/` also need NumPy, and some need SciPy. Studies that use public data download it from the original source on request and check every file against a fixed hash; no third-party data is redistributed.

KANM is early, pre-alpha research software. Its answers are exact for the models it implements; the studies below are simulations and re-analyses of public data, and each caption states its limits.

## Cite

Khan, D. (2026). *KANM* (version 0.10.0) [Computer software]. [github.com/DANIELKHAN26/kanm-epistemic-inquiry](https://github.com/DANIELKHAN26/kanm-epistemic-inquiry)

If you use the Laputa-style updates, please also cite [Olsson (2011)](https://doi.org/10.3366/epi.2011.0012) and [Vallinder & Olsson (2014)](https://doi.org/10.1007/s11229-013-0375-0).
