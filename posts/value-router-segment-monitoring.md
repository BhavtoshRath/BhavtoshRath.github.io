---
title: 'A Router That Looks Good on Average Can Still Be Starving Your Best Segment'
date: '2026-07-22'
excerpt: 'Part 2 of the value-router series: why a routing decision is only half the story, and what a lightweight decision log and calibration check reveal about who actually gets the expensive path.'
author: 'Bhavtosh Rath'
categories: ['LLM Routing', 'Cost Optimization', 'Agents', 'Recommendation Systems']
readTime: '5 mins'
---

## TL;DR

- Aggregate stats like "12% of items went to the slow path" can look healthy while a router silently starves a small, high-value segment.
- Added a decision logger (per-item record of estimates, path, cost, and hidden ground truth) plus a monitor that checks spend-by-category against volume share and calibration.
- On the synthetic catalog, `premium` and `luxury` are 10.9% of volume but absorb 67.7% of spend — the router concentrating cost where mistakes are expensive, not where volume is highest.
- Breaking calibration down by category reveals the difficulty estimator has close to zero real signal within a category, even though its overall correlation looked fine — exactly what an aggregate number hides.

## Recap

[Part 1](/posts/value-router-value-weighted-routing) walked a single leather jacket through the pipeline: a simulator generates an item, a difficulty scorer and value estimator turn its observable fields into estimates, and a routing decision sends only the items that clear both a difficulty *and* a value threshold down the expensive path. The thesis was simple — difficulty alone isn't enough, because a difficult $4 phone case and a difficult $2,000 jacket are not the same mistake to make.

That post ended on one item. This one asks a different question: run that same router over an entire catalog, and how do you know it's actually behaving the way you designed it to?

## Why a Routing Decision Isn't the End of the Story

A router that only reports aggregate numbers — "we sent 12% of items down the slow path" — can look perfectly healthy while quietly making a bad trade underneath. The failure mode this project is built to catch: **silently starving a low-volume, high-value segment**.

Picture the category mix from Part 1's catalog: `commodity` and `accessory` together make up about 72% of all traffic, while `premium` and `luxury` are a combined 10.9%. A router optimizing for "handle the most items well" will naturally gravitate toward the big, common categories — and it can do that while giving noticeably worse treatment to the rare `luxury` item that's worth more than the other 700 items around it combined. Nothing in an aggregate slow-path-rate number would tell you that's happening.

So Tier 2 adds observability on top of the routing decision itself, in two pieces:

1. **A decision logger** — every routed item gets a durable record: its category, the difficulty/value estimates the router actually acted on, which path it took, what that path cost, and (because this is a simulation) the ground-truth value and difficulty it never got to see.
2. **A monitor** — aggregates that log into two checks instead of one aggregate rate:
   - **Spend by category, against volume share.** If a category's share of the routing budget is meaningfully below its share of traffic, that's the starvation signal made visible instead of implicit.
   - **Calibration.** How well did the difficulty and value *estimates* track the *true* numbers — overall, and broken out by category — so a biased or drifting estimator in one segment doesn't hide inside a healthy-looking overall correlation.

Running this over the default synthetic catalog makes the concern concrete rather than hypothetical: the value-weighted router sends 100% of `premium` and `luxury` items — 10.9% of volume — down the slow path, and those two categories absorb roughly two-thirds of total spend. A router that instead spent proportional to volume would be exhibiting exactly the failure this whole project set out to avoid.

This is deliberately a dashboard sketch, not a production monitoring system — the goal is to make "don't silently starve the low-value segment" a thing you can check, not just a thing you hope is true.

## Inside the Decision Log

The logger doesn't grade anything — it just writes one JSON line per item, carrying both what the router saw and what it never got to see:

```json
{
  "item_id": 6, "category": "premium", "price": 267.81,
  "path": "slow", "cost": 20.0,
  "difficulty_estimate": 0.702, "value_estimate": 80.23,
  "difficulty_true": 0.439, "value_true": 62.15
}
```

`difficulty_estimate` and `value_estimate` are the only two numbers the router actually acted on — the same estimates from Part 1's Step 2 and Step 3. `difficulty_true` and `value_true` are the simulator's hidden ground truth, logged purely so a downstream check can ask "how close was the router's information to reality?" A real deployment wouldn't have that ground truth at decision time; here it exists because this is a simulation, and it's the whole reason a calibration check is possible at all.

`cost` is 1.0 for the fast path and 20.0 for the slow path — an arbitrary unit-cost model, not a real dollar figure. Only the *ratio* matters: it's standing in for "cheap heuristic lookup" vs. "expensive LLM call," the same 20:1 model the eval harness in Part 1 used.

## Spend by Category: Where Did the Budget Actually Go?

Aggregating the log by category turns the starvation concern from Part 1 into a number you can check directly — spend share against volume share:

```
category          n   volume%    slow%   spend%
-----------------------------------------------
commodity       789     39.5%     0.0%    12.1%  <- under-spending relative to volume
accessory       647     32.4%     0.0%    10.0%  <- under-spending relative to volume
mid_tier        344     17.2%     4.9%    10.3%  <- under-spending relative to volume
premium         157      7.8%   100.0%    48.3%  <- over-spending relative to volume
luxury           63      3.1%   100.0%    19.4%  <- over-spending relative to volume
```

`premium` and `luxury` are 10.9% of traffic but absorb 67.7% of total spend — every single item in both categories clears the value threshold and gets the expensive path. That's not a bug; it's the router doing exactly what Part 1 argued it should: concentrating expensive reasoning where a mistake is costly, not where volume happens to be highest. Run the same aggregation over the `random` baseline instead, and spend tracks volume almost exactly — no segment gets systematically favored or starved, because random routing has no opinion about value at all. The contrast between those two tables *is* the demonstration.

## Calibration: Are the Router's Inputs Trustworthy?

Spend tells you where effort went. Calibration tells you whether the numbers that decided where effort went were any good, by checking `*_estimate` against `*_true` from the log:

```
calibration check (estimate vs. ground truth, overall):
  value       mean_abs_error=3.90    mean_abs_pct_error=23.0%   correlation=0.989
  difficulty  mean_abs_error=0.10    mean_abs_pct_error=37.1%   correlation=0.792
```

Both look solid overall. But break the same check down by category, and a different picture shows up:

```
calibration by category (correlation with ground truth):
  commodity   value_corr=0.744   difficulty_corr=-0.023
  accessory   value_corr=0.805   difficulty_corr=-0.025
  mid_tier    value_corr=0.843   difficulty_corr=-0.075
  premium     value_corr=0.907   difficulty_corr= 0.013
  luxury      value_corr=0.938   difficulty_corr=-0.047
```

`value_corr` holds up fine within every category — the value estimator is genuinely distinguishing higher- and lower-value items inside a single category, not just riding the category average. `difficulty_corr` does not survive the same test: it collapses to roughly zero everywhere.

That's the calibration check catching something the overall 0.792 number was hiding. Categories differ hugely in typical difficulty range, so an estimator that does nothing more than guess the category average will already produce a healthy-looking *overall* correlation — purely from separating categories correctly, not from saying anything true about individual items. The by-category breakdown removes that effect and shows the difficulty scorer has essentially no power to tell a hard `luxury` item from an easy one, once you've already conditioned on category. An aggregate metric would never have surfaced that; a segment-level one can't hide it.

## Not the Same Job as the Eval Harness

It's worth being precise about how this differs from Part 1's eval harness, since both start from the same simulate → estimate → route pipeline. The eval harness is a one-shot **comparison tool**: it runs all three strategies against the same items in a single call and grades each directly against ground truth — recall, precision, efficiency, budget. Nothing gets written to disk; it exists to answer *which strategy should we use*.

The decision logger + monitor is a **persistence step for one strategy already in use**. It doesn't grade routing decisions directly — it writes a durable per-item record, then checks two different things from it: whether spend landed where it should relative to traffic, and whether the *estimates feeding the router* were themselves trustworthy. A router can have flawless threshold logic and still look bad here if the numbers it's fed are biased in some segment — that's a level upstream of what recall/precision measure, and it's the level this monitor is built to watch.

## What's Next

Tier 2 answers "is this router behaving the way I designed it to, and can I trust the numbers it's acting on." The next post moves the goalposts: what happens to a static router when the traffic mix itself shifts, the way it does around a real seasonal peak — and whether a router tuned on average-day data quietly breaks down exactly when it matters most.

The code for everything above is on [GitHub](https://github.com/BhavtoshRath/value-router).
