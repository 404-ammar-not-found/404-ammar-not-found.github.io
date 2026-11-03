---
layout: page
title: GPU-Resident Neural Network Training with Hand-Written Metal Kernels
description: A from-scratch Metal compute stack that trains an MLP entirely on the Apple GPU, gradients verified against JAX, 1.6x to 3.2x faster than the CPU step.
importance: 1
category: Machine Learning Systems
period: July 2026
stack: C++17 · Metal · Python
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/jaxmetal](https://github.com/404-ammar-not-found/jaxmetal) · **Written in:** C++17, Objective-C++, Metal Shading Language, Python · **Period:** July 2026

## Introduction

The question behind this project is why a hand-written GPU kernel usually loses to a vendor library, and whether the gap is arithmetic or scheduling, the two things a framework's GPU abstraction hides. A framework is the thing under investigation, so I wrote both halves: about 5,300 lines (sixteen Objective-C++ and C++ translation units, seven Metal Shading Language kernel files, sixteen headers, eight Python modules) training a 784-1024-10 multilayer perceptron on MNIST with no tensor leaving the GPU, every gradient checked against a NumPy reference that is itself checked against `jax.grad`.

## How I did it

A singleton runtime owns the Metal device and command queue, allocates unified-memory buffers, compiles Metal Shading Language at runtime behind a pipeline-state cache, and dispatches encoders through a coalescer that holds one compute encoder open across consecutive kernel dispatches. Matrix multiply has three interchangeable backends behind `jnp.matmul` semantics: my own Metal kernel, Metal Performance Shaders, and Accelerate on the CPU. `kernels/matmul.metal` pairs a 16x16 tiled reference with a 64x64 register-blocked GEMM using 4x4 register micro-tiles and `float4` threadgroup reads; `simdgroup_matrix` gave no gain, since Apple GPUs have no f32 matrix unit. The network kernels are written individually: bias addition, the rectified linear unit and its gradient, axis-0 bias-gradient reductions, a two-dimensional transpose, the stochastic gradient descent update, an argmax for evaluation, and a fused numerically stable softmax cross-entropy baking the 1/B batch factor into the gradient of the logits.

`src/ops/mlp.mm` encodes a chunk of consecutive steps into one command buffer: MPS matrix multiplies via `encodeToCommandBuffer:`, roughly nineteen of my compute encoders, three transposes applied as MPS flags that normalise every gradient into a plain `[M,K] x [K,N]` multiply, axis-0 bias-gradient reductions, the fused loss, and four SGD updates. It commits once per chunk, the only host readback is the scalar loss, and ordering relies on Metal's intra-command-buffer hazard tracking. A Python front end binds a flat C ABI through `ctypes`; `jax.jit` integration goes through an XLA foreign function interface custom call.

Trained end to end, the network reaches 98.12% final and 98.15% best test accuracy over 25 epochs at batch size 512 with learning rate 0.5. Against an equivalent `jax.jit` CPU step on an M4 Pro, hidden width 1024:

| Batch size | 32    | 128   | 512   | 2048  |
| ---------- | ----- | ----- | ----- | ----- |
| Speedup    | 1.60x | 2.42x | 3.02x | 3.16x |

## Details and clarifications

Kernels compile under `MTLMathModeSafe` because relaxed math permits reassociation, which makes bit-exact comparison against a CPU reference impossible; that comparison is the only thing separating a plausible implementation from a correct one, and it also protects the Neumaier compensated f32 reductions, whose algebraically zero compensation terms a fast-math build would fold away (Apple GPUs have no float64). The NumPy reference agrees with `jax.value_and_grad` (jax 0.10.2) to a 3e-8 maximum absolute gradient error, the GPU path with that reference to roughly 1e-7; the gate runs before every training run, across three seeds and three batch size and hidden width combinations, plus 73 C++ tests and 10 Python gates.

The speedup table measures my scheduling, because the fast path uses MPS matrix multiplies: compute-only at N=4096 gives 5358 GFLOP/s for MPS, 3092 for Accelerate, 2112 for my kernel, roughly 40% of the vendor library. The earlier one-buffer-per-operation version cost about fifteen commits and five host stalls per step and lost to the CPU; chunked submission cut per-step time about 4.4x and moved the crossover to roughly batch 60 at hidden width 128. The floor is hard (a command buffer round trip stays above about 95 µs, and the whole CPU step at batch 1 takes about 20 µs), so `Mlp(device="auto")` routes by a measured cost model. The trainer is one hardcoded architecture, the FFI path copies operands on every call, and the PJRT device plus StableHLO lowering that would generalise it remain roadmap, with a scaffold in `jaxmetal.plugin`. CI was removed because GitHub provides no Apple GPU runners, so every figure is self-reported from one machine. Current work is closing the 2112 to 5358 GFLOP/s gap, a question of register-file and threadgroup-memory use with the algorithm unchanged, then committing raw benchmark output so the numbers can be read from a log.
