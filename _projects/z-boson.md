---
layout: page
title: Invariant-Mass Reconstruction of the Z Boson from ATLAS Open Data
description: A school research project leading a team of five through the dilepton and four-lepton decay channels, presented at the University of Oxford.
importance: 6
category: Quantitative and Scientific Computing
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/Large-Scale-Particle-Collision-Data-Analysis-with-ATLAS](https://github.com/404-ammar-not-found/Large-Scale-Particle-Collision-Data-Analysis-with-ATLAS) · **Written in:** Python, NumPy, pandas, matplotlib · **Period:** September 2023 to June 2024

This was my first computational research project, undertaken while I was still at school. I led a team of five students in recovering the invariant mass of the Z boson through its two principal leptonic decay routes, using the ATLAS open data release.

## Data

The events analysed were simulated Standard Model Monte Carlo samples, covering Z decaying to two leptons and ZZ decaying to four leptons, rather than recorded collision data. That is what the teaching release of the ATLAS exercise provides. The consequence is worth stating directly: this reproduces a known result under conditions where the correct answer is already established, so it demonstrates that the analysis chain is sound and does not measure anything new.

## Method

The reconstruction is the standard one. Iterate over events; retain lepton pairs which are same-flavour and opposite-charge; compute the invariant mass from the Lorentz four-vectors of the selected leptons; and histogram the result across the sample.

Most of the work was in the selection rather than the arithmetic. Without the charge and flavour requirements, combinatorial pairings of unrelated leptons dominate the histogram and bury the peak completely, so the cuts are what make the signal visible at all. Working out which requirements were physically motivated, as opposed to merely convenient for producing a clean plot, was the part of the project I learned most from.

## Results

Both the two-lepton and the four-lepton channel produce a clear mass peak. The two channels agree with one another, and the peak position is consistent with the published value for the Z boson mass. Since the two channels have different backgrounds and different reconstruction paths, their agreement is a stronger check on the analysis than either channel alone.

## Dissemination

The team attended a masterclass at the University of Oxford, where we presented the analysis and defended the methodology and findings under questioning. We also co-authored a research poster and delivered a poster presentation at a physics conference in London.

## Limitations

The repository contains only the conference poster. The analysis itself was written in NumPy, pandas and matplotlib within Jupyter, but was never committed, so nothing here is reproducible and the numerical results cannot be recovered from the text of the poster. That is the main thing I would do differently, and it is the reason every project since has its notebooks under version control.
