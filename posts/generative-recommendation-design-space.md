---
title: 'Generative Recommendation Isn''t One Architecture — It''s a Design Space'
date: '2026-08-22'
excerpt: 'Semantic-ID generative retrieval and HSTU-style sequential generation solve the same problem in opposite ways. Both are already in production at scale, and both share a bottleneck neither one has solved.'
author: 'Bhavtosh Rath'
categories: ['Recommendation Systems']
readTime: '5 mins'
---

## TL;DR

- Generative recommendation isn't one architecture anymore. It's a design space, and semantic-ID methods and HSTU-style sequential models are the two directions worth watching right now.
- Semantic-ID retrieval turns items into short hierarchical token codes and generates them level by level, broad category down to specific item.
- HSTU treats the user's raw interaction history as an ordered sequence and predicts what comes next, which is why it can surprise you with something genuinely adjacent, not just similar.
- Both are slow to serve. Autoregressive decoding is inherently serial, and that doesn't go away no matter which one you pick.
- My bet: semantic-ID wins out for large-scale systems, though I go back and forth on this.

Generative recommendation is starting to look less like a single new architecture and more like a new design space. The basic idea is simple to state: treat recommendation as generation rather than ranking. Actually making that work is another matter, and there are very different ways to go about it. One approach focuses on how we represent items, turning them into semantic tokens and generating them autoregressively. The other focuses on how we represent user intent, modeling the interaction history as a sequence and predicting what comes next. These are fundamentally different systems, not variations on the same one.

In this post I want to unpack two of the most interesting directions: semantic-ID-based generative retrieval, and HSTU-style sequential generative recommendation. I'll look at where each is being used, what each gets right, and, most importantly, where I think the field is heading. My goal isn't to declare a winner based on today's benchmarks. It's to reason about which pattern is more likely to become the dominant paradigm for large-scale recommendation over the next few years.

## What is a semantic ID?

A semantic ID is a short sequence of small numbers assigned to an item by clustering its embedding hierarchically. You take the item's embedding, group it into a broad cluster first, then split that cluster into finer sub-clusters, and keep repeating this a few levels deep, so each level narrows the item down further — like folder-within-folder. The final code is basically the path you took through those levels (cluster 3, then sub-cluster 7, then sub-sub-cluster 2, say), giving a compact ID where items that are alike share the same early parts of the path. Think category hierarchy on retail websites like Target → Home & Decor → Home Decor → Decorative Accents → Vases.

## Generating a semantic ID, one level at a time

The recommender predicts the code one level at a time, in order, and each new level's prediction is conditioned on the levels already generated. It first predicts the broad cluster (level 1), then, knowing that choice, predicts which sub-cluster is within it (level 2), then the next level within that, and so on. It's the same idea as a language model predicting one word at a time, where each next word depends on the ones already written.

## HSTU: predicting the next step, not the closest match

HSTU treats a user's history as an actual sequence: item, action, item, action, ordered by time, fed through a transformer built for this kind of data. That lets the model predict "what's the natural next step given this exact unfolding sequence," rather than "what's generally similar to this user." So the recommendation can be something less obvious. A different category, a different price tier, even a completely adjacent product, if that's genuinely what the sequence points to. A simple embeddings-based recommender would instead collapse the user into a static representation, losing the order and context of their actions, and would tend to recommend things similar to their historical interests rather than the specific next step in their journey.

## Who's actually using HSTU

HSTU isn't just a paper Meta published and moved on from. A recent academic survey on generative recommendation (Hou et al., 2026) tracks two other companies that built directly on top of it: Meituan created MTGR by adding cross features and a modified masking strategy on an HSTU backbone, and Xiaohongshu (Redbook) built GenRank the same way for their fine-grained ranking stage.

The survey also has a number worth sitting with: HSTU has been scaled up to 1.5 trillion parameters, and it's still getting better. Traditional discriminative recommenders top out around 200 billion. Past that, more parameters just don't buy you anything. That's basically the scaling-law story we've all watched play out with LLMs, showing up again in recommendation.

## Semantic IDs have production wins too

The TIGER paper is where semantic IDs started, but it didn't stay a single paper either. The same survey lists a whole line of follow-on methods built on the idea: RPG, LC-Rec, ActionPiece, LETTER, TokenRec, SETRec, CCFRec, LLM2Rec, SIIT. That's multiple research groups over several years, which is usually a sign a technique has become its own subfield rather than a one-off trick.

The clearest production proof is Kuaishou's OneRec, an end-to-end generative recommender built on RQ-VAE semantic IDs that replaced their entire retrieval → coarse-ranking → fine-ranking cascade. According to the survey, it improved total watch time by 1.68% and cut computational cost down to about 10.6% of what the old cascade needed. That's a real system running in production, not a number from a benchmark table.

## The bottleneck neither one solves

Here's the thing both approaches quietly share. Generating a recommendation with either HSTU or semantic-ID GR means running the model step by step — one token, then the next, then the next. The same survey calls this out directly as an open deployment challenge, stating "it requires multiple serial calls to the LLM, resulting in excessive time consumption, which hinders its practical application in real-time recommendation scenarios."

Basically, the better these models get, the harder they are to actually serve inside the half-second a real product gets to respond in. And it's not like one architecture figured out a workaround and the other didn't — neither has. This is just what "generative" costs you here, not a flaw you can engineer out of one specific design.

---

*Sources:*
- [A Survey on Generative Recommendation: Data, Model, and Tasks (Hou et al.)](https://arxiv.org/abs/2510.27157)
- [Actions Speak Louder than Words: Trillion-Parameter Sequential Transducers for Generative Recommendations (HSTU)](https://arxiv.org/abs/2402.17152)
- [Recommender Systems with Generative Retrieval (TIGER)](https://arxiv.org/abs/2305.05065)
- [OneRec: Unifying Retrieve and Rank with Generative Recommender and Iterative Preference Alignment](https://arxiv.org/abs/2502.18965)
