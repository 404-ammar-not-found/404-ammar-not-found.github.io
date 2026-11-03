---
layout: page
title: Retrieval-Augmented Question Answering with Chunk-Level Provenance
description: A chat over arXiv papers where every cited quote is checked verbatim against its passage and each sentence is entailment-verified.
importance: 3
category: Machine Learning Systems
period: March 2026
stack: Python · LangChain · React
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/RAG-System-for-Research](https://github.com/404-ammar-not-found/RAG-System-for-Research) · **Written in:** Python, LangChain, ChromaDB, FastAPI, React · **Period:** March 2026

## Introduction

An answer from an LLM about a set of papers is fluent and unverifiable at once: a wrong number reads the same as a right one, and the interface never shows which passage a claim came from. This project is a chat over twelve arXiv PDFs (about 5,100 lines of first-party code across 39 files) where every claim must cite a passage id with a verbatim quote; the quote is string-checked against that passage, an entailment call judges each sentence, and unsupported claims are flagged.

## How I did it

PyMuPDF parses each PDF into sections and typed blocks. Dehyphenation and reflow fixed 1051 broken words across the twelve papers. Sentence-aligned splitting moved chunks starting mid-sentence from 470 of 883 (53%) to 85 of 949 (9%), recall@8 flat, MRR 0.176 to 0.199; the residual 9% resume after equations or are table cell runs, the honest floor. Captions travel as atomic blocks, equation runs become math blocks that BM25 skips, and reference sections are dropped: keeping them cost recall@8 0.273 to 0.227 and 14% of embed spend. Ingest resumes by SHA-256 content hash. A title-and-section header on each chunk is embedded as a topical anchor and stripped from the lexical index. Embeddings default to Gemini gemini-embedding-2 (3072 dimensions) in a Chroma collection created with cosine distance; local all-MiniLM-L6-v2 (384 dimensions, onnxruntime) serves quota-limited setups in its own collection.

Retrieval runs dense cosine search and an in-memory BM25 with Greek glyph folding (typed "beta1" finds β1) concurrently, fusing both by reciprocal rank fusion with k=60. A cap limits one paper to 4 passages, because 6 of the top 8 for a question once came from one paper. One listwise LLM call reranks 25 candidates to 8; prev/next chunks are fetched by id so the model reads contiguous text. The answering path is assembled by hand, with no RetrievalQA chain. FastAPI streams tokens, a cheap model condenses follow-ups into standalone queries, and stance labels applied before synthesis surface conflicting findings as a split. In the React frontend a citation opens its passage with the quoted span highlighted; the source PDF page can render behind it, and an SVG arc diagram maps which papers cite which, from metadata resolved across arXiv, Crossref, OpenAlex and Semantic Scholar, with retraction warnings where found.

## Details and clarifications

Provenance guarantees the quoted span exists in the passage it names; the character offsets are into the normalised indexed text, because a PDF has no stable character stream and two-column layout, ligature folding and reflow all move positions. Verification is one LLM call and can err; failures leave claims unchecked, and an unparseable reranker reply falls back to RRF order. Retrieval is evaluated offline through BM25 only, on a committed golden set scored through the same chunk builder the ingest uses, because the Gemini free tier allows 1000 embeddings per day; offline recall is a regression guard, since several golden questions name things the papers never call themselves. The constants (k=60, the cap of 4, chunk size 1200 with 150 overlap) are asserted. An earlier hybrid design, whose three fused scores all derived from one dense hit list, was replaced by BM25 as an independent channel.
