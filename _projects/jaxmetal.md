---
layout: page
title: GPU-Resident Neural Network Training with Hand-Written Metal Kernels
description: A from-scratch Metal compute stack that trains a multilayer perceptron entirely on Apple silicon, with every gradient verified against JAX.
importance: 1
category: Machine Learning Systems
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/jaxmetal](https://github.com/404-ammar-not-found/jaxmetal) · **Written in:** C++17, Objective-C++, Metal Shading Language, Python · **Period:** July 2026

Deep learning frameworks present a GPU as a single abstraction, and that abstraction hides the two things which actually determine throughput: how kernels are written, and how work is scheduled onto the device. This project removes the abstraction. It is a small Metal compute stack, roughly 4,500 lines across eleven Objective-C++ translation units, three Metal Shading Language kernel files, fourteen headers and fifteen Python modules, which trains a 784-1024-10 multilayer perceptron on MNIST without any tensor leaving the GPU. Correctness is not asserted but tested: gradients are checked against a NumPy reference which is itself checked against `jax.grad`.

## Motivation

I wanted to know why a hand-written GPU kernel is usually slower than a vendor library, and whether the gap comes from the arithmetic or from somewhere else entirely. Answering that requires writing both halves, the kernels and the scheduling around them, then measuring each separately against a known-good baseline. A framework cannot be used for this, because the framework is the thing under investigation.

## Implementation

### Runtime layer

A small runtime owns the Metal device and command queue as a singleton, allocates unified-memory buffers, compiles Metal Shading Language at runtime behind a pipeline-state cache, and dispatches encoders. Kernels compile under `MTLMathModeSafe` rather than the faster relaxed mode. That is a deliberate cost: relaxed math permits reassociation which makes bit-exact comparison against a CPU reference impossible, and that comparison is the only thing separating a plausible implementation from a correct one.

### Compute kernels

The matrix-multiply family exposes three interchangeable backends behind `jnp.matmul` semantics: my own Metal kernel, Apple's Metal Performance Shaders, and Accelerate on the CPU. Putting all three behind one interface is what makes the throughput comparison below meaningful. `kernels/matmul.metal` holds a 16x16 tiled reference implementation alongside a 64x64 register-blocked general matrix multiply using 4x4 micro-tiles with `float4` threadgroup reads.

The neural-network kernels are written out individually: bias addition, the rectified linear unit and its gradient, axis-0 reductions for bias gradients, a two-dimensional transpose, the stochastic gradient descent update, an argmax for evaluation, and a fused numerically stable softmax cross-entropy which bakes the 1/B batch factor directly into the gradient of the logits.

### The training step

The scheduling work sits in `src/ops/mlp.mm`. One training step encodes the forward pass, the backward pass and the weight update as approximately nineteen encoders into a single command buffer: Metal Performance Shaders matrix multiplies submitted through `encodeToCommandBuffer:`, interleaved with my own compute encoders, three explicit transposes which normalise every gradient into a plain `[M,K] x [K,N]` multiply, axis-0 reductions for the bias gradients, the fused loss, and four stochastic gradient descent updates. The buffer commits once, and the only value read back to the host is the scalar loss. Ordering within the buffer relies on Metal's intra-command-buffer hazard tracking rather than manual barriers.

A Python front end binds a flat C ABI through `ctypes`, and integration with `jax.jit` goes through an XLA foreign function interface custom call.

## Validation

Two independent references bound the error. A pure NumPy implementation of the same network is verified against `jax.value_and_grad`, agreeing to a maximum absolute gradient error of 3e-8. The GPU path is then verified against that NumPy reference, agreeing to roughly 1e-7. This gate runs before every training run, across three seeds and three combinations of batch size and hidden width, on top of a 46-case C++ test suite covering the kernels individually.

## Results

Trained end to end on the GPU, the network reaches 98.12% final and 98.15% best test accuracy over 25 epochs at batch size 512 with a learning rate of 0.5.

The scheduling result is the more interesting one. Encoding one command buffer per operation cost approximately fifteen command buffers and five host stalls per step, and that version lost to the CPU outright. Consolidating the whole step into a single command buffer produced the following, measured against an equivalent `jax.jit` CPU step on an M4 Pro at hidden width 1024.

| Batch size | Speedup over `jax.jit` on CPU |
| ---------- | ----------------------------- |
| 128        | 0.48x                         |
| 256        | 0.99x                         |
| 512        | 1.55x                         |
| 1024       | 1.82x                         |
| 2048       | 2.00x                         |

At batch 128 the GPU version runs at less than half the speed of the CPU, because at that size dispatch overhead dominates the arithmetic. The crossover sits just above batch 256, which is the practical finding: the value of a resident training step depends entirely on having enough work per dispatch to amortise it.

Isolating compute from scheduling, matrix multiplication at N=4096 gives 5358 GFLOP/s for Metal Performance Shaders, 3092 for Accelerate on the CPU, and 2112 for my own Metal kernel. The hand-written kernel therefore reaches roughly 40% of the vendor library.

## Limitations

Three constraints bound what this demonstrates. The fast training path uses Apple's Metal Performance Shaders for its matrix multiplies rather than my own kernel, so the speedup table measures my scheduling and not my kernels. The trainer is one hardcoded architecture rather than a general backend, and the PJRT device plus StableHLO lowering which would make this a genuine JAX backend are documented roadmap rather than working code. Continuous integration was also removed, because GitHub provides no Apple GPU runners, so every figure above is self-reported from a single machine and no third party has reproduced them.

## Current work

Closing the gap between my 2112 GFLOP/s kernel and the 5358 GFLOP/s vendor kernel, which is a question of register-file and threadgroup-memory use rather than a different algorithm. After that, committing the raw benchmark output so these numbers can be read from a log instead of taken on trust.
