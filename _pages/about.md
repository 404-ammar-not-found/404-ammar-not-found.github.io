---
layout: about
title: about
permalink: /
subtitle: BSc Computer Science & Mathematics, The University of Manchester

profile:
  align: right
  image: prof_pic.jpg
  image_circular: true # crops the image to make it circular
  more_info: >
    <p>The University of Manchester</p>
    <p>London, GB</p>
    <p>ammar.nagri1@gmail.com</p>

selected_papers: false # turn off until you have publication entries to highlight
social: true # includes social icons at the bottom of the page

announcements:
  enabled: false # no news items yet
  scrollable: true # adds a vertical scroll bar if there are more than 3 news items
  limit: 5 # leave blank to include all the news in the `_news` folder

latest_posts:
  enabled: false # no blog posts yet
  scrollable: true # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 3 # leave blank to include all the blog posts
---

I am an undergraduate in Computer Science and Mathematics at The University of Manchester. My interest is theoretical machine learning: the mathematics that explains why training works, when it fails, and what a network has actually learned by the time it converges. Diffusion models and the analysis of training dynamics take up most of my reading.

I work on questions I cannot settle by reading alone, so most of my projects exist because I wanted to check something. That has meant reimplementing methods from papers to see whether the reported behaviour survives contact with a different dataset, probing what representations a trained model relies on, and writing the numerical machinery from scratch when an existing library hides the part I want to inspect. The [projects]({{ '/projects/' | relative_url }}) page collects the ones worth reading.

The applied side of my work has been in quantitative modelling and backend engineering. At Level2 I built a Gaussian hidden Markov model for intra-day market regime detection, then a live forecaster using temporal convolutional networks and PatchTST with Monte Carlo dropout for uncertainty, which reached 76.1% AUC on SPY. At Mubit-AI I rewrote a prompt-to-model recommender to cut token use, and at JustEat Takeaway I profiled a Go microservice with pprof and benchmarking to reduce its latency and allocation count.

I also lead projects for the Manchester AI Society, where I have taught machine learning to more than 75 students, run a game theory workshop, and built the real-time multiplayer backend for a computational poker competition in FastAPI and WebSockets.

I am looking for research engineer and research scientist work. If you want to talk about diffusion models, generalisation theory, or anything on this site, my email is above.
