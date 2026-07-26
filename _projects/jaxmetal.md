---
layout: page
title: jaxmetal
description: hand-written Metal kernels that train a neural network entirely on the Apple GPU
importance: 1
category: systems
---

[Repository](https://github.com/404-ammar-not-found/jaxmetal)

I started this to learn low-level GPU programming by writing the parts a framework normally hides. It trains a 784-1024-10 MLP on MNIST with every tensor resident on the GPU of an Apple silicon machine, using Metal Shading Language kernels I wrote by hand: a 16x16 tiled reference GEMM, a register-blocked 64x64 GEMM with 4x4 micro-tiles and float4 threadgroup reads, bias add, ReLU and its gradient, axis reductions, transpose, the SGD update, argmax, and a fused numerically stable softmax cross-entropy that bakes the 1/B factor into dlogits.

The performance lesson turned out to be about scheduling rather than arithmetic. Encoding one command buffer per operation cost roughly fifteen commits and five host stalls per training step, and that version lost to the CPU outright. Encoding the forward pass, the backward pass and the weight update as about nineteen encoders into a single command buffer removed the stalls. After that change the resident GPU step overtakes a `jax.jit` CPU step from batch size 256 upward, measured on an M4 Pro at hidden width 1024: 0.48x at batch 128, 0.99x at 256, 1.55x at 512, 1.82x at 1024, and 2.00x at 2048.

Correctness is checked against two references rather than eyeballed. A pure NumPy implementation is verified against `jax.value_and_grad` to a maximum absolute gradient error of 3e-8, and the GPU path matches that reference to roughly 1e-7. The repository carries 46 C++ unit tests and a Python gate that compares GPU output to the golden model across three seeds and three combinations of batch size and hidden width. Training reaches 98.12% test accuracy after 25 epochs at batch 512 with a learning rate of 0.5.

Two limits are worth stating plainly. The fast path uses Apple's MPS for its GEMMs, and my own kernel currently reaches about 40% of MPS throughput at N=4096 (2112 against 5358 GFLOP/s, where Accelerate on the CPU gives 3092), so narrowing that gap is the active work. The trainer is also one fixed architecture rather than a general backend: the PJRT and StableHLO plumbing that would make this an actual JAX device is scaffolding for now. All figures above are from my own machine, since the CI runners have no Apple GPU to reproduce them on.
