---
layout: page
title: retrieval over research papers
description: a RAG pipeline whose 3D vector-store view shows which chunks grounded each answer
importance: 3
category: systems
---

[Repository](https://github.com/404-ammar-not-found/RAG-System-for-Research)

Two parts. A Python pipeline streams research PDFs into a persistent Chroma collection using Gemini embeddings, and a React and three.js frontend renders that collection as a 3D force-directed graph. What I wanted was not another question-answering demo but a way to see the retrieval: when the system answers, the response carries the chunk IDs it used, and the frontend lights up exactly those nodes in the graph. Most RAG projects leave the retrieval step opaque, which is precisely the step that decides whether the answer is any good.

The answering path is hand-built rather than an off-the-shelf `RetrievalQA`. Each PDF is hashed with SHA-256 so re-ingestion skips documents already in the store, and every chunk is prefixed with a `[source#chunkN]` marker that survives into the prompt so the model can cite it. A query produces several variants, each variant retrieves separately, candidates are deduplicated by content fingerprint, ranks are fused with reciprocal rank fusion at k=60, and the survivors are reranked on a weighted blend of cosine similarity, rank agreement, and query-to-chunk token overlap. The final context is ordered round-robin across source documents so one paper cannot crowd out the rest. FastAPI exposes the upload and ask endpoints, and an upload regenerates the graph.

The committed graph export comes from a real run over three papers, Attention Is All You Need, the ViT paper, and CNNpred: 191 chunk nodes joined by 188 intra-document sequence edges and 766 cosine-similarity edges above a 0.5 threshold, with no dangling references.

The honest gap is measurement. Every constant in that stack, the 0.6/0.25/0.15 rerank weights, the RRF constant, the 0.5 edge threshold, and top_k=4, is asserted rather than tuned, and there is no harness comparing the fusion and rerank pipeline against plain top-k similarity retrieval. The query variants are also weaker than the name suggests: they come from stopword stripping and a keyword filter, not from model rewriting, so they probably embed close to the original query and the fusion may be contributing little. I would rather say that than imply the design is validated. Building the retrieval benchmark, then ablating each stage against it, is what this project needs next.
