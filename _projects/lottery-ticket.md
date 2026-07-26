---
layout: page
title: the lottery ticket hypothesis
description: iterative magnitude pruning with the ablation controls the hypothesis actually requires
importance: 2
category: theory
---

[Repository](https://github.com/404-ammar-not-found/the-lottery-ticket-hypothesis)

The Lottery Ticket Hypothesis claims that a dense network contains a sparse subnetwork which, trained from the original initialisation, matches the accuracy of the full model. A pruning loop on its own cannot test that claim, because a sparse network that trains well might owe its success to the sparsity alone. So alongside iterative magnitude pruning on a 784-512-512-256-10 MLP with 797,184 prunable weights, I implemented the two controls that distinguish the hypothesis from its alternatives: a random mask at matched sparsity, and the winning mask paired with a fresh initialisation.

One implementation detail decides whether the experiment measures anything. The mask has to be re-applied after every optimiser step, because Adam's momentum term will otherwise drift the pruned weights away from zero and quietly restore the capacity you meant to remove. The initial parameters are deep-copied for the rewind, and the global magnitude threshold multiplies into the existing masks so that earlier structural zeros survive later rounds. Experiments write their metrics to a JSON and npz cache, and the eleven figure scripts read only from that cache, so no plot contains a number typed by hand.

On full MNIST, ten pruning iterations took the network from a dense baseline of 97.72% test accuracy to 98.33% at 89.26% sparsity, so accuracy improved while nine tenths of the weights were removed. The control comparison was run at reduced fidelity, on 8,000 of the 60,000 training images with one epoch per round and a 67.23% sparsity cap. There the winning ticket reached 92.21% against a dense baseline of 90.14%, while random re-initialisation of the same mask gave 87.29% and random pruning at matched sparsity gave 84.71%. The gap shows up faster in the loss than in accuracy: after a single epoch the ticket sat at 0.317, dense at 0.600, and random re-initialisation at 0.984. Global pruning also turns out to be strongly uneven across depth, taking 74.75% of the input layer against 36.68% of the output layer at 67% overall sparsity.

Two things keep this from being conclusive. Every run uses a single seed with no repeats, and the winning-ticket curve is non-monotonic at low sparsity (91.98, then 90.63, then 91.52), which puts the noise on the same order as the effect in that region. The controls have also only been run at the reduced fidelity described above. Repeating them on full MNIST across several seeds, with error bars, is the next step.
