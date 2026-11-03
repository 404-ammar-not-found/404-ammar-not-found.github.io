---
layout: page
title: MPINSDE, When Does Prior Knowledge Help a Neural SDE Extrapolate?
description: A physics residual and a multiple-shooting curriculum that cut a neural SDE's out-of-support error by 58% on every seed, scored by preregistered gates.
importance: 0
category: Machine Learning Theory
venue: NeurIPS 2026 AI for Stochastic Dynamics Workshop
paper: https://openreview.net/pdf?id=OSE0Uz5RDd
period: August to September 2026
stack: Python · PyTorch · torchsde
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/MPINeuralODE](https://github.com/404-ammar-not-found/MPINeuralODE) · **Paper:** [OpenReview PDF](https://openreview.net/pdf?id=OSE0Uz5RDd) · **Written in:** Python, PyTorch, torchsde · **Period:** August to September 2026

A NeurIPS 2026 workshop submission, and the question in the title is the one I started with.

## Introduction

A neural SDE learns a drift and a diffusion from trajectories and then works as a simulator of noisy dynamics. Two weaknesses motivated this project. Trajectory losses constrain the diffusion only weakly, and the learned simulator is almost never tested from initial conditions outside its training data, which is exactly where a simulator is asked to work. I wanted to know when prior knowledge actually helps there, so the study is a 2x2 ablation on a bistable double well standing in for a queryable process (a simulator or resettable experiment): a plain NeuralSDE baseline, the physics residual alone (+phys), the training curriculum alone (+MIC), and both together (MPINSDE).

## How I did it

MPINSDE builds prior knowledge in through two ingredients. A physics residual constrains the drift, and a multiple-initial-condition multiple-shooting curriculum changes how the training data is presented, each reformulated for noise so that a transition pseudo-likelihood replaces rollout error, continuity is scored under a transition density, and the SDE stays well-posed by construction. Recovery is scored on the standard held-out initial-condition region, of which only 2.2% of samples are out of support, and extrapolation in a dedicated experiment where it is representable and unvisited.

The engineering is built so the numbers can be audited. Configs are frozen and hashed, every random object draws from a named entropy stream and a model is never scored on the noise it trained on, and an append-only ledger records every run that starts, winning or losing. The 507-test suite includes exact Ornstein-Uhlenbeck statistics and a g = 0 gate that recovers the deterministic ODE stack, plus SymPy checks of every testbed derivation. One command regenerates every table, macro and figure from the 337 MB of committed results (280 runs, 2327 tracked files) and checks each against the shipped file byte-for-byte.

![Drift field recovery inside and outside the training region]({{ '/assets/img/projects/mpinsde-drift.png' | relative_url }})

## Details and clarifications

MPINSDE cuts the baseline's out-of-support error by 58% on every seed, on par with MIC alone, and the residual matters where MIC alone fails: on leading windows over out-of-support samples MIC falls below the baseline (-6.1% to -1.6%) while MPINSDE gains 8.8% to 14.5%, and across the physics-weight sweep under Euler-Maruyama it is the only method that never loses to the baseline. Under the preregistered effect-size gate the one-step contrast passes (+84%, d_z = 1.12) and the full-rollout contrast narrowly misses (d_z = 0.91). In support it improves on the baseline for diffusion, calibration and invariant-law recovery. Rare events stay unsolved: every treated model underestimates the mean first-passage time, and the MIC variants escape the well too early (-14% and -15% against -5% for the baseline).

The preregistration was committed on 2026-08-03, before any comparison run, and fixes the primary metric, seeds and floors. The raise of the λ = 0.01 arm to ten seeds was registered after the first five-seed look, with the stopping rule fixed before the new seeds ran.

![How the extrapolation advantage decomposes across methods]({{ '/assets/img/projects/mpinsde-mech.png' | relative_url }})
