---
layout: page
title: Reconstructing ViT-Base from Specification and Probing Its Attention
description: A parameter-exact rebuild of ViT-Base in PyTorch, full fine-tuning on Oxford Flowers-102, and per-head attention maps from the first transformer block.
importance: 4
category: Machine Learning Theory
period: November 2025 to June 2026
stack: Python · PyTorch
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/vision-transformer-interpretability](https://github.com/404-ammar-not-found/vision-transformer-interpretability) · **Written in:** Python, PyTorch · **Period:** November 2025 to June 2026

## Introduction

I wanted to understand the Vision Transformer by rebuilding one, because the paper explains the architecture without showing what the patch embedding does to an image, which decides whether the rest of the model has anything to attend to. The project has three stages: rebuild ViT-Base from its published specification, transfer a pretrained instance to fine-grained classification, and examine the first block's attention head by head.

## How I did it

The rebuild covers the patch embedding as a strided convolution, the prepended class token, learned position embeddings, multi-head self-attention, the feedforward block, and the residual and normalisation structure around both. A wrong architecture still descends a loss, so I verified the rebuild by parameter count, which embedding dimension, depth, head count, and feedforward width jointly determine. Under `torchinfo` the model reports 85,877,094 parameters and 22.09 GMACs, the `Conv2d(3, 768, kernel 16, stride 16)` patch embedding accounting for 590,592 of them. Both summaries are committed beside the notebooks.

For transfer I took a pretrained ViT-Base at 384 px, replaced the head for the 102 Oxford Flowers-102 classes, and fine-tuned all parameters with SGD (learning rate 3e-3, momentum 0.9) for 500 steps, keeping the best validation checkpoint. The committed confusion matrix shows a strong diagonal across the test split.

![Confusion matrix of the fine-tuned model on the Flowers-102 test split]({{ '/assets/img/projects/vit-confusion.png' | relative_url }})

The probing notebook loads that fine-tuned checkpoint, extracts the class-token-to-patch attention scores from the first block, separates them by head, and reshapes each onto the 24x24 patch grid, 576 patches at 384 px.

![Pink primrose, the Flowers-102 image fed to the probing notebook]({{ '/assets/img/projects/vit-input.png' | relative_url }})

![Per-head class-token attention over the primrose, first block, heads 0 to 10]({{ '/assets/img/projects/vit-attention.png' | relative_url }})

## Details and clarifications

Individual heads attend to visibly different regions, the expected head specialisation. The scope is narrow: one layer of twelve, one image, and the raw query-key products before the softmax, so the maps show heads differ and say nothing about how attention composes across depth. Attention rollout, named in the notebook headers, is not implemented.

The fine-tuning ran in Google Colab, with outputs pasted in rather than executed in place, so the committed notebook does not reproduce the run and no accuracy scalar is recorded. The confusion matrix is evidence the transfer worked; it does not measure how well.

The from-scratch configuration cannot train as written: batch size 4096 against the 1,020-image training split yields a single batch per epoch, and across seven epochs the 10,000-step learning-rate warmup holds the rate at a small fraction of its base value. The rebuild is verified structurally, by parameter count, and has never been trained to convergence. Current work is correcting the batch size and warmup so the rebuild can be trained and compared with the pretrained model, and implementing rollout across all twelve blocks to attribute predictions to input regions.
