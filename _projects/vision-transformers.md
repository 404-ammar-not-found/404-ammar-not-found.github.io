---
layout: page
title: Reconstructing ViT-Base from Specification and Probing Its Attention
description: A parameter-exact rebuild of the Vision Transformer, a transfer-learning study on Oxford Flowers-102, and a per-head view of what the first block attends to.
importance: 4
category: Machine Learning Theory
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/vision-transformer-interpretability](https://github.com/404-ammar-not-found/vision-transformer-interpretability) · **Written in:** Python, PyTorch · **Period:** November 2025 to June 2026

Reading the Vision Transformer paper explains the architecture without explaining what the patch embedding does to an image, which is the part that decides whether the rest of the model has anything useful to attend to. This project works through the architecture in three stages: rebuilding ViT-Base from its published specification, transferring a pretrained instance to a fine-grained classification task, and then examining the attention distribution of its first block head by head.

## Rebuilding the architecture

The rebuild covers the patch embedding as a strided convolution, the prepended class token, learned position embeddings, multi-head self-attention, the feedforward block, and the residual and normalisation structure around both.

The test of whether a rebuild is faithful is not whether it trains, since a wrong architecture will still descend a loss. It is whether the parameter count matches the published configuration exactly, because that quantity is determined jointly by embedding dimension, depth, head count and feedforward width, and an error in any of them shifts it. Under `torchinfo` the assembled model reports 85,877,094 parameters and 22.09 GMACs, with the `Conv2d(3, 768, kernel 16, stride 16)` patch embedding accounting for 590,592 of them. Both summaries are committed alongside the notebooks so the figures can be checked rather than trusted.

## Transfer to Oxford Flowers-102

The second stage takes a pretrained ViT-Base, replaces the classifier head for the 102 flower classes, and freezes the backbone so that only the head trains. The committed confusion matrix shows a strong diagonal across the test split, so the transfer succeeded.

The provenance of that result needs stating. Training ran in Google Colab and the outputs were pasted back into the notebook rather than executed in place, so the committed notebook does not reproduce the run, and no accuracy scalar is recorded anywhere in the repository. The confusion matrix is evidence that it worked; it is not a measurement of how well.

## Attention in the first block

The third notebook extracts the class-token-to-patch attention scores from the first transformer block, separates them by head, and reshapes each onto the 14x14 patch grid so that all heads can be compared on the same image. Individual heads attend to visibly different regions, which is the expected head specialisation and is the point of looking per head rather than at an average.

The scope here is narrower than the word interpretability suggests. This is one layer of twelve, one image, and the raw query-key products before the softmax rather than normalised attention weights. It shows that heads differ. It says nothing about how attention composes across depth, and it is not attention rollout, which the notebook headers mention but which is not implemented.

## Limitations

The from-scratch training configuration as written cannot train. A batch size of 4096 against the 1,020-image Flowers-102 training split yields a single batch per epoch, and with seven epochs the learning-rate warmup of 10,000 steps holds the rate at a small fraction of its base value for the entire run. The rebuild is therefore verified structurally, by parameter count, but has never been trained to convergence.

## Current work

Correcting the batch size and warmup schedule so the rebuild can be trained and compared against the pretrained model, and implementing rollout across all twelve blocks, which is the version of this analysis that could actually attribute a prediction to a region of the input.
