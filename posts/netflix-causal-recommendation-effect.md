---
title: 'How Do You Know Your Recommender System Actually Works?'
date: '2026-09-17'
excerpt: 'A recent Netflix paper tries to separate taste from recommendation effect, then actually checks its own answer against a real experiment instead of just trusting the math.'
author: 'Bhavtosh Rath'
categories: ['Recommendation Systems', 'Causal Inference']
readTime: '13 mins'
---

## TL;DR

- The hard question isn't "did the user watch what we recommended," it's "would they have watched it anyway." A recent Netflix paper builds a model specifically to separate the two.
- The trick: an additive utility score with a **taste term** and a **recommendation-bonus term**, trained on all viewing data together. The separation comes from how the model is structured, not from filtering out recommended watches.
- Splitting the terms on paper doesn't automatically solve the hard part. The paper leans on an assumption called **conditional exogeneity**: once you condition on everything the algorithm used, whatever exposure variation is left over is close to random.
- That assumption can't be checked from the training data itself, so they check it against a real 5-week, 9-arm A/B test using a **diversion ratio**. The model's offline predictions correlate with the live experiment at 0.86 (R² = 0.73).
- Once trusted, the model shows the current RecSys beats simpler alternatives by up to 16% in engagement, without the catalog-concentration collapse those alternatives cause, and that most of a recommendation's power comes from **targeting** specific matches, not just showing up.
- My own take, from running A/B tests on the personalization team at Target: a live experiment already answers "does this beat what we have," no assumptions required. Where a validated offline model like this earns its keep is on the questions an A/B test structurally can't answer, not as a substitute for the experiment.

There's a version of this question every recommender-system team runs into eventually, whether they admit it or not: when a user watches something you recommended, how much of that was the recommendation, and how much was just them? They were probably going to watch a slasher movie tonight anyway. Did showing them Scream 2 actually change anything, or did it just happen to be standing next to a decision they'd already made?

That's the problem a recent Netflix paper, [The Value of Personalized Recommendations: Evidence from Netflix](https://arxiv.org/abs/2511.07280), sets out to solve. What got me about it wasn't really the headline numbers, it was the modeling trick underneath them, and that's mostly what this post is about.

## The core equation

Everything in this paper builds on one formula: the utility score, standing in for how much a specific user wants a specific title at a specific moment.

```
u_ijt = taste_score_ij + rec_bonus_ijt + noise
```

Three ingredients. A **taste score** (how much this user would want this title, independent of whether it was ever recommended). A **recommendation bonus** (the extra push from the title actually being shown to them). And **noise** (everything else the model can't capture: mood, whim, a text from a friend). The whole paper is really about computing the first two terms separately, and why keeping them separate matters.

They built a transformer-based model that looks at a user's watch history and predicts their probability of watching each title. Calling this a recommender model is tempting (it has the ingredients: learned embeddings, attention over the sequence), but that's not what it is. It never decides what gets shown to anyone. It answers two separate questions instead: given what was shown to a user and their history, what's the probability they watch each title? And, separately, how much of that probability comes from taste versus the extra boost of actually being recommended? The real Netflix RecSys, the one that actually builds your homepage, stays a black box the entire time. This model exists to measure and simulate, not to serve.

## Step 1: Modeling taste

To estimate taste, the model isn't trained on some filtered subset of "organic" engagement with the recommendation effect stripped out. It's trained on all viewing data, recommended and unrecommended alike. Taste gets isolated by structure rather than by cleaning the data: there's a separate additive term just for "was this recommended," so any watch behavior that term can explain gets absorbed into it (that's Step 2), leaving the taste component to represent what a user would want independent of what was actually shown to them.

Concretely, taste comes from two embeddings that combine into a single scalar score. `B_j` is a d-dimensional embedding for each title, its learned "characteristics," fixed per title but updated during training. `A_it` is a d-dimensional embedding for user `i` at a specific time `t`, their current preferences, and it shifts as they watch more so taste can evolve over time, again independent of recommendation influence. The dot product of the two gives the taste score:

```
taste_score_ij = A_it · B_j^T
```

One thing that tripped me up here was whether these embeddings were actually individualized, given they're trained on a sample of 2 million users. Turns out: not entirely. Only your specific watch sequence is individual to you. The item embeddings (`B_j`) and the history-encoder function that turns any sequence into a taste vector are shared, learned jointly across all 2 million people. So "your taste," as the model represents it, is a population-level function applied to your particular input, which is just collaborative filtering with a transformer bolted onto the front.

## Step 2: Modeling the recommendation bonus

Now the second term. It captures "you watched it because it was recommended," kept deliberately separate from taste. For each zone a title could appear in — billboard, top 25, top 100 — there's a binary flag (1 if it showed up there, 0 if not) multiplied by a zone-specific learned weight. A title can trigger more than one flag at once, since top 25 titles are also part of top 100 by definition.

```
rec_bonus_ijt = Σ β_jr · 1{j ∈ C_irt}
```

All these zone bonuses get added to the taste score to form the final utility:

```
u_ijt = A_it · B_j^T + Σ β_jr · 1{j ∈ C_irt} + noise
```

The noise term covers everything else influencing a choice that the model can't capture. Statistically it's a Type-1 Extreme Value assumption, which is exactly what makes softmax the "correct" way to turn utilities into probabilities in the first place, a classic McFadden discrete-choice result, not something the authors invented.

The additive structure is the clever part. Taste and recommendation-effect stay as two separate terms instead of one blended number, and that's exactly what lets them switch off the recommendation bonus for one user/title pair later and simulate what would've happened without it.

From here it's back to the normal training grind. Nothing exotic: softmax turns the utility scores into a probability distribution over the whole catalog, the likelihood checks those probabilities against what people actually watched, backprop nudges every parameter (the history encoder behind `A_it`, the item embeddings `B_j`, the recommendation bonuses `β_jr`) a little closer to reality, batch after batch, until it converges.

## Step 3: The identification problem

Here's the actual hard problem, and Steps 1 and 2 don't solve it on their own. When someone watches something recommended to them, you can't directly tell how much came from taste versus the causal effect of being shown it. The real RecSys tends to recommend things it already predicts people will like, so exposure and taste are tangled together in the raw data by construction. Splitting the model into two additive terms doesn't untangle this automatically. The model still has to assign credit correctly, and nothing forces it to do that honestly.

Their answer is an assumption called conditional exogeneity: once you condition on everything the RecSys used to decide who gets shown what (user history, item features, state), whatever exposure variation is left over is close to random rather than driven by some hidden taste difference. Take two users who look identical to the algorithm. If one gets a title recommended and the other doesn't, for basically incidental reasons like routine exploration or a tie-break, the difference in what they watch can be credited to the recommendation itself, not to a taste gap the algorithm secretly spotted.

Once the model is trained, this is what lets them run a clean thought experiment. Pick a specific user at a specific moment, and a specific title. Run inference twice: once with that title's recommendation bonus included in its utility score, once with it zeroed out, holding every other title's taste score and utility fixed. Both runs still require computing utility scores for the entire catalog, not just the target title, because softmax needs the full set of utilities to produce a valid probability distribution. Probability here is relative to every other option on offer, never computed in isolation. So each run produces a full distribution across the roughly 7,000-title catalog (plus the outside option, watching nothing), and you pull out the one number for your target title from each. The gap between the two, with the bonus and without it, is the model's estimate of the recommendation's causal effect, for that user, that title, that moment.

None of this is trustworthy unless conditional exogeneity actually holds, though, and that's not something you can check using the same data you used to train the model. So they go find out.

## Step 4: Validating it against a real experiment

This is where the paper stops asking for trust and actually goes and tests the assumption.

The setup looks different from a standard A/B test. It runs for 5 weeks with roughly a million users per arm, across 9 arms total: 1 control, 8 treatment. Control gets real, unmodified recommendations, nothing to do with the model. Each treatment arm is tied to one focal category (scripted vs. unscripted content, language, film vs. TV series, and so on), and when a user lands in that arm, the category gets shown somewhat more than usual. It's a rebalancing, not a takeover. In the paper's own words: "we substitute impressions of a random subset of goods not in the focal category for impressions of goods in the focal category." Mechanically, that means taking a random subset of non-focal titles that would normally have shown up, and swapping those impression slots for focal-category titles instead.

One thing that's easy to miss here: the model's outputs have nothing to do with what gets shown in this A/B test. The treatment arms come from a simple rule the researchers picked by hand — boost category X, dilute some titles outside it — with zero involvement from the transformer. That separation is what keeps the validation from being circular.

From this they compute a diversion ratio: compare the treatment population to the control population (two different but randomly equivalent groups of users), and ask how much lower a diluted title's viewership is in the treatment arm. Then, of that gap, what fraction shows up as higher viewership of the boosted substitute, what fraction scatters across the rest of the catalog, and what fraction shows up as more people picking the outside option and watching nothing at all.

Take an example. Say in the control arm, Scream is shown normally and 2% of control users watch it. In a treatment arm where Scream 2 gets boosted, only 1.5% of treatment users watch Scream, a 0.5 percentage-point drop between two different, randomly-equivalent populations (nobody's individual behavior is tracked before and after; these are two separate groups of roughly a million people each). Diversion ratio breaks that gap down: how much of it reappears as extra Scream 2 viewership, how much scatters across other titles, and how much shows up as people deciding not to watch anything.

The real, observed diversion ratio, call it D^EMPIRICAL, is model-free. It's ground truth, computed from what actually happened. Separately, they compute D^MODEL: what the trained model predicts would happen under the same manipulation, entirely offline. Here's the mechanism. The model outputs a probability for every title in the catalog plus the outside option, a distribution of roughly 7,001 numbers summing to 1. Run it once on a user's real, unmodified recommendation flags and you get the control baseline: P_control(Scream), P_control(Scream2), and so on down the line. To simulate the treatment arm, flip that user's flags by hand — Scream's flag goes from 1 to 0, Scream 2's from 0 to 1 — and run the model again to get P_treatment(Scream) and P_treatment(Scream2).

Flipping a flag only touches the recommendation-bonus term inside that one title's utility. Taste stays untouched. But softmax normalizes over the whole catalog, so that single change ripples out and nudges every title's probability a little, not just the two you flagged. None of this involves backprop or learning, the model is frozen by this point. It's just arithmetic: a different input into a fixed formula, a different number out. The difference between the two runs is what feeds the diversion ratio formula to produce D^MODEL.

Then comes the check that actually matters: correlate D^MODEL against D^EMPIRICAL across all 8 treatment arms and their titles. The relationship holds up well, 0.86 correlation, 0.73 R². This is the whole point of Step 4. Diversion ratio isn't used again after this as an ongoing metric, it's a validation gate, used once. If the offline predictions hadn't matched the live experiment, that would've been a sign the conditional exogeneity assumption from Step 3 was shaky, and everything built on `β_jr` would be suspect. Because it held up reasonably well, the model earns the right to be trusted for the things a live A/B test simply can't test.

I don't want to round that 0.73 R² up to "solved," either. Something like 27% of the variance in the real diversion ratios goes unexplained by the model. That's strong enough to trust its broad conclusions, not strong enough to treat every downstream number as exact.

## Step 5: So what?

Once validated, the model gets pointed at the questions the paper actually cares about.

First: what is the current RecSys actually worth? They simulate replacing it outright with three alternatives — random recommendations, popularity-based recommendations, and a 2015-era matrix factorization approach — and measure what happens to engagement and to catalog concentration (HHI):

| Alternative algorithm | Engagement change | Concentration (HHI) change |
| --- | --- | --- |
| Random | −16% | −2.5% |
| Popularity-based | −12% | +42.5% |
| Matrix factorization | −4% | +37.5% |

The engagement numbers tell a clean story: the sophistication of the personalization matters, and matters a lot. The concentration numbers are the more interesting part, though. Popularity-based and matrix-factorization recommendations don't just lose engagement, the engagement that's left gets squeezed onto a much smaller slice of the catalog. Consumption that used to spread across thousands of titles starts piling onto a handful of already-popular ones. What the current RecSys is actually good at isn't just "more engagement," it's more engagement without that concentration trap.

Second: why do recommendations work in the first place? For a given title, they split the gap between "a targeted user, recommended" and "an average user, not recommended" into three pieces. Selection (51.3%) is targeted users already having higher baseline taste for the title, the algorithm just found the right people. Exposure (6.8%) is the plain mechanical effect of a title showing up anywhere for anyone. Targeting (41.9%) is the extra responsiveness specific to targeted users, above and beyond what taste and generic exposure alone would predict.

Targeting is close to 7x the size of exposure alone, and it matters most for mid-popularity titles: not the biggest hits, which find their audience regardless of broad appeal, and not the deepest niche, where there isn't enough signal to target well. This might be the paper's sharpest finding. A sophisticated RecSys isn't mostly valuable for showing people things, it's valuable for finding specific, non-obvious matches and leaning into them.

Third: what about titles that haven't been released? For catalog and content-investment decisions you need to estimate a title's incremental value before it exists, and the embeddings learned in Steps 1 through 4 can't do that, since they come from consumption data a new title doesn't have yet. So they extend the model with exogenous, pre-tagged embeddings built from human tags and other observable characteristics, embeddings that can represent titles that were never on the platform at all. It costs a bit of predictive accuracy, but it buys the ability to reason about content that doesn't exist yet.

## A question this raised for me

Full disclosure: I spent time on the personalization team at Target, and most of that job was running A/B tests. Take a new ranking model, ship it to a slice of real traffic, hold out a control, wait a few weeks, read off a number. Did this beat what's in production or not? That's about as close to ground truth as "does this actually work" gets, and randomization does the hard work of untangling taste from exposure for free. No conditional-exogeneity assumption needed, because you never let an algorithm decide who got shown what in the first place.

So my first reaction reading this paper was a version of the question the paper itself is trying to answer, pointed back at the paper: if Netflix already ran a legitimate, well-powered 9-arm A/B test, why bother building an entire counterfactual choice model on top of it? Isn't the experiment itself the incremental-value number you actually want?

Sitting with it longer, the answer is that the A/B test only tells you about the one manipulation you actually shipped. It can't tell you what would've happened if the whole recommender had been swapped for random or for 2015-era matrix factorization; nobody's signing off on degrading a live product for five weeks just to get that number. It can't decompose a topline lift into selection versus targeting either — an experiment gives you the net effect, not the anatomy of why it happened. And it can't price a title that doesn't exist yet, obviously. Those are the actual questions the paper needed answered, and none of them are things an A/B test, however well run, can hand you.

I still don't think an offline metric should stand in for "does this beat what we have already." That's the experiment's job, full stop, and I've seen enough teams chase a metric that never tracked online lift to be wary of that swap. But that's not really what's happening here. Netflix isn't using the model instead of the A/B test, they're using the A/B test to earn the model the right to answer questions the A/B test structurally can't. Maybe that's the more useful version of this instinct for a team like the one I was on: stop hunting for the offline metric that finally makes experimentation optional, and go look for the specific things the experiment can't tell you. That's the only place an offline model is actually worth building.

## What generalizes beyond Netflix

Strip away the Netflix specifics and what's left is a habit worth copying: isolate the effect you actually care about as its own additive term, find a source of variation you can argue is close to random, then go check that argument against something you didn't have to assume, an actual controlled experiment.

Most causal-recsys write-ups skip that last step. It's easy to build a model with a taste term and a recommendation-effect term, call the second one "causal," and never check whether the assumption that makes it causal actually holds. The diversion-ratio validation here is the discipline a lot of practitioner posts quietly leave out, and it's the difference between building a model that produces a number and having evidence that the number means what you think it means.

---

*Source:*
- [The Value of Personalized Recommendations: Evidence from Netflix](https://arxiv.org/abs/2511.07280)
