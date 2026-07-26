---
layout: page
title: vision transformers from scratch
description: rebuilding ViT-Base from the paper, finetuning it on Flowers-102, and looking at where its attention goes
importance: 4
category: interpretability
---

[Repository](https://github.com/404-ammar-not-found/vision-transformer-interpretability)

Reading the ViT paper did not tell me what the patch embedding actually does to an image, so I rebuilt the architecture from the paper's own specification: patch embedding as a strided convolution, the class token, learned position embeddings, multi-head self-attention, the MLP block, and the residual structure around both. The test of whether a rebuild is faithful is the parameter count, so I checked mine against the published ViT-Base configuration. `torchinfo` puts the assembled model at 85,877,094 parameters and 22.09 GMACs, with the `Conv2d(3, 768, kernel 16, stride 16)` patch embedding accounting for 590,592 of them. Those summaries are committed next to the notebooks.

A second notebook finetunes a pretrained ViT-Base on Oxford Flowers-102, replacing the classifier head and freezing the backbone. The committed confusion matrix shows a strong diagonal across the test split, so the transfer worked. I should be clear about how that result got there: the training ran in Colab and the outputs were pasted back into the notebook, so the version in the repository does not reproduce the run, and no accuracy scalar is recorded anywhere.

The third notebook asks where attention goes. It takes the class-token-to-patch scores from the first transformer block, splits them per head, and reshapes each onto the 14x14 patch grid so the heads can be compared side by side on the same image. Different heads clearly attend to different regions. This is a single layer and a single image, and it plots the raw query-key products rather than a full attention rollout across blocks, so it shows head specialisation without saying anything about how attention composes with depth.

Two pieces are outstanding. The from-scratch training configuration as written never trains: a batch size of 4096 against the 1,020-image Flowers-102 train split gives one batch per epoch, and with seven epochs the learning-rate warmup of 10,000 steps means the rate never leaves its floor. Fixing that and training the rebuild properly is the first job. The second is implementing rollout over all twelve blocks, which is the version of this that would actually explain a prediction.
