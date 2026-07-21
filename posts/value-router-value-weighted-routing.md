---
title: 'Why AI Systems Should Spend Their Intelligence Where It Matters'
date: '2026-07-19'
excerpt: 'A routing pipeline that decides fast-path vs. slow-path treatment for retail items using both estimated difficulty and estimated value — and an eval that shows why difficulty alone is the wrong signal to route on.'
author: 'Bhavtosh Rath'
categories: ['LLM Routing', 'Cost Optimization', 'Agents', 'Recommendation Systems']
readTime: '4 mins'
---

## The Core Idea

As AI agents and LLMs become an increasingly integral part of personalization systems, they introduce a new systems-design challenge. Unlike traditional heuristics or lightweight models, every LLM inference comes with a cost — in latency, token usage, and compute. This naturally raises a fundamental question:

> **When should we use an expensive reasoning model, and when is a simple heuristic good enough?**

The challenge, therefore, isn't simply identifying difficult problems — it's deciding **which problems justify the cost of expensive reasoning, and which can be handled just as well with simpler approaches**.

## Motivating example

While this idea can be applied to many personalization and recommendation problems, let's focus on an interesting use case that sits *before* any guest-facing experience: what merchandising decision should be made for an item — that is, what commercial treatment should it receive on the page?

Suppose the system must choose one of five merchandising actions:

```
* Feature – Promote the item prominently on the page.
* Standard – Leave it unchanged (allow the existing ranking or personalization system to decide its placement).
* Discount – Apply promotional pricing.
* Bundle – Pair it with another complementary product.
* Deprioritize – Reduce its visibility on the page.
```

The question isn't *what* decision to make, but *should we spend expensive AI reasoning making that decision across millions of requests, or is a simple rule sufficient?*

A simple rule-based system might look like this:

```python
if category == "accessory" and price < 50:
    action = "standard"
elif category == "clearance":
    action = "discount"
elif category == "premium" and price > 500:
    action = "feature"
else:
    action = "standard"
```

These rules are inexpensive, predictable, and scale well. But they don't work equally well for every item.

### Why Difficulty Alone Isn't Enough

A common intuition is: "Use the expensive model for difficult items." That sounds reasonable until you compare these two products:

```
A $4 phone case that's difficult to categorize.
A $2,000 leather jacket that's equally difficult.
```

Both are ambiguous. But only one is worth spending significant compute on. The first mistake costs pennies. The second might cost hundreds of dollars in missed profit.
*Difficulty* tells us how uncertain the decision is, while *Value* tells us how costly a mistake would be. A routing system should therefore consider both.

## Walking Through a Single Example

Suppose a new leather jacket enters the catalog: category premium, price $300. The pipeline proceeds through several stages.

![Value router architecture](/images/arch_router.png)
*The pipeline: a simulator generates the item, a difficulty scorer and value estimator produce estimates from observable fields only, a routing decision compares those estimates against fixed thresholds, and only items that clear both reach the agent.*

### Step 1 — Simulator

The simulator's job is to play the world: it creates the product and hands the router only what a real system would observe.

**Observable to the router:**
```
category = premium
price = $300
```

**Hidden, generated alongside but never passed to the router:**
```
true difficulty = 0.65
true margin = 28%
```

These two numbers aren't inputs — they're answers. The router never sees them; they exist solely so that once the pipeline has made its call, we can go back and check whether its own estimates of difficulty and value were actually any good.

### Step 2 — Difficulty Scorer

From here on, the pipeline only gets what Step 1 marked observable: category and price. The true difficulty of 0.65 stays locked away.

Working from just those two fields, the scorer estimates:
```
estimated difficulty ≈ 0.60
```

Close to the true 0.65, but not exact — and that gap is the point, not a bug to fix. A real router never gets to peek at ground truth before it decides; it has to act on an estimate built from whatever's observable, and live with however good that estimate turns out to be.

### Step 3 — Value Estimator

The router still needs the other half of the equation: what's a mistake on this item actually worth? It doesn't get to read the true 28% margin from Step 1 — instead, it falls back on a prior, a typical margin for premium-category items, and applies that to the $300 price:

```
estimated value ≈ $78
```

Same shape as Step 2: an estimate standing in for a number the router isn't allowed to see. It's built from a category-level assumption rather than this item's real margin, so it'll be right on average and wrong on any single item — that gap between estimate and ground truth is exactly what a future post in this series will measure across a full catalog.

### Step 4 — Routing Decision

Two estimates now feed a simple 2×2 rule: an item only goes to the slow, expensive path if it clears both the difficulty threshold *and* the value threshold. Hard-but-cheap items stay on the fast path, since careful treatment doesn't pay off there even when the item is hard to get right.

```
difficulty ≈ 0.60
value      ≈ $78
```

against fixed thresholds:

```
difficulty > 0.5
value      > $20
```

The jacket clears both, so it's routed to the slow path — the LLM call, not the deterministic fallback. Note what actually earned it that treatment: it's not enough to be hard, and it's not enough to be valuable. It took both estimates crossing their threshold to justify the expensive path, which is the whole thesis of this post playing out on one item.

### Step 5 — Agent Decision 

Only now, on the slow path, does the reasoning model actually run. It takes the jacket's estimates and produces a merchandising call:

> Feature the jacket — the expected profit justifies the added visibility despite the moderate uncertainty.

Contrast that with a $4 accessory carrying the same 0.60 difficulty but only $2 of estimated value. Its difficulty alone would look identical to the jacket's, but the value estimate doesn't clear the $20 threshold, so it never reaches the LLM at all — the fast path assigns it `standard` and moves on. Same uncertainty, opposite treatment, because the routing decision was never about difficulty in isolation.

## What's next

This post is part 1 of a multi-part series. Here, the goal was just to walk through the pipeline end to end on a single item and establish why routing needs both difficulty and value. The next posts will put the router in front of a full synthetic catalog, compare it against difficulty-only and random baselines, and dig into the eval numbers that actually justify the value-weighted approach.

The code for everything above is on [GitHub](https://github.com/BhavtoshRath/value-router).