---
title: 'Would You Have Watched It Anyway? Netflix''s Answer to Recommendation Causality'
date: '2026-09-17'
excerpt: 'A Netflix paper tackles a question every recsys team quietly avoids: when someone watches what you recommended, how much of that was you? Here''s how they built a model that can answer it.'
author: 'Bhavtosh Rath'
categories: ['Recommendation Systems', 'Causal Inference']
readTime: '7 mins'
---

## TL;DR

- The hard question in recommendation isn't "did they watch it," it's "would they have watched it anyway." A recent Netflix paper builds a model specifically to separate the two.
- The trick is a utility score with two additive pieces: a **taste score** (what you'd want regardless of what's shown to you) and a **recommendation bonus** (the extra push from actually being surfaced). Same training data for both — the separation comes from model structure, not from filtering out "recommended" watches.
- Taste itself turns out to be less personal than it sounds: the item embeddings and the history encoder are shared across all 2 million users in the training sample. "Your taste" is a population-level function applied to your specific watch sequence — which is just collaborative filtering wearing a transformer costume.
- Because the two terms are additive, you can zero out the recommendation bonus for one title and re-run inference to see what would've happened without it — a clean counterfactual, computed after training.
- They validated this against a real 5-week, 9-arm A/B test using something called a diversion ratio, got a 0.86 correlation between the model's predictions and the live experiment, and then used the validated model to show recommendations lift engagement by up to 16% over random ranking — mostly through targeting, not just exposure.

Every recommender system team eventually runs into a version of this problem: a user watches something you recommended, and you want to take credit for it. But did the recommendation actually cause the watch, or was this person always going to find and watch that title regardless of what you showed them? Recommend things people already like — which is the whole job — and you guarantee the two explanations will look identical in the data. Exposure and taste are tangled together by design, not by accident.

A recent Netflix paper, [The Value of Personalized Recommendations: Evidence from Netflix](https://arxiv.org/abs/2511.07280), takes this on directly. What I found genuinely clever isn't the headline results — it's the modeling trick that makes the whole exercise possible. So this post is mostly about that trick.

## One model, two separate questions

The core equation looks almost too simple:

```
u_ijt = taste_score_ij + rec_bonus_ijt + noise
```

That's the utility user `i` gets from title `j` at time `t`. It's built from a transformer that looks at a user's watch history and predicts the probability they watch each title. On the surface that sounds like a recommender model, full stop. But the authors are careful to point out they're answering two separate questions with it: given what was shown and what this person has watched before, what's the probability they watch each title — and of that probability, how much comes from intrinsic taste versus the extra boost of literally being recommended? Structuring the model this way is what lets you later simulate "what if this title had never been recommended to this person at all."

## Step 1: Taste, modeled without filtering anything out

Here's the part that surprised me. To estimate taste, the model isn't trained on some clean subset of "organic" viewing with recommendation effects stripped out — it's trained on all viewing data, recommended and unrecommended alike. Taste gets isolated by structure, not by data curation: there's a separate additive term dedicated to "was this recommended," so whatever watch behavior that term can explain gets absorbed into it, leaving the taste component to represent what a user would want independent of what was actually shown to them.

Taste itself comes from two embeddings combining into a scalar:

```
taste_score_ij = A_it · B_j^T
```

`B_j` is a learned embedding for title `j` — its characteristics, fixed per title but updated during training. `A_it` is an embedding for user `i` at time `t`, representing their current preferences, which shifts as they watch more (taste evolves). The dot product of the two is the taste score.

Simple idea, but it made me stop and think about something I'd been sloppy about: are these embeddings actually individualized? The training sample is 2 million users, and the honest answer is *not entirely*. Your specific watch sequence is individual to you. But the item embeddings (`B_j`) and the history-encoder function that turns any sequence into a taste vector are shared, learned jointly across all 2 million people. So "your taste," as the model represents it, is a population-level function applied to your particular input. That's collaborative filtering, just described in transformer language instead of matrix-factorization language.

## Step 2: The recommendation bonus, kept strictly separate

The second term captures "you watched it because it was recommended," independent of taste. For each zone a title could appear in — billboard, top 25, top 100 — there's a binary flag (shown in that zone or not) multiplied by a zone-specific learned weight, and a title can trigger more than one zone at once:

```
rec_bonus_ijt = Σ β_jr · 1{j ∈ C_irt}
```

Add that to the taste score and you get the full utility, which then goes through the standard training loop — softmax over the whole catalog to get a probability distribution, likelihood against what people actually watched, backprop nudging the history encoder, item embeddings, and recommendation weights closer to reality, batch after batch until it converges. Nothing exotic in the training itself. What's clever is upstream of that: keeping taste and recommendation-effect as two separate additive terms is exactly what makes it possible to switch one of them off later and see what changes.

## Step 3: Running inference twice, on the same person

This is where the design pays off. Pick a specific user, a specific moment, and a specific title. Run inference once with that title's recommendation bonus included, and once with it zeroed out — everything else about that person's utilities held fixed. Each run still requires computing utilities for the *entire* catalog, not just the target title, because softmax produces relative probabilities across every available option, not an isolated score. Flipping one flag technically only touches the recommendation-bonus term for that one title, but because softmax normalizes over everything, that single change ripples through and shifts every other title's probability slightly too.

The difference between the two runs — probability with the bonus minus probability without it — is the model's estimate of the causal effect of that recommendation, for that user, for that title, at that moment. It's a counterfactual computed entirely after training, which is the whole point of building the model this way in the first place.

## Step 4: Checking the model against reality

A model that can produce convenient counterfactuals is only useful if you trust it, so the paper validates it against an actual randomized experiment — 5 weeks, roughly a million users per arm, 9 arms total (1 control, 8 treatment). Control gets real, unmodified recommendations. Each treatment arm is tied to one focal category (scripted content, non-English titles, TV series, and so on) — a random subset of non-focal titles that would normally have been shown gets swapped out for focal-category titles instead. It's a deliberate, human-decided rule, with zero involvement from the model itself.

From that experiment you can compute a **diversion ratio**. Say Scream gets watched by 2% of users in control, and in a treatment arm that boosts Scream 2, Scream's viewership drops to 1.5% among treatment users. That's a 0.5-point gap. Diversion ratio asks where that gap went: how much reappears as extra viewership of Scream 2, how much scatters across the rest of the catalog, and how much shows up as people just watching nothing.

You can compute the same quantity from the model directly — run it once on a user's real recommendation flags for the control baseline, then flip the flags (Scream off, Scream 2 on) and run it again for the treatment prediction, and the difference in outputs gives you the model's predicted diversion ratio. Line up the model's predictions against the live experiment's actual results across all arms and titles, and you get a 0.86 correlation and 0.73 R². That's strong enough to treat the model as trustworthy for questions the live experiment was never designed to answer directly.

## Step 5: What the validated model is actually for

Once trusted, the model gets used to answer the questions that mattered from the start. Swap the current recommender for random, popularity-based, or matrix-factorization alternatives, and engagement drops by 16%, 12%, and 4% respectively. Decompose *why* recommendations drive extra watching, and it splits into selection (51.3%), exposure (6.8%), and targeting (41.9%) — targeting turns out to matter most, especially for mid-popularity titles that wouldn't otherwise surface on their own. And by extending the model with pre-tagged embeddings for titles that haven't been released yet, you can estimate incremental value before a single person has watched them, which is directly useful for catalog investment decisions.

## Why this is worth sitting with

The thing I keep coming back to is how unglamorous the actual solution is. No new causal-inference machinery, no instrumental variables, no clever natural experiment to lean on. Just a utility function split into two additive terms, trained on ordinary data, validated the honest way — against a real experiment, not just internal consistency checks. That combination of "sober about what it can claim" and "actually usable for decisions" is rarer than it should be in this kind of work.

---

*Source:*
- [The Value of Personalized Recommendations: Evidence from Netflix](https://arxiv.org/abs/2511.07280)
