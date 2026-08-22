---
title: 'Generative Recommendation Isn''t One Architecture — It''s a Design Space'
date: '2026-08-22'
excerpt: 'Semantic-ID generative retrieval and HSTU-style sequential generation solve the same problem in opposite ways. Both are already in production at scale, and both share a bottleneck neither one has solved.'
author: 'Bhavtosh Rath'
categories: ['Recommendation Systems']
readTime: '5 mins'
---

## TL;DR

- Generative recommendation is turning into a design space, not a single architecture — semantic-ID methods and HSTU-style sequential models both "generate" recommendations, but they make almost opposite choices about what to represent.
- Semantic-ID generative retrieval turns items into short, hierarchical token codes and generates them autoregressively, one level at a time, from broad category down to specific item.
- HSTU-style generation instead models the user's raw interaction history as an ordered sequence and predicts what comes next, which is why it can suggest something genuinely adjacent rather than just similar.
- Both patterns have moved past research papers into production at real scale: Kuaishou's OneRec (semantic IDs) and Meituan's MTGR / Xiaohongshu's GenRank (HSTU) are live systems, not benchmarks.
- Both share the same open problem — autoregressive, step-by-step decoding is inherently serial, and that's in tension with the sub-second latency real recommendation surfaces need.

Generative recommendation is starting to look less like a single new architecture and more like a new design space. The basic idea — treat recommendation as generation rather than ranking — sounds simple, but there are very different ways to make that idea work in practice. Some approaches focus on how we represent items, turning them into semantic tokens that a generative model can produce. Others focus on how we represent user intent, modeling the user's interaction history as a sequence and predicting what comes next. These choices lead to fundamentally different systems, trade-offs, and scaling behaviors.

In this post, I want to unpack two of the most interesting directions — semantic-ID-based generative retrieval and HSTU-style sequential generative recommendation — look at where each is being used, what each architecture gets right, and, most importantly, where I think the field is heading. My goal isn't to declare a winner based on today's benchmarks, but to reason about which architectural pattern is more likely to become the dominant paradigm for large-scale recommendation systems over the next few years.

## What is a semantic ID?

A semantic ID is a short sequence of small numbers assigned to an item by clustering its embedding hierarchically. You take the item's embedding, group it into a broad cluster first, then split that cluster into finer sub-clusters, and keep repeating this a few levels deep, so each level narrows the item down further — like folder-within-folder. The final code is basically the path you took through those levels (cluster 3, then sub-cluster 7, then sub-sub-cluster 2, say), giving a compact ID where items that are alike share the same early parts of the path. Think category hierarchy on retail websites like Target → Home & Decor → Home Decor → Decorative Accents → Vases.

## How semantic-ID-based GR works

The recommender generates these codes autoregressively — it predicts the code one level at a time, in order, and each new level's prediction is conditioned on the levels already generated. It first predicts the broad cluster (level 1), then, knowing that choice, predicts which sub-cluster is within it (level 2), then the next level within that, and so on — the same way a language model predicts one word at a time and each next word depends on the ones already written.

## How HSTU-style GR works

The recommender treats a user's history as an actual sequence — item, action, item, action, ordered by time — and feeds it through a transformer built for this kind of data (that's what HSTU is). This lets the model predict "what's the natural next step given this exact unfolding sequence" rather than "what's generally similar to this user." This causes the GR to surface something less obvious — a different category, a different price tier, even a different kind of item, a completely adjacent product — if that's genuinely what the sequence suggests comes next. A simple embeddings-based recommender would instead generate a static representation of the user, losing the order and context of the actions. It would therefore tend to recommend items similar to their historical interests rather than predicting the specific next step in their journey.

## Who's actually using HSTU

HSTU isn't just a paper Meta published and moved on from. A recent academic survey on generative recommendation (Hou et al., 2026) tracks two other companies that built directly on top of it: Meituan created MTGR by adding cross features and a modified masking strategy on an HSTU backbone, and Xiaohongshu (Redbook) built GenRank the same way for their fine-grained ranking stage.

The same survey also notes HSTU reached a parameter scale of 1.5 trillion, while traditional discriminative recommenders plateau in effectiveness around 200 billion — meaning HSTU-style models keep improving as they get bigger, and older architectures just stop getting better past a certain size. That's the scaling-law argument people make for LLMs, now shown to hold for recommendation too.

## Who's actually using semantic IDs

The TIGER paper is where semantic IDs started, but it didn't stay a single paper either. The same survey lists a whole line of follow-on methods built on the same idea — RPG, LC-Rec, ActionPiece, LETTER, TokenRec, SETRec, CCFRec, LLM2Rec, SIIT — spanning multiple research groups over several years, which is usually a sign a technique has become its own subfield rather than a one-off trick.

The clearest production proof, though, is Kuaishou's OneRec: an end-to-end generative recommender built on RQ-VAE semantic IDs that replaced their entire retrieval → coarse-ranking → fine-ranking cascade. According to the survey, it improved total watch time by 1.68% and cut computational cost down to about 10.6% of what the old cascade needed. That's not a research benchmark — that's a real system, at real scale, actually winning.

## The bottleneck neither one solves

Here's the thing both approaches quietly share. Generating a recommendation with either HSTU or semantic-ID GR means running the model step by step — one token, then the next, then the next — because that's what autoregressive generation is. The same survey calls this out directly as an open deployment challenge: autoregressive decoding "requires multiple serial calls to the LLM, resulting in excessive time consumption, which hinders its practical application in real-time recommendation scenarios."

In plain terms — the more expressive these models get, the slower they are to actually serve a recommendation in the half-second window a real product needs. Neither HSTU nor semantic-ID GR gets around this. It's baked into what "generative" means here, not a bug specific to one architecture.
