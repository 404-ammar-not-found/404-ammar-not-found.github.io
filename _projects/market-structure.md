---
layout: page
title: Correlation-Network Structure of the S&P 500, 2004 to 2024
description: An annual sparse-covariance study of index structure built from point-in-time membership, so that no delisted constituent is silently dropped.
importance: 5
category: Quantitative and Scientific Computing
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/Changes-in-Stock-Market-Structure](https://github.com/404-ammar-not-found/Changes-in-Stock-Market-Structure) · **Written in:** Python, scikit-learn, pandas · **Period:** June to July 2026

Equities within an index do not move independently, and the structure of their dependence has a shape which need not be stable across two decades. This project estimates that structure one year at a time between 2004 and 2024, clusters it, embeds it into two dimensions, and animates the sequence, so that reorganisation over time becomes visible rather than inferred from a summary statistic.

## Survivorship bias and the sample

The methodological decision which matters most here happens before any modelling. The common approach takes the current index constituents and downloads their full price history, which conditions the entire study on having survived to the present: firms which were delisted, acquired or removed are absent from every year, including the years in which they were significant members of the index.

This study instead reconstructs membership at each point in time. Across the period, 903 distinct tickers held S&P 500 membership at some point, and each annual window is built only from the names which were in the index during that window. A company which entered in 2007 and left in 2012 appears in exactly those years.

## Method

For each annual window, the pipeline estimates a sparse inverse covariance matrix using a cross-validated graphical lasso, which yields conditional rather than marginal dependence and so distinguishes direct relationships from those mediated by a third asset. The resulting graph is clustered with affinity propagation, which selects the number of clusters rather than requiring it as input, and the nodes are then embedded into two dimensions by multidimensional scaling so that estimated edge weights become plotted distances. Each year renders as a frame with sector-coloured nodes, and the frames compose into an animation of the full period.

Affinity propagation returns between 29 and 43 exemplars depending on the year, with 30 in 2004, 43 in 2014 and 37 in 2024. The count is non-monotonic across the period.

## Limitations

Three problems, all in the estimation and the data rather than in the visualisation, keep this at an exploratory stage. I would not draw a conclusion from the current output.

The cross-validated graphical lasso failed to converge in every annual window, with dual gaps as large as 7.0e-01, so the sparse precision estimates which determine the entire layout are not trustworthy. After a 50% coverage filter the price panel holds 2,156 dates against roughly 5,280 expected trading days for the period, a shortfall which is not yet explained, and missing returns are filled with zero before correlations are computed, which biases the estimates toward independence. Sector labels resolve for only 190 of the 398 surviving tickers, so a substantial share of the nodes in a plot about sector structure carry no sector.

## Current work

Replacing the cross-validated graphical lasso with a shrinkage estimator such as Ledoit-Wolf, which converges reliably at this dimensionality even if it gives up the sparsity of the precision matrix. Then accounting for the coverage shortfall, and adding at least one quantitative series across the twenty-one windows, network density or mean off-diagonal correlation, so that the animation supports a stated conclusion instead of an impression of one.
