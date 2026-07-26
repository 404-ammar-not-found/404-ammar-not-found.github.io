---
layout: about
title: About
permalink: /
subtitle: BSc Computer Science and Mathematics, The University of Manchester

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

I am an undergraduate reading Computer Science and Mathematics at The University of Manchester. My interest is the theory of machine learning: the mathematics which explains why gradient descent on a heavily overparameterised network converges at all, why the resulting model generalises when classical capacity arguments say it should not, and what such a model has actually represented by the time training ends. Diffusion models and the analysis of training dynamics occupy most of my reading.

## Research interests

Two questions organise most of what I have worked on so far. What determines whether an initialisation is trainable, which is the question behind pruning and the lottery-ticket literature. And what a trained network's internal representations correspond to, which is the interpretability question and the reason I rebuild architectures rather than only using them. Diffusion models are the direction I am reading towards rather than one I have published experiments on.

I approach these by implementing rather than only reading. When a paper reports a behaviour, I would rather reconstruct the experiment and find out whether the behaviour survives a different dataset, a different seed, or the ablation the paper omitted. The [projects]({{ '/projects/' | relative_url }}) page documents that work, and each write-up states what was measured and what was not.

## Applied and engineering experience

My applied work has been in quantitative modelling and backend systems.

At Level2 I built a Gaussian hidden Markov model for intra-day market regime detection, then a live regime forecaster combining temporal convolutional networks with PatchTST, using Monte Carlo dropout for Bayesian uncertainty decomposition rather than point predictions alone. It reached an AUC of 76.1% on SPY.

At Mubit-AI the work was performance and storage. I replaced an O(session size) scan of conversation memory with a near O(limit) reverse scan, which made limited-history lookups up to 2,500 times faster while preserving identical behaviour and chronological ordering, and implemented tiered per-column-family Zstd compression that cut disk usage by 35% at minimal latency cost. At JustEat Takeaway I profiled a core Go microservice with benchmarking and `pprof`, reaching a 4x latency improvement with 3x fewer allocations, and implemented an HTTP endpoint for an order analytics service specified through OpenAPI and serving 700,000 requests a day.

## Teaching and outreach

I lead projects for the Manchester AI Society, where I have taught machine learning to more than 75 students, delivered a workshop on game theory, and built the real-time multiplayer backend in FastAPI and WebSockets for a computational poker competition.

Teaching has changed how I read papers. Preparing a workshop exposes which parts of a method you have understood and which you have only memorised, and the second category is consistently larger than expected.

## Contact

I am looking for research engineer and research scientist positions. My email address is above, and I am glad to discuss diffusion models, generalisation theory, or any of the work on this site.
