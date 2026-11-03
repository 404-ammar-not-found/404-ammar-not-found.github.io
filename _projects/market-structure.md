---
layout: page
title: Correlation-Network Structure of the S&P 500, 2004 to 2024
description: Point-in-time S&P 500 membership, yearly correlation networks, and null models showing the 2004 to 2024 correlation swings track market-factor volatility.
importance: 5
category: Quantitative and Scientific Computing
period: June to July 2026
stack: Python · scikit-learn · pandas
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/Changes-in-Stock-Market-Structure](https://github.com/404-ammar-not-found/Changes-in-Stock-Market-Structure) · **Written in:** Python, scikit-learn, pandas · **Period:** June to July 2026

## Introduction

Equities within an index do not move independently, and the shape of their dependence need not stay stable across two decades. I asked how the S&P 500 changed between 2004 and 2024, one calendar year at a time. Mean pairwise correlation of daily log returns rose from 0.198 in 2005 to 0.448 in 2008, peaked at 0.553 in 2011, fell to its low of 0.128 in 2017, hit 0.421 in the 2022 rate shock, and sat at 0.187 in 2024. The first principal component tracks it to within 0.02 every year: this measures the strength of the single market factor. A factor model calibrated on 2017 covariance would understate 2008- or 2022-style co-movement by a factor of three.

![Correlation matrix of daily S&P 500 returns, ordered and coloured by sector]({{ '/assets/img/projects/market-correlation.png' | relative_url }})

## How I did it

Membership is reconstructed at each point in time from historical constituents, so each annual window contains only names in the index during that window; 903 distinct tickers held membership across the period. Delisted names such as Bear Stearns and Wachovia are retained. Correlations run per calendar year over tickers trading on at least 90% of observed days. With roughly 400 tickers against as few as 100 observed days the sample covariance is singular, so I use a graphical lasso with its L1 penalty fixed once on the pooled sample, yielding partial correlations conditional on all other stocks; a ridge of 0.10 conditions the 2011 fit. Affinity propagation, preference also fixed, chooses its own exemplar count per year, and one MDS layout on full-sample correlation distance serves every frame. Robustness checks: 200-sample day bootstraps, a Forbes and Rigobon adjustment resetting each year's factor and idiosyncratic variances to typical levels with betas held fixed, and a one-factor null running 200 simulated beta-only markets per year through the identical pipeline.

![Animated network of S&P 500 stocks, one frame per year, nodes coloured by sector with edges for the strongest partial correlations]({{ '/assets/img/projects/market-network.gif' | relative_url }})

## Details and clarifications

At typical volatility the series flattens to roughly 0.25 to 0.35 in every year: the 2008 spike over 2005 is entirely a volatility artefact, and 2017 to 2022 retains 16% of its raw move. Edge density exceeds the one-factor null in 17 of 19 years, through a thin, stable core of sector pairs and dual listings worth 0.6% to 0.8% of pairs in calm years; the exceptions, 2010 and 2011, show crisis densification indistinguishable from what beta alone produces. Clusters fell from 47 in 2004 to 15 in 2011 and rose to 82 in 2024, moving against mean correlation at Spearman rank -0.96, so both measures are near monotone transforms of the correlation level; I claim no hidden interconnection beyond that core. Prices cover about 40% of trading days before 2019, as Polygon returned partial payloads, biasing the level by about +0.025. 2019 and 2020 are unrecoverable, so COVID is absent. 38 of the 903 tickers never fetched, mostly post-bankruptcy symbols, leaving the crisis years mildly optimistic. Sector labels resolve for 610 of 872 tickers and are yfinance's, not true GICS. Calendar-year windows are arbitrary, and the crisis straddles the 2008/2009 boundary. Some lasso fits retain dual gaps of order 0.05, so adjacent-year density differences mean little; 0.006 in 2024 against 0.080 in 2011 is well outside that slack. Each frame keeps only each node's top two edges, so the pictures cannot show densification.
