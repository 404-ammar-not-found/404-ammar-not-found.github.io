---
layout: page
title: Testing the Lottery Ticket Hypothesis Against Matched-Sparsity Controls
description: Iterative magnitude pruning on a 797,184-weight MNIST network, matched-sparsity controls, and the search cost of every cheaper alternative — SNIP, SynFlow, early-bird and one-shot. Interactive explorable accepted to VISxAI.
importance: 2
category: Machine Learning Theory
venue: VISxAI 2026
period: July 2026
stack: Python · PyTorch
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/the-lottery-ticket-hypothesis](https://github.com/404-ammar-not-found/the-lottery-ticket-hypothesis) · **Explorable:** [lthexplainable.vercel.app](https://lthexplainable.vercel.app/) · **Written in:** Python, PyTorch · **Period:** July 2026

## Introduction

Frankle and Carbin's Lottery Ticket Hypothesis states that a randomly initialised dense network contains a sparse subnetwork which, trained in isolation from the original initialisation, matches the full network's accuracy in a comparable number of steps. A pruning loop alone cannot test it: the survivors might be initialised favourably (the hypothesis), the sparsity might suffice regardless of which weights survive, or any sparse structure might train well at this scale. The study runs iterative magnitude pruning on a 784-512-512-256-10 multilayer perceptron with 797,184 prunable weights, holding sparsity fixed and varying what is retained.

Establishing that tickets exist is the first half. The second half is what a ticket costs to find, and whether the cheaper methods — scoring connections at initialisation (SNIP, SynFlow), cutting a few epochs in (early-bird), or training once and cutting once (one-shot) — find one too. Both halves are measured below on the same cached runs.

## How I did it

Each round trains the network, prunes the smallest-magnitude 20% of survivors under a threshold pooled globally across all layers, rewinds them to their initial values, and repeats, ten times. The two controls each remove one ingredient at matched sparsity: the ticket's exact masks with a fresh random initialisation, and a random mask rewound to the original one.

Three implementation details make the experiment valid. The mask is re-applied after every call to `optimizer.step()`: Adam maintains momentum for parameters at zero, so without re-application it drifts pruned weights off zero and silently restores the removed capacity. The initial parameter tensor is deep-copied for the rewind rather than referenced. The global threshold multiplies into the existing masks (`masks[name] *= new_mask`), preserving structural zeros from earlier rounds. The main run caches three JSON files and two compressed arrays; the 23 figure scripts read only from that cache, so no committed plot contains a hand-entered number.

For the cost comparison the protocol is fixed: three epochs of training per round, 20% of survivors pruned each round, out to 21 rounds. Reaching 99% sparsity that way trains the network 21 separate times — 63 epochs spent before a mask exists, on a network that reaches 97.7% in three. Search cost is defined as epochs spent before a mask exists; after pruning, every method receives the identical budget of survivors rewound to θ0 and trained three epochs. Fixing that budget is what makes the comparison valid, since a method allowed longer training would win for a reason unrelated to its mask.

## The result, and the controls

On full MNIST, ten pruning iterations took the dense baseline of 97.72% to 98.33% at 89.26% sparsity, so accuracy rose slightly while roughly nine tenths of the weights were removed.

![Test accuracy versus sparsity for the winning ticket and both controls]({{ '/assets/img/projects/lottery-accuracy-vs-sparsity.png' | relative_url }})

An early control comparison at reduced fidelity (8,000 of the 60,000 training images, one epoch per round, sparsity capped at 67.23%) put the ticket at 92.21% against 87.29% for its mask under a fresh initialisation and 84.71% for a random mask, with a dense baseline of 90.14%. After one epoch the ticket's loss stood at 0.317 against 0.984, under a third, so the advantage is present from the start of training. Repeated at full fidelity, the controls reach 97.61% and 95.78% at 89.26% sparsity, both below the ticket. That ordering is what the hypothesis predicts and what a pruning loop alone could never show.

![Training loss per epoch at high sparsity for the dense network, the winning ticket, and the same mask re-initialised]({{ '/assets/img/projects/lottery-loss-curves.png' | relative_url }})

Global magnitude pruning is uneven across depth, removing 74.75% of the input layer against 36.68% of the output layer at 67% overall sparsity; those rates emerge from the global threshold, not from a design choice.

## Deciding at initialisation: SNIP and SynFlow

SNIP attaches an indicator variable to every connection and measures how much the loss changes if a single connection is switched off; by the chain rule that saliency is the weight gradient multiplied by the weight. It costs one forward and one backward pass on a single minibatch and takes no optimiser step. It performs adequately and is not free: its cost appears in accuracy rather than epochs. At 10.7% of weights remaining it reaches 96.96% against iterative magnitude pruning's 98.25%, which spent 30 epochs; at 0.92% remaining it holds 91.16% against 96.76%. The gap does not close as pruning continues, but SNIP loses accuracy slowly where the later methods fall off a cliff. Its score also depends on the sampled batch: two runs here differing only in the batch scored 96.96% and a mean of 97.29%, and its authors' own sweep on a LeNet-300-100 pruned to 90% gives 1.94% error when scoring on one example against 1.40% on ten thousand.

A global score has no reason to distribute cuts evenly across layers, and this fails in a specific way: layer collapse, where the global threshold empties one layer entirely while prunable weights remain elsewhere, severing the network. SNIP removes the last weight of the 784-to-512 layer at 99.95% sparsity, after which the network returns a constant for every input. SynFlow is constructed to avoid this. Its score is conserved — summed over any set of parameters separating input from output it always totals the same value — so thinning a layer raises the score of every weight left in it and the layer protects itself. The score is computed by passing a single all-ones vector through the network and summing the output; it reads no training example. One hundred iterative rounds sound expensive but each is one forward and backward pass on a single input vector, under a tenth of one training epoch in total. SynFlow collapses too, an order of magnitude later, at 99.99% sparsity where about eighty weights remain.

On this network SNIP and SynFlow are indistinguishable: 96.95% against 96.96% at 10.7% remaining, 91.21% against 91.16% at 0.92%. Both gaps sit inside the 0.2 to 0.7 point run-to-run variation. SynFlow's published theorem concerns trainability — remaining connected down to one parameter per layer — and says nothing about accuracy; on this network the two methods that section of the literature treats as interchangeable end up 16.4 points apart at ImageNet scale.

## Deciding a few epochs in: early-bird

The early-bird observation is that the mask stops moving long before the network stops learning: compute the magnitude mask after each epoch, measure its distance from the previous epoch's mask, and cut once those distances become small. The published method reads channel masks from batch-norm scaling factors; this network has neither convolutions nor batch norm, so the idea is applied to unstructured weight masks instead — a substantial deviation. The stopping rule (queue length five, threshold 0.1) is kept, but 0.1 measured as a fraction of all 797,184 weights is a much weaker test than on a few thousand channels, and it shows: the distances are 5.7% at epoch two and 2.9% after, both already below threshold, so the rule fires at epoch six for almost every sparsity — the earliest a queue of five permits. The rule is reporting the length of its own queue.

The mask never settles, and it does not need to. At 99% sparsity, half the surviving structure is replaced between the first two epochs and a quarter of it is still replaced each epoch by epoch twenty. With the rule removed, cutting after one epoch gives 97.82%, after five 98.45% — the highest value anywhere in this experiment — and after twenty 98.05%, against IMP's 98.25% for thirty epochs. Whatever property makes a mask good is fixed within an epoch or two; the churn after that is among weights that look interchangeable, and no satisfying explanation for it has been published. The version to rely on is the published one: You et al. report the channel-based ticket drawn at epoch 10 or 20 of 160 matching or exceeding the ticket drawn at the end of training.

The limitation appears at extreme sparsity. At 0.92% of weights remaining the early-bird ticket reaches 20.81%, against 97.7% for the dense network and 10% for guessing at random — the weakest method in the study at that point, behind cutting at random. Six epochs of evidence is sufficient when nine weights in ten are removed; at 999 in 1000 the per-layer budget inferred from it is wrong by enough to destroy the network.

## Deciding once: one-shot

The simplest method gives the best return over most of the range: train once, cut once, rewind, retrain. Down to about 5% of weights remaining the one-shot and iterative curves lie on top of each other; at 10.7% remaining one-shot is ahead at 98.40% against 98.25%, for a tenth of the cost. Past the crossover the single cut collapses: at 0.92% remaining one-shot falls to 66.49% against IMP's 96.76% — sixty-three epochs against three, for a difference of thirty accuracy points. Iterating buys nothing until a threshold and then rescues the result, and the only way to learn which side a given network and schedule fall on is to test past the point. No paper prints where one-shot stops matching iterative at any scale above MNIST, so this crossover is unreplicated rather than contradicted.

## Same accuracy, different tickets

When one-shot matches IMP's accuracy, is it finding the same subnetwork? It is not. The masks are compared by overlap against the floor two unrelated masks of the same density reach by chance. At 10.7% remaining the highest agreement anywhere is one-shot at 0.218, against a chance floor of 0.057 — and one-shot starts from the same trained weights as IMP. At 0.92% remaining every method is in single digits: SNIP 0.041, SynFlow 0.033, one-shot 0.027. Matching accuracies, different tickets.

The shuffle ablation identifies what the scores actually contribute. Permuting each layer's mask internally — every layer keeps exactly the number of weights the method assigned, the choice of which is randomised — costs SynFlow between 0.1 and 0.8 points at every sparsity and SNIP about a point through the middle of the range, nothing at the sparse end. The control that does fail is a uniformly random mask, which keeps the same number of weights overall but carries no per-layer budget: at 0.92% remaining, SynFlow's shuffled mask reaches 91.01% and the uniform random mask 60.21%. Thirty-one points from the allocation alone. The useful information these scores extract is not which individual weights to keep but the layerwise proportions by which to prune — Frankle, Dziugaite, Roy and Carbin reached the same conclusion by the same ablation, and it holds at scale: across their sixteen cells (four networks including ImageNet) shuffling raises accuracy in eleven, by up to 1.6 points, and costs at most 0.7. One printed counterexample they do not discuss: shuffled SNIP on ResNet-50 at 94.5% sparsity falls to 0.1%, chance on a thousand classes.

## What this does and does not show

The caveats carry more weight than usual. One network, one dataset, one seed: retraining fixed masks with only the data ordering changed moves accuracies 0.2 to 0.7 points, and up to 3 points for the random mask at extreme sparsity, so any gap under half a point reads as zero. The three-epoch post-pruning budget is short and favours subnetworks that learn quickly. The early-bird variant is unstructured and inherits none of the published method's hardware benefit. Search cost in epochs ignores wall-clock — SynFlow's hundred scoring passes are close to free and IMP's 63 epochs are not — and sparsity on paper is not sparsity on the clock: an unstructured mask cuts parameter count, not time. The measured-energy ledger corrects the epoch axis: on CIFAR-10 the standard lottery-ticket pipeline costs 6,322 KJ at every pruning ratio and the structured early-bird matches its accuracy at 30% and 50% pruning for 23% to 38% of that energy (1,452 to 2,370 KJ, against SNIP's 3,161); on ImageNet, training the dense ResNet-50 costs 280.72 MJ against early-bird's 121.15 MJ at 70% pruning, and ThiNet, a prune-then-fine-tune method, costs more energy than training the dense network.

The published grid also carries the corrections this setup cannot detect. Rewinding to θ0 works on MNIST and not at scale: an IMP subnetwork of ResNet-50 rewound to initialisation reaches 73.7% against a dense 76.1%, barely above random pruning at 73.1%, and the fix is to rewind to an early checkpoint where subnetworks become stable — epoch 5 of 90 on ResNet-50, iteration 500 of 63,000 on ResNet-20. On ImageNet at 94.5% sparsity, SNIP scores 46.0% while pruning at random scores 59.1%, so the saliency score is thirteen points below using no score at all, and SynFlow reaches 62.4%: the two methods this study finds interchangeable on MNIST are 16.4 points apart there, and 6.9 apart on TinyImageNet. Even the source papers' costs are reported in units that do not compare — Frankle and Carbin ran one IMP experiment "15 or more times consecutively" and "more than 3,000" LeNet variants for their hyperparameter appendix; Frankle et al. 2021 left cells empty because they "ran limited ablations on ResNet-50 due to resource limitations". The cells the authors could not afford are the ones that would have tested their headline claim at scale.

Of the study's four findings — one-shot matches iterative down to about 5% remaining; early-bird fails hardest at extreme sparsity; SNIP and SynFlow are indistinguishable and 1.3 points behind IMP; the per-layer budget decides the result — the first three are properties of MNIST. The fourth is a property of pruning: a data-free score computed in under a second contributes a per-layer capacity allocation and, as far as anyone has measured, almost nothing else, and the ablation designed to refute that has failed to refute it on four networks including ImageNet.

The study also exists as an interactive explorable, [lthexplainable.vercel.app](https://lthexplainable.vercel.app/): every chart there is driven by the same cached runs, with sliders and legends for reading values off each figure. It was accepted to VISxAI, the IEEE VIS workshop on visualization for AI explainability.
