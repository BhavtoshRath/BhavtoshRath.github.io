---
title: 'Where Does Personalization Actually Happen?'
date: '2026-09-24'
excerpt: "If your recommendation model was trained on the clicks of millions of people, in what sense is it personalized to an individual?"
author: 'Bhavtosh Rath'
categories: ['Personalization', 'Recommendation Systems']
readTime: '6 mins'
---

## TL;DR

- A recommendation model trained on millions of users has no weights that belong to any one person. In the training sense, it isn't personalized at all.
- Personalization mostly happens at inference time. The shared model is a function, and your embedding, recent activity and context are its inputs, so the output is specific to you.
- The catch is that even your embedding is described in the crowd's vocabulary. Unusual tastes get rounded toward your nearest neighbors, and new users get the population default.
- That makes it worth asking whether a system personalizes to a person or just to a very fine-grained type of person.
- Personalization can live in the model (per-user weights), the input (your features) or the prediction (how differently the output behaves for you). Most production systems personalize the input and the prediction, not the model.

An interviewer asked me this question recently: if your recommendation model was trained on the clicks of millions of people, in what sense is it personalized to an individual?

It caught me off guard, but it pointed at something worth thinking about. We call ML models trained on huge volumes of data "personalized." Yet not one weight in the model truly belongs to any individual. Every number it learned was shaped by millions of other users. So where, exactly, is the "you" in a personalized model?

I don't think there's a clean yes-or-no answer. But working through the question changed how I think about what AI-driven personalization actually means.

## Shared rules, personal inputs

True clarity comes once you separate two things: where personalization happens, and what gets personalized.

Think about how a typical model is built. During training, it sees a huge log of past behavior from many users: who viewed what, who skipped what, who bought what after what. From all of that, it learns patterns. People who binge one crime drama often like another. Someone browsing hiking boots at 9 p.m. is probably not buying them today. These patterns are stored in the model's parameters, and those parameters are the same for everyone.

So in the training sense, the model is not personalized at all. But a model is like a function, and a function's output depends on its input. At inference time, when it's time to make a recommendation, the input to that function is your information: your recent history, your saved items, the time of day, your device, and often an embedding that sums up your past behavior. The shared rules are applied to your specific situation, and the result is specific to you.

A helpful analogy is a doctor. Their medical knowledge came from textbooks and thousands of other patients. None of it was learned from you. But when they look at your symptoms and history, the advice they give you is personal. The knowledge is shared; the application is individual.

## Two users, one model

Here's a concrete version. Picture a music streaming app with one recommendation model serving every user.

Priya listens to folk on weekday mornings and pop at the gym on weekends. Marcus mostly listens to podcasts on his commute and rarely plays music at all.

Both open the app on a Saturday at 10 a.m. The exact same model, with the exact same weights, scores the exact same catalog. Yet Priya sees a workout playlist and Marcus sees a podcast mix.

What's different? Only the inputs:

- **User embeddings.** Each person has a vector learned from their history. Priya's sits near other folk and pop listeners; Marcus's sits near other podcast listeners.
- **Recent activity.** Priya just finished a run-tracking session in another app. Marcus hasn't opened the app since Thursday.
- **Context.** Same time of day, but Priya's Saturday pattern differs sharply from her weekday one.

The model learned from millions of people how embeddings, recency and context combine to generate a good suggestion. Priya and Marcus supply the what. Nobody trained a "Priya model." And yet what she gets is hers.

That's "inference-time personalization" in a nutshell. It is also why these systems scale: you train one model and serve a hundred million people, instead of training a hundred million models.

## But how much of you does the model really know?

Even Priya's "personal" embedding isn't fully hers. It was learned at the population level. The embedding dimensions that exist, like "folky," "high energy" or "weekend listener," exist because enough other people behaved in ways that made them meaningful enough to be learned. Priya can only be described in the crowd's vocabulary. If her taste has a quirk that nobody else shares, the model may have no way to express it, so it rounds her toward her nearest neighbors.

That raises a few uncomfortable questions:

- **How much individual information survives?** An embedding compresses years of behavior into a fixed number of values. Too few dimensions, and the quirks that set someone apart get lost. Too many, and you pay in memory, latency and overfitting on users with thin histories. Choosing the size is a tradeoff between how much of each person the model can keep and what the system can afford to serve.
- **Is this personalization or very fine segmentation?** If two people with similar histories always get the same results, the model may be personalizing to a type of person, not to a person. Research on "mainstream bias" supports this: users whose tastes differ from the majority consistently get worse recommendations (Li et al., 2021; Zhu & Caverlee, 2022).
- **What about new or unusual users (the cold start problem)?** A brand-new user has almost no signal, so they get the population default. Someone whose taste is far from the crowd gets pulled toward it. The system works best for people who are already easy to predict.

None of this means inference-time personalization is fake. It means it has some constraints, and a personalization practitioner should be aware of them when asked, "Is your model truly personalized?"

## So what is actually personalized?

So, in the context of ML systems, what is truly personalized?

1. **The model:** Only if its weights are specific to you, as in per-user fine-tuning or on-device learning. Most production systems don't do this.
2. **The input:** Your embedding and features are yours, even if the space they live in is shared.
3. **The prediction:** The output is personalized if it differs meaningfully from what someone else would get.

There's also a strong case that a population-trained model can behave in highly individual ways. Large language models are a good example. The same shared weights can adopt your writing style and remember your preferences within a conversation, all from context supplied at inference time. With enough context, the line between "a shared model applied to you" and "a model of you" starts to blur.

And the reverse can be true. A model fine-tuned on one person's data could still behave generically if that data is thin or noisy. Individual training doesn't guarantee individual behavior.

## Where I've landed (for now)

The original question assumed (and I did too early in my career) that personalization has to live inside the model. In practice, it mostly doesn't. It lives in the meeting point between shared knowledge and individual context. The crowd teaches the model how people tend to behave; your data tells it which of those patterns apply to you.

So I'll leave you with the question I keep coming back to: should we call a system personalized because of how it was trained or because of how differently it behaves for you than for anyone else?

## References

- Li et al., ["Leave No User Behind: Towards Improving the Utility of Recommender Systems for Non-mainstream Users"](https://arxiv.org/abs/2102.01744) (WSDM 2021)
- Zhu & Caverlee, ["Fighting Mainstream Bias in Recommender Systems via Local Fine Tuning"](https://dl.acm.org/doi/10.1145/3488560.3498427) (WSDM 2022)
