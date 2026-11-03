---
layout: page
title: Invariant-Mass Reconstruction of the Z Boson from ATLAS Open Data
description: IRIS project leading a team of five to reconstruct the Z boson mass from ATLAS open data in the two-lepton and four-lepton channels, presented in London.
importance: 6
category: Quantitative and Scientific Computing
period: September 2023 to June 2024
stack: Python · NumPy · matplotlib
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/Large-Scale-Particle-Collision-Data-Analysis-with-ATLAS](https://github.com/404-ammar-not-found/Large-Scale-Particle-Collision-Data-Analysis-with-ATLAS) · **Written in:** Python, NumPy, pandas, matplotlib · **Period:** September 2023 to June 2024

## Introduction

This was my first computational research project, undertaken while I was still at school. It ran through a research club supported by IRIS, the Institute for Research in Schools. I led a team of five students, working alongside Viswa Marepalli, Ishir Nama, Joshua Ogbomo and Tobi Ogunlana. The goal was to co-author a research poster and present it to academics and peers in London. The physics question was the invariant mass of the Z0 boson, recovered from its two principal leptonic decay routes using the ATLAS open data release.

## How I did it

The events analysed were simulated Standard Model Monte Carlo samples, covering Z decaying to two leptons and ZZ decaying to four leptons, rather than recorded collision data; that is what the teaching release of the ATLAS exercise provides. The reconstruction is the standard one. Iterate over events; retain lepton pairs which are same-flavour and opposite-charge; compute the invariant mass from the Lorentz four-vectors of the selected leptons; and histogram the result across the sample. Both the two-lepton and the four-lepton channel produce a clear mass peak. The two channels agree with one another, and the peak position is consistent with the published value for the Z boson mass. Since the channels have different backgrounds and different reconstruction paths, their agreement is a stronger check on the analysis than either channel alone.

## Details and clarifications

Most of the work was in the selection rather than the arithmetic. Without the charge and flavour requirements, combinatorial pairings of unrelated leptons dominate the histogram and bury the peak completely, so the cuts are what make the signal visible at all. Working out which requirements were physically motivated, as opposed to merely convenient for producing a clean plot, was the part of the project I learned most from. The samples are simulated, so the analysis reproduces a known result where the correct answer is already established: it demonstrates that the analysis chain is sound and does not measure anything new.

The team attended a masterclass at the University of Oxford, where we presented the analysis and defended the methodology and findings under questioning, and we delivered the poster at a physics conference in London. The repository contains only the conference poster PDF. The analysis itself was written in NumPy, pandas and matplotlib within Jupyter, but was never committed, so nothing there is reproducible and the numerical results cannot be recovered from the text of the poster. It is the reason every project since has its notebooks under version control.
