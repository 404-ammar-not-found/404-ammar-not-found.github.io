---
layout: page
title: reconstructing the Z boson
description: invariant-mass reconstruction from ATLAS open data, with a team of five
importance: 6
category: physics
---

[Repository](https://github.com/404-ammar-not-found/Large-Scale-Particle-Collision-Data-Analysis-with-ATLAS)

This was my first computational research project, run between September 2023 and June 2024 while I was still at school, and I led a team of five. The goal was to recover the invariant mass of the Z boson through its two main leptonic decay routes using the ATLAS open data release.

The method is the standard one for this analysis. Loop over events, keep pairs of opposite-charge same-flavour leptons, build the invariant mass from the Lorentz four-vectors of the selected leptons, and histogram it. Both the two-lepton and the four-lepton channel produce a clear peak, the two channels agree with each other, and the peak sits at the published Z mass. Getting the event selection right was most of the work: without the charge and flavour cuts the combinatorial background buries the signal entirely.

One point of accuracy that the poster states and that I want to repeat here: the events we analysed were simulated Standard Model Monte Carlo samples for Z decaying to two leptons and ZZ decaying to four leptons, not recorded collision data. That is what the teaching version of the ATLAS exercise provides, and it means this reproduces a known result rather than measuring anything new.

We presented the work at the University of Oxford and at a physics conference in London. The analysis was written in NumPy, pandas and matplotlib in Jupyter, and the repository holds only the poster, because at the time I did not think to commit the code. That is the main thing I would do differently, and it is why every project since has the notebooks in version control.
