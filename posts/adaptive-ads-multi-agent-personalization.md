---
title: 'Adaptive Ads: Teaching a Multi-Agent System to Learn User Preferences'
date: '2026-07-17'
excerpt: 'I built a researcher-strategist-executor agent pipeline that personalizes item serving from simulated clicks — with every decision logged and explainable. Here is how it works, and what the eval numbers actually said.'
author: 'Bhavtosh Rath'
categories: ['Personalization', 'LLM', 'Agents', 'Recommendation Systems']
readTime: '6 mins'
---

## TL;DR

- Built a 3-agent (researcher, strategist, executor) LLM pipeline that personalizes ad serving from simulated clicks, replacing a fixed epsilon-greedy explore/exploit rule with an LLM reasoning over the same context.
- Every serving decision is logged in plain language, so it's auditable like a sentence instead of reverse-engineered from a weight matrix.
- At small scale (5 sessions) the agent pipeline underperformed baselines — a reminder that "smarter" systems still need enough volume before they can prove it.
- A swappable `client` argument let the whole pipeline be unit-tested with a fake LLM double, with zero live API calls or token cost.

This is a small project I put together in a day using Claude, mostly to answer a question I couldn't stop poking at. I've built traditional bandit models for exploration/exploitation before — see [this post](https://tech.target.com/blog/page-layout-optimization-bandits) on page-layout optimization from my time at Target — where the explore/exploit call is normally a fixed rule (epsilon-greedy, UCB, Thompson sampling) reacting to numbers. I wanted to see what happens if that decision is instead made by an LLM reasoning over the same context: does it hold up, and does it buy you anything a hand-tuned rule doesn't?

Recommendation systems are usually black boxes too: a model scores a thousand candidates and you get a ranked list, with little insight into *why* item 42 beat item 7. Having worked on item personalization at Target, I wanted to explore an alternative structure — one where the "why" is a first-class output, not an afterthought. So I built [Adaptive Ads](https://github.com/BhavtoshRath/adaptive-ads), a simulated ad-serving environment where three small LLM agents — a researcher, a strategist, and an executor — cooperate to personalize what gets shown to a user, using Claude for the judgment calls and plain code for everything that should be deterministic.

![Adaptive Ads architecture](/images/adaptive-ads-architecture.png)

## Three agents, three jobs

Each agent has a narrow, single-purpose role, which makes the pipeline easy to reason about and to test in isolation:

- **`research_user()`** takes a user's raw interaction history and computes per-category click-through rate, average dwell time, and impression counts — all deterministically, in plain Python. Claude's only job is to interpret those stats: which category does this user prefer, and how confident should we be? The prompt explicitly tells it that a high CTR on one impression is weaker evidence than a solid CTR on twenty, so it doesn't overreact to small samples.
- **`plan_next_action()`** takes that summary and decides explore vs. exploit: serve the user's known top category, or spend an impression gathering signal on a category we're less sure about. This is the classic bandit trade-off, but decided in natural language with a logged reason instead of a fixed epsilon-greedy rule.
- **`serve_item()`** takes the plan and a shortlist of candidate items (capped at 15, regardless of catalog size) and picks one concrete item, with a reason tied back to the plan.

Every one of those "reasons" gets logged. A sample from a real run:

> *Confidence of 0.45 is below the threshold for exploitation, and impression count of 12 is limited. Exploring the 'home' category will help gather additional signal about user preferences and reduce uncertainty before committing to a single category strategy.*

That's the part I actually wanted out of this project — not necessarily better CTR, but a serving decision I can read and audit like a sentence, not reverse-engineer from a weight matrix.

## Memory and the simulator

A `MemoryStore` backed by SQLite keeps two things per user: the raw episodic history (every impression, click, and dwell time) and a rolling long-term summary (the researcher's last judgment). Each session pulls the latest history, runs it through the pipeline, and writes the outcome back — so the next session for that user starts from what was just learned.

Since there's no real ad inventory or traffic to learn from, the simulator fabricates both sides of the interaction. Users get a hidden preference vector over five categories drawn from a Dirichlet distribution with low concentration, which — deliberately — clumps most of the probability mass onto one or two categories rather than spreading it evenly, mirroring how real users tend to have a couple of strong interests rather than mild interest in everything. Items get a feature vector with one dominant category and low-magnitude noise elsewhere. A click and its dwell time are then generated from the dot product of user preferences and item features, plus Gaussian noise. Crucially, the agents never see these hidden vectors — only the resulting clicks and dwell times, exactly like a real serving system would.

## What the eval actually showed

`eval/run_eval.py` runs the same simulated users and catalog through three strategies — random, most-popular, and the full agent pipeline — and reports CTR, the explore/exploit split, and token usage side by side. And the honest result at small scale wasn't flattering:

```
Strategy: agent_pipeline
  Sessions: 5
  Clicks:   1
  CTR:      20.00%
  Mode split: explore=5 exploit=0

Agent pipeline lift over baselines:
  vs random: -50.0%
```

At five sessions, a single click swings CTR by 20 points, so this isn't a real signal either way — it's a reminder that a "smarter" system still needs enough volume to prove it, and that an agent honestly reporting low confidence on cold-start users (explore=5, exploit=0 here) will *look* worse than a lucky coin flip in a tiny sample. The eval harness makes that cost visible instead of hiding it behind a single headline metric, which was the point of writing it this way. Scaling `n_sessions` up would be the natural next step, at the cost of proportionally more live API calls — each session makes three (researcher, strategist, executor).

## A design detail worth calling out

Every agent function takes an optional `client` argument. In production it defaults to a real Anthropic client; in tests, it takes a `FakeClient` double that returns canned JSON payloads. That one seam is what let me write a full test suite — including for `run_eval.py`'s baselines and the agent pipeline — without a single test hitting the live API or costing a token.

The code is on [GitHub](https://github.com/BhavtoshRath/adaptive-ads) if you want to poke at it. It's a small project, but it was a useful excuse to think about explore/exploit, episodic vs. long-term memory, and explainability as structural properties of a system rather than something bolted on after the fact.