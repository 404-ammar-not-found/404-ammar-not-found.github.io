---
layout: page
title: Testing the Lottery Ticket Hypothesis Against Matched-Sparsity Controls
description: An iterative magnitude pruning study on MNIST, built around the two ablation controls which separate the hypothesis from its alternative explanations.
importance: 2
category: Machine Learning Theory
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/the-lottery-ticket-hypothesis](https://github.com/404-ammar-not-found/the-lottery-ticket-hypothesis) · **Written in:** Python, PyTorch · **Period:** July 2026

Frankle and Carbin's Lottery Ticket Hypothesis states that a randomly initialised dense network contains a sparse subnetwork which, trained in isolation from the original initialisation, matches the accuracy of the full network in a comparable number of steps. A pruning loop alone cannot test that statement, because a sparse network which trains well may owe its performance to the sparsity pattern, to the initialisation, or to neither. This study implements iterative magnitude pruning on a 784-512-512-256-10 multilayer perceptron with 797,184 prunable weights, together with the two controls needed to attribute the effect.

## The claim under test

Three explanations compete for any observed result. The subnetwork succeeds because its particular weights were initialised favourably, which is the hypothesis. It succeeds because a network of that sparsity is sufficient for the task regardless of which weights survive. Or it succeeds because sparse networks of any structure train well at this scale. Distinguishing them requires holding sparsity fixed and varying what is retained, so the experiment includes a random mask at matched sparsity and the discovered mask paired with a fresh initialisation.

## Method

Iterative magnitude pruning proceeds in rounds. Train to convergence, prune the smallest-magnitude weights globally across all layers, rewind the survivors to their values at initialisation, and repeat. Two implementation details determine whether the experiment measures anything at all.

The mask must be re-applied after every call to `optimizer.step()`, not merely at the start of each round. Adam maintains momentum for parameters which are currently zero, so without re-application the optimiser drifts pruned weights away from zero and silently restores the capacity the experiment intended to remove. The initial parameter tensor is also deep-copied for the rewind rather than referenced, and the global magnitude threshold multiplies into the existing masks (`masks[name] *= new_mask`) so that structural zeros established in earlier rounds survive later ones.

Results are separated from presentation. Each run writes three JSON files and two compressed arrays to a cache, and the eleven figure scripts read only from that cache, so no committed plot contains a number entered by hand.

## Results

Two runs at different fidelities exist, and they answer different questions. They should not be read as one experiment.

The full-MNIST run, without controls, establishes that pruning works on this network. Ten pruning iterations took it from a dense baseline of 97.72% test accuracy to 98.33% at 89.26% sparsity, so accuracy rose slightly while roughly nine tenths of the weights were removed.

The control comparison was run at reduced fidelity, on 8,000 of the 60,000 training images with one epoch per round and a sparsity cap of 67.23%.

| Condition                            | Test accuracy | Loss after one epoch |
| ------------------------------------ | ------------- | -------------------- |
| Dense baseline                       | 90.14%        | 0.600                |
| Winning ticket                       | 92.21%        | 0.317                |
| Same mask, fresh initialisation      | 87.29%        | 0.984                |
| Random mask, matched 67.23% sparsity | 84.71%        | not recorded         |

The ordering matters more than the absolute values. The winning ticket beats both controls, which is what the hypothesis predicts and what a pruning-only experiment could never have shown. The loss column separates them fastest: after a single epoch the ticket sits at less than a third of the loss of its own mask under a fresh initialisation, so the advantage is present very early in training rather than emerging gradually.

Global magnitude pruning also turns out to be markedly uneven across depth, removing 74.75% of the input layer against 36.68% of the output layer at 67% overall sparsity. Layer-wise pruning rates are an emergent property of the global threshold, not a design choice.

## Limitations

Every run uses a single seed with no repetitions, so no claim of statistical significance is available. The winning-ticket accuracy curve is non-monotonic at low sparsity, moving 91.98%, then 90.63%, then 91.52%, which puts run-to-run noise on the same order as the effect in that region. The controls exist only at the reduced fidelity described above, so the strongest accuracy figure and the strongest attribution evidence come from different runs.

## Current work

Repeating the control conditions on full MNIST across at least three seeds with error bars, which resolves both the fidelity mismatch and the significance question in a few hours of compute.
