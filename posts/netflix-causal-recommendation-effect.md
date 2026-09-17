---
title: 'How Do You Know Your Recommender System Actually Works?'
date: '2026-09-17'
excerpt: 'A recent Netflix paper separates taste from recommendation effect with a genuinely elegant piece of applied causal inference — and, more importantly, actually checks whether the separation is trustworthy against a live experiment.'
author: 'Bhavtosh Rath'
categories: ['Recommendation Systems', 'Causal Inference']
readTime: '13 mins'
---

## TL;DR

- The hard question isn't "did the user watch what we recommended," it's "would they have watched it anyway." A recent Netflix paper builds a model specifically to separate the two.
- The trick: an additive utility score with a **taste term** and a **recommendation-bonus term**, trained on all viewing data together — the separation comes from model structure, not from filtering out recommended watches.
- Separating the terms doesn't automatically solve the hard part. The paper leans on an assumption — **conditional exogeneity** — that leftover exposure variation, after conditioning on everything the algorithm used, is close to random.
- That assumption isn't verified from the training data itself. It's checked against a real 5-week, 9-arm A/B test using a **diversion ratio**, and the model's offline predictions correlate with the live experiment at 0.86 (R² = 0.73).
- Once trusted, the model shows the current RecSys beats simpler alternatives by up to 16% in engagement, without the catalog-concentration collapse those alternatives cause — and that most of a recommendation's power comes from **targeting** specific non-obvious matches, not just exposure.

Here's a question that sounds simple until you try to actually answer it: when a user watches something Netflix recommended to them, how much of that decision was the recommendation, and how much was just... them? They were probably going to watch a slasher movie tonight anyway — did the recommendation actually change anything, or did it just happen to be standing next to a decision the user had already made?

That's the central problem a recent Netflix paper, [The Value of Personalized Recommendations: Evidence from Netflix](https://arxiv.org/abs/2511.07280), sets out to solve. The way they solve it is a genuinely elegant piece of applied causal inference, and it's worth understanding in detail — the same bottleneck shows up in some form in every recommender system evaluation, whether or not the team building it realizes it.

## The core equation

Everything in this paper builds on one formula — the utility score, representing how much a specific user wants a specific title at a specific moment:

```
u_ijt = taste_score_ij + rec_bonus_ijt + noise
```

Three ingredients: a **taste score** (how much this user would want this title, independent of whether it was ever recommended), a **recommendation bonus** (the extra push from the title actually being shown to them), and **noise** (everything else the model can't capture — mood, whim, a text from a friend). The whole paper is really about computing the first two terms separately, and why keeping them separate is what makes everything else possible.

They built a transformer-based model that looks at a user's watch history and predicts their probability of watching each title. It's tempting to call this a recommender model — it has the right ingredients, learned embeddings, attention over sequences — but that's not what it is. It never decides what gets shown to anyone. It answers two distinct questions: given what was shown to this user and their history, what's the probability they watch each title? And separately, how much of that probability is driven by intrinsic taste versus the extra boost from actually being recommended? The real Netflix RecSys — the thing that actually populates your homepage — stays a black box throughout. This model exists purely to measure and simulate, not to serve.

## Step 1: Modeling taste

To estimate taste, the model isn't trained on some filtered subset of "organic" engagement that excludes recommendation influence — it's trained on all viewing data, recommended and unrecommended alike. Taste gets isolated by structure, not by filtering the data: there's a separate additive term specifically for "was this recommended," so any watch behavior explained by exposure gets absorbed into that term (Step 2), leaving the taste component to represent what a user would want independent of what was shown to them.

Concretely, taste comes from two embeddings combining into a single scalar score. `B_j` is a d-dimensional embedding for each title, representing its learned "characteristics" — fixed per title, though updated during training. `A_it` is a d-dimensional embedding for user `i` at a specific time `t`, representing their current preferences, and it shifts as the user watches more, modeling that taste evolves over time — again, independent of recommendation influence. Their dot product gives the taste score:

```
taste_score_ij = A_it · B_j^T
```

A confusion I had, and one worth naming, was whether these embeddings were really individualized — given they're trained on a random sample of 2 million users. Turns out the answer is no, not entirely. Only your specific watch sequence is individual. The item embeddings (`B_j`) and the history-encoder function that turns your sequence into a taste vector are both shared, learned jointly across the full 2 million users. So "your taste," as the model represents it, is really a population-level function applied to an individual input — which is nothing but a collaborative filtering problem wearing a sequence-model costume.

## Step 2: Modeling the recommendation bonus

Now the second term, capturing "you watched it because it was recommended," kept deliberately separate from taste. For each zone a title could appear in — billboard, top 25, top 100 — there's a binary flag (1 if the title shows up in that zone, 0 if not), multiplied by a zone-specific learned weight. A title can trigger more than one zone flag at once, since top 25 titles are also part of top 100 by definition.

```
rec_bonus_ijt = Σ β_jr · 1{j ∈ C_irt}
```

All these zone bonuses get added to the taste score to form the final utility:

```
u_ijt = A_it · B_j^T + Σ β_jr · 1{j ∈ C_irt} + noise
```

The noise term represents everything influencing a user's choice that the model doesn't capture — and statistically, it's a Type-1 Extreme Value assumption, which is precisely what makes softmax the "correct" way to turn utilities into probabilities. That's a classic McFadden discrete-choice result, not something the authors invented; it's the standard justification for using softmax in choice modeling at all.

This additive structure is the clever bit. Taste and recommendation-effect stay as two separate terms rather than one blended number, which is exactly what lets them later "switch off" the recommendation bonus for a specific user/title pair and simulate what would've happened without it.

From here, it's back to the normal training grind. Nothing exotic: softmax turns utility scores into a probability distribution over every title in the catalog, the likelihood checks those probabilities against what people actually watched, backprop nudges every parameter — the history encoder behind `A_it`, the item embeddings `B_j`, the recommendation bonuses `β_jr` — a little closer to reality, and this repeats, batch after batch, until it converges.

## Step 3: The identification problem

Here's the actual hard problem, and it's worth being honest that Steps 1 and 2 don't solve it on their own. When someone watches something that was recommended to them, we can't directly tell how much came from intrinsic taste versus the causal effect of being recommended. Since the real RecSys tends to recommend things it already predicts people will like, exposure and taste are naturally tangled together in the raw data. Training a model with two separate additive terms doesn't automatically untangle this — the model still has to correctly assign credit between the two, and nothing forces it to do so honestly.

Their answer is an assumption called **conditional exogeneity**: once you condition on everything the RecSys itself used to decide who gets shown what — user history, item features, state — whatever exposure variation is left over is close to random, not driven by hidden taste differences. Compare two users who look identical to the algorithm; if one happened to get a title recommended and the other didn't, for essentially incidental reasons like routine exploration or tie-breaking, any difference in their watching behavior can be attributed to the recommendation itself rather than to some taste gap the algorithm secretly detected.

Once trained, this is exactly what lets them run a clean thought experiment. Take a specific user at a specific moment, and a specific title. Run the model's inference twice: once with that title's recommendation bonus included in its utility score, and once with it zeroed out, keeping every other title's taste score and utility unchanged. Each run requires computing utility scores for every title in the catalog, not just the target one, because softmax needs the whole set of utilities to produce a valid probability distribution — probability is inherently relative to every other option available, never computed in isolation. So each run produces a full probability distribution across the entire ~7,000-title catalog (plus the outside option, for "watched nothing"), and from that distribution you pull out the one number for your target title. The difference between the two — with the bonus, and without — is the estimated causal effect of the recommendation, for that specific user and title.

This is only trustworthy if the conditional exogeneity assumption actually holds, and that's not something you can verify from the same data you used to fit the model. So they go check.

## Step 4: Validating it against a real experiment

This is where the paper stops asking you to trust an assumption and goes and tests it.

The setup is different from a standard A/B test. It runs for 5 weeks, with roughly 1 million users per arm, across 9 arms total — 1 control plus 8 treatment arms. Control is real, unmodified recommendations, completely separate from anything the model generates. Each of the 8 treatment arms is tied to a single focal category — scripted vs. unscripted content, language, film vs. TV series, and others. When a user lands in a category's treatment arm, that category gets shown somewhat more than usual; it's a rebalancing, not a takeover. The paper's own description: "we substitute impressions of a random subset of goods not in the focal category for impressions of goods in the focal category." Mechanically, take a random subset of non-focal titles that would normally have been shown, and swap those specific impression slots for focal-category titles instead.

Worth being explicit about something easy to miss: the model's outputs are not used to decide what gets shown in this A/B test. The treatment arms are built from a simple, deliberate rule decided by the researchers — boost category X, dilute some titles not in X — with zero involvement from the transformer/choice model. This separation matters, because it's what makes the validation non-circular.

From this, they compute a **diversion ratio**: comparing the treatment population to the control population (two different, but randomly equivalent, groups of users), how much lower is a diluted title's viewership in the treatment arm — and of that gap, what fraction reappears as higher viewership of a boosted substitute, what fraction shows up elsewhere in the catalog, and what fraction shows up as more people choosing the outside option, watching nothing at all?

**A concrete example.** Suppose in the control arm, Scream is shown normally and 2% of control users watch it. In a treatment arm where Scream 2 gets boosted, only 1.5% of treatment users watch Scream — a 0.5 percentage-point drop, comparing two different, randomly-equivalent populations (nobody's individual behavior is tracked before/after; these are two separate groups of roughly a million users each). Diversion ratio decomposes that gap: what fraction reappears as increased viewership of Scream 2, what fraction reappears spread across other titles, and what fraction reappears as more people choosing not to watch anything.

**D^EMPIRICAL vs. D^MODEL.** The real, observed diversion ratio — call it D^EMPIRICAL — is model-free. It's ground truth, computed purely from what actually happened. Separately, they compute D^MODEL: what the trained model predicts would happen under the same manipulation, computed entirely offline. Here's how. The model produces a probability for every title in the catalog plus the outside option — a full distribution of ~7,001 numbers summing to 1. Running this once on a user's real, unmodified recommendation flags gives the control baseline: P_control(Scream), P_control(Scream2), and so on. To simulate the treatment arm, they manually edit that user's flags — if Scream's flag was 1, flip it to 0; if Scream 2's flag was 0, flip it to 1 — and run the model again to get P_treatment(Scream), P_treatment(Scream2).

Mechanically, flipping a flag only changes the recommendation bonus term inside that title's utility score — taste stays untouched. But because softmax normalizes across the entire catalog, that one change ripples through and shifts every title's probability slightly, not just the two flags you touched. Nothing here involves backpropagation or learning; the model is fully trained and frozen by this point. It's just arithmetic — plugging a different input into an already-fixed formula and reading off a different output. The difference between the two runs feeds into the diversion ratio formula to produce D^MODEL.

**The check that matters.** Finally, correlate D^MODEL against D^EMPIRICAL, across all 8 treatment arms and their titles. They found a strong relationship: 0.86 correlation, 0.73 R². That's the whole point of Step 4. Diversion ratio isn't used as an ongoing metric throughout the paper — it's used once, as a validation gate. If the model's offline predictions hadn't matched the real experiment, that would've been evidence the conditional exogeneity assumption from Step 3 was shaky, and everything built on top of `β_jr` would be suspect. Because it did match reasonably well, the model earns the right to be trusted for things that simply can't be tested with a live A/B test.

It's worth sitting with the honesty of that 0.73 R² rather than rounding it up to "solved." About 27% of the variance in real diversion ratios isn't explained by the model — strong enough to trust the model's broad conclusions, not strong enough to treat every fine-grained downstream number as exact.

## Step 5: So what?

Once validated, the model gets pointed at the questions the paper actually cares about.

**What is the current RecSys worth?** They simulate replacing it entirely with three alternatives — random recommendations, popularity-based recommendations, and a 2015-era matrix factorization approach — and measure the resulting change in engagement and catalog concentration (HHI):

| Alternative algorithm | Engagement change | Concentration (HHI) change |
| --- | --- | --- |
| Random | −16% | −2.5% |
| Popularity-based | −12% | +42.5% |
| Matrix factorization | −4% | +37.5% |

The engagement drops tell a clear ordering: the sophistication of personalization matters, and matters a lot. But the concentration numbers are the more interesting story. Popularity-based and matrix-factorization recommendations don't just lose engagement — the engagement that remains gets squeezed onto a much narrower slice of the catalog. Consumption that used to spread across thousands of titles starts piling up on a handful of already-popular ones. The current RecSys's real achievement isn't just "more engagement" — it's more engagement without falling into that concentration trap.

**Why do recommendations actually work?** For any given title, they split the gap between "a targeted user, recommended" and "an average user, not recommended" into three components: **selection** (51.3%) — targeted users already had higher baseline taste for this title, the algorithm just found the right people; **exposure** (6.8%) — the plain mechanical effect of a title simply showing up anywhere, for anyone; and **targeting** (41.9%) — the extra responsiveness specifically among targeted users, beyond what taste and generic exposure alone would predict.

Targeting is nearly 7x larger than exposure alone, and it matters most for mid-popularity titles, not the biggest hits (broad appeal makes them find their audience regardless) and not the nichest niche (too small a signal to target well). This is arguably the paper's sharpest finding: the value of a sophisticated RecSys isn't mostly about showing things to people — it's about finding specific, non-obvious matches and responding to them disproportionately.

**What about titles that don't exist yet?** For catalog and content investment decisions, you need to estimate the incremental value of a title before it's released — and the endogenously-learned embeddings from Steps 1–4 can't do that, since they're learned from consumption data a new title doesn't have yet. So they extend the model with exogenous, pre-tagged embeddings — built from human tags and observable characteristics — that can represent titles that were never on the platform at all, trading a bit of predictive accuracy for the ability to reason about content that doesn't exist yet.

## A question this raises for me

I'll admit my own bias going into this. I spent time on the personalization team at Target, and a large part of that job was running A/B tests — take a new ranking model, ship it to a slice of real traffic, hold out a control, and after a few weeks read off a number: did this beat what's currently in production, or not? That's about as close to ground truth as "does this technique actually work" gets. Randomization does the hard work of untangling taste from exposure for free, no conditional-exogeneity assumption required, because you never let an algorithm decide who got shown what in the first place.

So reading this paper, I kept turning the paper's own question back on itself: if Netflix already ran a legitimate, well-powered 9-arm A/B test, why build an entire counterfactual choice model on top of it at all? Isn't the experiment itself the incremental-value measurement?

The honest answer, once I sat with it, is that the A/B test only tells you about the one specific manipulation you actually shipped to real users. It can't tell you what would've happened had the whole recommender been swapped for random or 2015-era matrix factorization — no one's approving a five-week degradation of a live product just to get that number. It can't decompose a topline lift into selection versus targeting; an experiment hands you the net effect, not the internal anatomy of why it happened. And it obviously can't price a title that doesn't exist yet. Those are the questions the paper actually needed answered, and none of them are reachable by A/B testing alone, however rigorous the test.

That's what reframed this for me. I still don't think offline metrics should stand in for "does this beat what we have" — that question belongs to the experiment, full stop, and I've watched enough teams chase an offline metric that never quite tracked online lift to be wary of that substitution. But what Netflix built here isn't a replacement for the A/B test — it's a way to answer questions positioned *around* the experiment, and it only earns the right to be trusted because the experiment validated it first. The A/B test isn't competing with the model; it's the thing that gives the model its credibility. Maybe that's the real lesson for teams like the one I was on: stop looking for the one offline metric that will finally make experimentation unnecessary, and start asking what the experiment structurally cannot tell you — that's the only place an offline model earns its keep.

## The pattern worth taking away

Strip away the Netflix specifics, and what's left is a template worth generalizing: separate the effect you care about into its own additive term, find a source of variation you can argue is close to random, and then go verify that argument against something you didn't have to assume — a real, controlled experiment.

A lot of causal recsys evaluation skips that last part. It's easy to build a model with a taste term and a recommendation-effect term, call the second one "causal," and never check whether the assumption that makes it causal actually holds. The diversion-ratio validation in this paper is the discipline that a lot of practitioner writeups quietly leave out — and it's the difference between "we built a model that produces a number" and "we have evidence this number means what we think it means."

---

*Source:*
- [The Value of Personalized Recommendations: Evidence from Netflix](https://arxiv.org/abs/2511.07280)
