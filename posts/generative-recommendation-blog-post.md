---
title: 'Personalization Is Having Its ChatGPT Moment: Inside the Shift to Generative Recommendation'
date: '2026-08-04'
excerpt: 'Recommendation is converging on the same generative, transformer-based modeling that reshaped NLP — semantic IDs and sequential transformers are replacing two-tower retrieval at Netflix, Kuaishou, Meta, and beyond.'
author: 'Bhavtosh Rath'
categories: ['Personalization', 'LLM', 'Recommendation Systems']
readTime: '6 mins'
---

## TL;DR

- Recommendation is going through the same shift NLP went through with ChatGPT: from scoring/matching (two-tower embeddings + ranking) to **generative recommendation**, where the model generates the next item(s) a user wants, token by token.
- Two building blocks make this possible: **semantic IDs** (items as discrete token sequences instead of arbitrary catalog IDs, from Google's TIGER, Spotify, Snapchat) and **sequential transformers at catalog scale** (Meta's HSTU).
- It's already in production, not just research — Netflix's GenRec, Kuaishou's OneRec/OneRec-V2, and reported efforts at Meta, Alibaba, ByteDance, Tencent, Baidu, JD.com, and Xiaohongshu.
- The appeal: one architecture can unify retrieval, ranking, and even search/ads, and it handles cold start better since a new item's tokens come from its content, not its history.
- The catch: semantic ID tokenizer design is still an open research problem, discrete tokens can lose information dense embeddings capture, and it's operationally heavier than the decade-hardened two-tower stack it's replacing.

For twenty years, personalization meant matching. You have a user, you have a catalog of items, and a model scores how well each item fits that user — collaborative filtering, then deep learning rankers, then two-tower embedding models. Score everything, sort, serve the top results. It worked well enough to become the invisible infrastructure behind most of the internet: Amazon's recommender drives roughly a third of its purchases, and Netflix recommendations shape about three-quarters of what people actually watch.

That architecture is now being replaced, and the shift is fast enough that people in the field are openly comparing it to the ChatGPT moment in NLP. The comparison isn't new — Tullie Murrell asked ["Is This the ChatGPT Moment for Recommendation Systems?"](https://tullie.ai/blog/chatgpt-moment-for-recommendations) back in June 2024, right after Meta published its Generative Recommenders (HSTU) paper, and Yuan Meng revisited the same question in August 2025 in ["Is Generative Recommendation the ChatGPT Moment of RecSys?"](https://www.yuan-meng.com/posts/generative_recommendation/) — what's changed since then is how much production evidence has piled up behind it. The new paradigm is called **generative recommendation**, and if you want to understand where personalization is headed, this is the thing to track.

## The old way, briefly

Classic recommender systems work in two stages. A "two-tower" model builds a vector embedding for the user and a vector embedding for each item, then finds items whose embeddings are close to the user's — this is the "retrieval" stage, pulling a few hundred candidates from a catalog of millions. A separate, heavier ranking model then scores those candidates more precisely. It's fast, scalable, and it's what powered the recommendation industry for most of its existence. Its weakness: the model doesn't really "understand" a user's history so much as it compresses it into a fixed vector, which loses sequence, context, and the reasoning a human would apply.

## What's changing: treating recommendation like language generation

The core idea behind generative recommendation is deceptively simple — treat a user's interaction history the way you'd treat a sentence, and treat recommendation the way you'd treat text generation. Instead of scoring a huge candidate list, the model generates the next item(s) a user is likely to want, token by token, the same way an LLM generates the next word.

Two pieces make this possible, and both are now standard vocabulary in the field.

**Semantic IDs.** Items (a movie, a song, a product) get converted into short sequences of discrete tokens that capture their semantic content, rather than being represented by an arbitrary catalog ID. Google's TIGER paper introduced this approach in 2023, and it's since been adopted and extended by Spotify and Snapchat, both of whom have published detailed accounts of how they built semantic-ID tokenizers for their own catalogs in 2025–2026. The appeal: semantically similar items get similar token sequences, which helps with cold start (a brand-new song can still get reasonable tokens based on its content, even with zero play history) and lets the same generative architecture handle retrieval, ranking, and even search with one shared representation.

**Sequential transformers at catalog scale.** Once items are tokenized, you need an architecture that can model long user histories efficiently. Meta's HSTU (Hierarchical Sequential Transduction Units) was built specifically for this — modeling extremely long, high-frequency interaction sequences at a scale existing transformer variants weren't designed for, described as operating over what Meta calls a "trillion-parameter" sequential recommendation model.

Put side by side, the two paradigms differ on almost every architectural decision:

| Dimension | Traditional embedding-based recsys | Generative recommendation |
| --- | --- | --- |
| Item representation | Dense vector embedding, looked up from an arbitrary catalog ID | Short sequence of discrete tokens (semantic ID) derived from item content |
| Core mechanism | Similarity search — find items whose embeddings are close to the user's | Autoregressive generation — predict the next item token by token, like next-word prediction |
| Pipeline shape | Two separate stages: retrieval (two-tower) then ranking | Often a single generative model handles retrieval, ranking, and search |
| User history | Compressed into a single fixed-length vector, losing order and context | Modeled as a sequence, preserving order and context (e.g., Meta's HSTU) |
| Cold start | Weak — new items/users have no interaction history to embed against | Better — a new item's semantic tokens come from its content, not its history |
| Serving infrastructure | Vector similarity search (ANN indexes) at prediction time | GPU-accelerated autoregressive inference (vLLM, Triton-style stacks), closer to LLM serving |
| Maturity | A decade-plus of production hardening | Early — in production at Netflix, Kuaishou, and others, but operationally newer |

## Who's actually shipping this

This isn't a research curiosity — it's in production at scale, and the pace of adoption in 2025–2026 has been notable:

**Netflix's GenRec**, published in mid-2026, adapts Netflix's internal foundation LLM directly into a recommendation ranker. It verbalizes a user's viewing history, context, and catalog metadata into a language-model-style input, adds a catalog-aware ranking head, and trains with reward-weighted objectives tied to long-term satisfaction rather than short-term clicks. Netflix has also published separate work on using LLM post-training techniques for artwork personalization — deciding which thumbnail to show which user.

**Kuaishou's OneRec**, first released in February 2025, introduced a unified encoder-decoder generative architecture with an RL-based refinement step (Iterative Preference Alignment) that adjusts recommendations using real user feedback and reward models. By June 2025, OneRec-V2 moved to a fully autoregressive decoder and extended the approach to jointly optimize recommendation, search, and advertising from one system — a meaningful shift, since these were traditionally separate stacks.

**Meta, Alibaba, Meituan, ByteDance, Tencent, Baidu, JD.com, and Xiaohongshu** are all reported to be pursuing versions of this generative paradigm for their own retrieval and ranking systems, which suggests this isn't one company's bet but a genuine industry-wide architectural shift.

## Why this matters beyond "bigger model, better results"

A few things about generative recommendation are worth understanding even if you never implement it yourself:

It unifies systems that used to be separate. Search, recommendation, and advertising have historically run on different infrastructure with different objectives. When everything is tokenized items and a shared generative model, one architecture can serve all three — which is part of why Kuaishou explicitly optimized OneRec-V2 across all of them jointly.

It changes what "cold start" means. Traditional collaborative filtering struggles badly with new items and new users because it has no interaction history to learn from. Semantic IDs partially sidestep this: a new item's tokens are derived from its content, so the model has *something* to reason about even with zero engagement data.

It's pulling recommendation infrastructure toward LLM infrastructure. Serving these models increasingly means GPU-accelerated inference stacks (vLLM, Triton), careful batching, and caching strategies borrowed directly from how LLMs are served — a real operational shift for teams that built their infra around classic RecSys assumptions.

## The honest caveats

This is a genuinely new paradigm, and it comes with genuinely unresolved problems, not just implementation details to smooth over.

Semantic ID tokenizer design is still an open research question. Recent papers (including diagnostic work like SIDInspector and comparative studies on tokenizer reliability) point out that different tokenization choices produce meaningfully different downstream behavior, and the field doesn't yet have a settled best practice — comparisons between approaches in the literature aren't always apples-to-apples.

Purely discrete semantic IDs can lose information that dense embeddings capture well, which is why several 2025–2026 papers are exploring hybrid dense-plus-discrete representations rather than committing fully to one or the other.

Generative recommendation is also compute-heavier and operationally newer than mature two-tower systems, which have had a decade of production hardening. Companies adopting it are making a real infrastructure bet, not a drop-in upgrade.

## Where this leaves personalization as a field

The direction is fairly clear: recommendation is converging with the same generative, transformer-based modeling that reshaped NLP, and the companies with the largest catalogs and interaction volumes (Netflix, Meta, Kuaishou, Alibaba, ByteDance) are the ones defining the architecture as they go. If you're tracking this space, the specific things worth watching are how semantic ID tokenization standardizes (or doesn't), whether hybrid dense/discrete representations win out, and how many more companies follow Kuaishou's lead in unifying search, recommendation, and ads under one generative model.

---

*Sources:*
- [GenRec: Towards LLM-Native Recommendation at Netflix](https://netflixtechblog.com/genrec-towards-llm-native-recommendation-at-netflix-f20be6f643e3)
- [Netflix Artwork Personalization via LLM Post-training](https://research.netflix.com/publication/netflix-artwork-personalization-via-llm-post-training)
- [Generative Recommendation: A Survey of Models, Systems, and Industrial Advances](https://www.techrxiv.org/doi/10.36227/techrxiv.176523089.94266134)
- [Semantic IDs for Recommender Systems at Snapchat](https://arxiv.org/pdf/2604.03949)
- [Semantic IDs for Generative Search and Recommendation | Spotify Research](https://research.atspotify.com/2025/9/semantic-ids-for-generative-search-and-recommendation)
- [Is Generative Recommendation the ChatGPT Moment of RecSys?](https://www.yuan-meng.com/posts/generative_recommendation/)
- [Is This the ChatGPT Moment for Recommendation Systems?](https://tullie.ai/blog/chatgpt-moment-for-recommendations)
- [Recommender Systems with Generative Retrieval (TIGER)](https://arxiv.org/abs/2305.05065)
- [SIDInspector: A Mapping-First Diagnostic Resource for Semantic-ID Tokenizers](https://arxiv.org/pdf/2606.10375)
- [How Reliable Are Semantic-ID Tokenizer Comparisons in Generative Recommendation?](https://arxiv.org/pdf/2605.25330)
- [End-to-End Personalization: Unifying Recommender Systems with Large Language Models](https://arxiv.org/html/2508.01514)
