---
layout: page
title: changes in stock market structure
description: correlation-network structure of the S&P 500 over 21 years, built from point-in-time index membership
importance: 5
category: quantitative finance
---

[Repository](https://github.com/404-ammar-not-found/Changes-in-Stock-Market-Structure)

The question is whether the correlation structure of a large equity index has a shape that changes over time, and whether that change is visible. Most retail versions of this study start from today's index constituents and download their full price history, which conditions the whole analysis on having survived to the present. I built the panel from point-in-time membership instead: 903 distinct tickers held S&P 500 membership at some point between 2004 and 2024, and each annual window uses only the names that were in the index during that window.

The pipeline estimates a sparse inverse covariance matrix per year with a graphical lasso, clusters the resulting graph with affinity propagation, and embeds the nodes into two dimensions with multidimensional scaling so that edge weights become distances. Each year renders as a frame with sector-coloured nodes, and the frames animate into a single view of the index reorganising itself. Affinity propagation returns between 29 and 43 exemplars depending on the year, with 30 in 2004, 43 in 2014 and 37 in 2024.

Three problems keep this at the exploratory stage rather than a finding, and they are all in the estimator and the data rather than the visualisation. The cross-validated graphical lasso failed to converge in every annual window, with dual gaps as large as 7.0e-01, so the sparse precision estimates that determine the layout are not trustworthy. After a 50% coverage filter the panel holds 2,156 dates against roughly 5,280 expected trading days for the period, and missing returns are filled with zero before correlations are computed, which biases the estimates toward independence. Sector labels resolve for only 190 of the 398 surviving tickers, so a substantial fraction of the nodes in a plot about sector structure are unlabelled.

The fixes are clear enough. A shrinkage estimator such as Ledoit-Wolf in place of the cross-validated graphical lasso would give covariance estimates that converge. The coverage gap needs explaining rather than filtering. Most importantly the project needs at least one quantitative series across the 21 years, network density or mean off-diagonal correlation per window, so that the animation supports a stated conclusion instead of an impression of one.
