---
layout: page
title: Retrieval-Augmented Question Answering with Chunk-Level Provenance
description: A retrieval pipeline over research papers whose three-dimensional vector-store view highlights exactly which chunks grounded each answer.
importance: 3
category: Machine Learning Systems
toc:
  sidebar: left
---

**Repository:** [404-ammar-not-found/RAG-System-for-Research](https://github.com/404-ammar-not-found/RAG-System-for-Research) · **Written in:** Python, LangChain, ChromaDB, FastAPI, React, three.js · **Period:** March 2026

Retrieval-augmented generation is usually evaluated on its answers, which is the wrong place to look when it fails. When the answer is wrong, the cause is almost always retrieval, and retrieval is the step the interface hides. This system, roughly 2,400 lines of first-party code across 34 files, makes retrieval the visible object: the vector store is rendered as a three-dimensional force-directed graph, and every answer carries the identifiers of the chunks which produced it, so the frontend can highlight precisely those nodes.

## Design goal

The question I built this to answer was whether a reader could tell, at a glance, which part of a corpus a model had actually consulted. That requires provenance to survive the entire pipeline rather than being reconstructed afterwards, which in turn constrains how chunks are stored, prompted with, and returned.

## Method

### Ingestion

Each document is hashed with SHA-256 over its contents, so re-ingesting a corpus skips files already present in the store rather than duplicating them. Every chunk is prefixed with a `[source#chunkN]` marker which is embedded in the chunk text itself, so the marker survives into the prompt and the model can cite it directly. Embeddings come from the Gemini API and persist in a Chroma collection.

### Retrieval and ranking

The answering path is assembled by hand rather than delegated to an off-the-shelf `RetrievalQA` chain, because the intermediate rankings are the output of interest. A query expands into several variants; each variant retrieves independently; candidates are deduplicated by content fingerprint; the separate rankings are combined by reciprocal rank fusion with k=60; and the surviving candidates are reranked under a weighted blend of 0.6 cosine similarity, 0.25 rank agreement across variants, and 0.15 token overlap between query and chunk. The final context is then ordered round-robin across source documents, so a single paper with many strong chunks cannot crowd the other sources out of the window.

### Interface

FastAPI exposes upload and ask endpoints. An upload ingests the document and regenerates the graph; an ask returns the answer together with the chunk identifiers behind it. The React and three.js frontend renders chunks as nodes, joins them by both reading order and embedding similarity, and lights up the grounding chunks when an answer arrives.

## Results

The committed graph export comes from a genuine run over three papers, Attention Is All You Need, An Image is Worth 16x16 Words, and CNNpred. It contains 191 chunk nodes joined by 954 edges: 188 intra-document sequence edges preserving reading order, and 766 cosine-similarity edges above a 0.5 threshold, with no dangling references. The pipeline therefore runs end to end, and the provenance highlighting works on real retrieved output.

## Limitations

The measured half of this project does not exist, and that is the honest headline. There is no retrieval benchmark, no baseline comparing the fusion and reranking stack against plain top-k similarity search, and no ablation isolating any stage. Every constant is asserted rather than tuned: the 0.6, 0.25 and 0.15 rerank weights, the fusion constant k=60, the 0.5 similarity threshold for graph edges, and a retrieval depth of four from twenty candidates.

The query expansion is also weaker than the term multi-query implies. Variants are produced by stopword removal, a minimum-length keyword filter, and a template string, not by model rewriting, so they very likely embed close to the original query. If so, the fusion machinery contributes little, and nothing in the repository currently measures whether it does.

## Current work

Building a question set with known relevant passages, scoring plain similarity retrieval against the full pipeline on it, and then ablating each stage. Without that, the ranking design is a hypothesis rather than a result.
