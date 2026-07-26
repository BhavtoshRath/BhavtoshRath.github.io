---
title: 'Value Router, Part 3: Why Knowing the Calendar Matters Less Than Knowing Today''s Numbers'
date: '2026-07-26'
excerpt: 'Part 3 of the value-router series: a Black-Friday-style demand simulation shows that a router calibrated for "normal" traffic can be told the calendar and still only improve a little — while a slow-path budget that simply reacts to the day''s own estimates, with no idea a peak is happening, holds up almost perfectly.'
author: 'Bhavtosh Rath'
categories: ['LLM Routing', 'Cost Optimization', 'Agents', 'Recommendation Systems']
readTime: '5 mins'
---

## TL;DR

- A router tuned on "normal" traffic and a fixed slow-path budget both get tested against a simulated demand surge — more volume, and a mix shift toward pricier categories, the way real Black Friday traffic behaves.
- A fixed daily budget, sized for normal days, collapses on peak days: high-value recall drops from 70.1% to 16.2%, and ~$36.7k of true high-value items go unprotected.
- A budget that simply scales with *that day's own* estimated value — with zero knowledge that a peak is even happening — tracks the surge automatically and matches the unconstrained router's peak-day numbers almost exactly.
- A router that's explicitly told the calendar (raise the value bar on peak days) only improves modestly by comparison — knowing the season is worth less than reacting to the day's own numbers.
- This is a toy simulation, not a validated seasonal model — there's no real multi-year e-commerce data behind any of the multipliers below.

## Recap

[Part 1](/posts/value-router-value-weighted-routing) built a router that only sends an item down the expensive path if it's both estimated as *hard* and estimated as *valuable* — never difficulty alone, since a hard $4 item and a hard $2,000 item aren't the same mistake. [Part 2](/posts/value-router-segment-monitoring) added observability: a decision log and a monitor that check whether spend actually landed where it should (concentrated on the rare, high-value segment) and whether the router's own estimates were trustworthy.

Both of those ran against one flat, unchanging batch of traffic. Part 2 ended by asking the obvious next question: what happens when the traffic mix itself shifts, the way it does around a real seasonal peak — does a router (and a budget) tuned on average-day data quietly break down exactly when it matters most?

## Simulating a Demand Surge

Real seasonal spikes like Black Friday don't just mean *more* traffic — the mix of what's selling shifts too, toward gift-buying and premium purchases. The simulator now generates a 30-day period instead of one flat batch, with a handful of days marked `peak`:

```
peak day vs. normal day, category mix:

category      normal%   peak%    mean_value
commodity       39.7%   28.5%       0.77
accessory       30.8%   28.1%       3.72 / 3.90
mid_tier        16.8%   20.4%      20.46 / 20.78
premium          9.3%   15.5%      91.91 / 91.85
luxury           3.5%    7.5%     613.42 / 611.68
```

`premium` + `luxury` combined go from 12.8% of traffic on a normal day to 23.0% on a peak day, on top of a 2.5x overall volume surge. Crucially, **the difficulty scorer and value estimator are not recalibrated for peak days** — same fixed category priors every day. The question isn't whether the estimators know it's a peak day; it's whether the *routing and budgeting policy* can cope even when they don't.

## Two Ways to React to the Calendar — and One Way Not To

Three policies get compared against this shifting traffic, on top of the same value-weighted router from Part 1:

**Static** — one fixed value threshold, every day, season-blind. This is what Part 1 and Part 2 already had.

**Calendar-aware** — the router is explicitly told the season and raises its value bar on peak days, the way an ops team might manually tighten the rules once a year:

```python
class CalendarAwareRouter:
    def route(self, difficulty_estimate, value_estimate, season="normal"):
        multiplier = self.season_multipliers.get(season, 1.0)  # {"normal": 1.0, "peak": 2.5}
        effective_threshold = self.value_threshold * multiplier
        is_hard = difficulty_estimate >= self.difficulty_threshold
        is_valuable = value_estimate >= effective_threshold
        return "slow" if (is_hard and is_valuable) else "fast"
```

**Elastic budget** — instead of touching the routing threshold at all, cap the *slow-path budget itself* at a multiple of that day's own total estimated value:

```python
def apply_elastic_budget_cap(decisions, alpha, slow_cost=20.0):
    forecasted_value = sum(d.value_estimate for d in decisions)
    budget_cap = alpha * forecasted_value
    # admit slow-path candidates highest-value_estimate-first
    # until the running cost would exceed budget_cap
    ...
```

Note what this last one doesn't know: nothing about "peak" or "normal" enters the formula. It just asks, every day, "how much estimated value is passing through today?" and lets the budget follow that number wherever it goes.

For comparison, there's a fourth, deliberately naive policy — **fixed budget** — which is the elastic budget's mirror image: the same dollar cap every single day, sized off normal-day spend, with no mechanism to notice a surge at all. This is what a team gets if it sets a slow-path budget once and never revisits it.

## The Result: Peak Days

```
peak days only            slow%   budget   value_protected   value_starved   recall
------------------------------------------------------------------------------------
static                    23.5%    8,188          90,060.5         4,080.3   70.1%
calendar_aware             22.3%    7,846          89,379.9         4,742.5   66.7%
elastic_budget             23.5%    8,188          90,060.5         4,080.3   70.1%
fixed_budget                5.4%    3,039          57,439.5        36,682.9   16.2%
```

Three things stand out:

1. **Fixed budget falls apart.** Sized for a normal day, it can only afford a fraction of what a peak day actually needs, so it protects less than a fifth of the true high-value items it would otherwise catch — $36.7k of high-value items pass through the cheap path unprotected, more than eight times what any other policy leaves starved.
2. **Elastic budget doesn't even notice.** Its cap (`alpha × that day's total estimated value`) grows right along with the surge, so it never actually binds on peak days at these settings — the numbers are *identical* to the unconstrained static router. It absorbed a 2.5x volume surge and a category mix shift using a rule that has no idea either of those things happened.
3. **Calendar-aware trades a little recall for a little spend.** Knowing it's a peak day and manually raising the bar saves some budget (7,846 vs. 8,188) but also gives up more recall (66.7% vs. 70.1%) than the elastic budget ever had to. The mechanism that was explicitly told the season did *worse* on the recall/spend trade than the mechanism that was told nothing at all.

## The Result: Normal Days

The interesting failure mode is peak-specific, but it's worth checking that nothing regresses on ordinary days:

```
normal days only          slow%   budget   value_protected   value_starved   recall
------------------------------------------------------------------------------------
static                     13.5%   19,213         161,801.7        11,121.8   63.6%
calendar_aware              13.5%   19,213         161,801.7        11,121.8   63.6%
elastic_budget              12.4%   18,111         158,954.8        13,873.4   58.9%
fixed_budget                12.4%   18,111         159,188.5        13,677.6   58.8%
```

Calendar-aware is identical to static here by construction — its peak multiplier is 1.0 on normal days, so it *is* the static router. Elastic and fixed budget land in almost the same place too, because the fixed cap was deliberately calibrated off normal-day spend — this is exactly the day type it was built for. The gap between them only opens up once the day stops looking like the day the fixed cap was tuned on.

## Why the Elastic Cap Doesn't Need to Know the Calendar

The mechanism is simpler than it looks. What actually determines whether a budget cap binds is the *ratio* of slow-path cost needed to that day's total estimated value — not the absolute size of either number. On this simulated catalog, that ratio turns out to be roughly similar on peak and normal days (both cost and value scale up together when volume surges), so a cap set as a fixed fraction of estimated value ends up sized correctly on both kinds of days, automatically. The elastic budget isn't smart about seasons; it's just measuring the right thing — value estimates the router already has to compute anyway — instead of a dollar figure someone picked once and forgot to revisit.

## The Honest Caveat

As with the rest of this project: this is a toy demonstration, not a validated seasonal model. "Peak" here means a hand-picked volume multiplier and category-weight shift, not a real Black Friday's worth of historical data — there's no multi-year calibration behind any of these numbers, and the difficulty/value estimators are the same simplified priors from Part 1. What this simulation is useful for is showing that the *design* — a budget that reacts to its own inputs rather than a number fixed in advance — handles an unannounced demand shift better than either doing nothing or manually hand-tuning for a calendar you have to remember to update. It is not evidence that this specific approach would survive a real Black Friday.

## Wrapping Up the Series

That closes out the three tiers as originally scoped: a routing decision that weighs both difficulty and value (Part 1), the observability to check it's behaving as designed (Part 2), and a policy that survives a demand shift it was never told about (Part 3). The recurring thread across all three: estimates the system already has to compute — difficulty, value, today's own totals — turn out to carry more useful signal than a rule fixed in advance, whether that rule is a threshold or a budget.

The code for everything above is on [GitHub](https://github.com/BhavtoshRath/value-router).
