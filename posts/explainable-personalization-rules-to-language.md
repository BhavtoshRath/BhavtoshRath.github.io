---
title: 'From Rules to Representations to Language: The Return of Explainable Personalization'
date: '2026-07-28'
excerpt: 'A look across Meta, Google Research, and Netflix Research shows the same shift happening in parallel: recommendation systems are starting to represent user preferences as language again, and explainability is coming along with it.'
author: 'Bhavtosh Rath'
categories: ['Personalization', 'LLM', 'Recommendation Systems', 'Explainability']
readTime: '7 mins'
---

## TL;DR

- Meta's **Dear Algo**, Google Research's **Generative Recommenders**, and several academic groups working on editable natural-language user profiles all seem to be circling the same idea from different angles.
- Recommendation systems have moved through three fundamentally different representations of user preferences: explicit rules, then learned latent embeddings, and now, increasingly, natural language.
- Rules were transparent but couldn't scale. Embeddings scaled but became black boxes that only post-hoc tools like SHAP could partially explain. Language-based representations are trying to make the explanation part of the architecture itself, not something bolted on afterward.
- The tradeoffs are real — LLM inference cost, faithfulness of generated explanations, and the maintenance burden of keeping a natural-language profile in sync with behavior — and it's still unclear whether these systems can match the business impact of today's embedding-based architectures.

*"Every generation of recommendation systems solved one problem while creating another."*

Over the past few weeks I've been reading engineering blogs and research papers out of Meta, Google Research, Netflix Research, and a handful of academic groups working on LLM-powered recommendation. These teams are tackling different problems — social feeds, streaming, shopping, search, conversational recommendation — so I didn't expect to find much in common between them. But I kept noticing the same underlying trend.

It's a trend I recognize from the inside. On the item personalization team at Target, I spent a fair amount of time on the wrong end of the question "why did the model recommend this?" — sometimes to a merchandiser, sometimes to my own team during an incident review. The honest answer was almost always buried in an embedding space, not in anything you could say out loud in a meeting. So when I started seeing Meta, Google, and a handful of research groups converge on natural language as a way to represent what a user wants, it read less like a novel idea and more like a return to something rule-based systems had for free, minus the scaling problems that killed them off in the first place.

Meta is experimenting with user-steerable recommendation through **Dear Algo**, letting people directly influence what shows up in their feed using natural language. Google Research has been exploring **Generative Recommenders**, treating recommendation as a language generation problem rather than an embedding retrieval task. Several research groups are proposing editable natural-language user profiles instead of opaque latent representations. Others are exploring LLM-based reranking, where a language model reasons over a shortlist of candidates instead of relying solely on vector similarity.

At first these looked like unrelated experiments. Taken together, they suggest something bigger: we're not just swapping smaller models for larger ones, we're rethinking **how user preferences themselves should be represented**. Looking back over the past two decades, recommendation systems seem to have gone through three fundamentally different representations of preference — explicit rules, then learned latent embeddings, and now, increasingly, language. Whether this becomes the dominant paradigm is still an open question, but it's one of the more interesting shifts happening in personalization right now.

![Evolution of personalization](/images/evolution_of_personalization.png)
*Evolution of personalization*

## Rules: when recommendations were understandable

Before recommendation was a machine learning problem, it was largely a collection of heuristics and business rules. Amazon's early item-to-item collaborative filtering, editorial curation, manually designed merchandising rules, genre-based recommendation, "customers who bought X also bought Y" — all belonged to this era.

The biggest strength of these systems, in hindsight, wasn't predictive power. It was transparency. If someone asked why a recommendation appeared, there was almost always a straightforward answer: two products were frequently bought together, they shared a category, the customer had recently viewed something similar, or a merchandising rule was intentionally promoting seasonal inventory. Every recommendation had a traceable path from inputs to outputs.

That mattered more than we often give it credit for. Product managers could understand why something appeared. Engineers could debug a bad recommendation without inspecting millions of parameters. Merchandising teams could adjust a rule without retraining anything. Users got explanations that actually meant something.

These systems eventually hit a wall, though. As catalogs grew into millions of items and user behavior got more diverse, hand-written rules couldn't keep up — they struggled with sparse interactions, failed to generalize past whatever logic someone happened to encode, and got expensive to maintain. The industry needed systems that could discover patterns no one could write down by hand. That transition gave us one of the biggest advances recommendation systems have seen.

## Representation learning: learning what we could never engineer

The 2010s changed how recommendation systems were built at a fairly deep level. Instead of explicitly describing relationships between users and items, we started learning those relationships directly from interaction data. Matrix factorization evolved into dense embeddings. Embeddings evolved into two-tower retrieval architectures. Session-based recommenders moved from recurrent networks to transformers. Graph neural networks learned interaction structures that would have been close to impossible to design by hand.

The gains were undeniable — click-through rates went up, conversion improved, watch time grew, cold-start got more tractable. Models were finally capturing latent behavioral patterns that rule-based systems simply had no way to represent.

But every architectural leap comes with a tradeoff, and this one was debuggability. When a modern recommender surfaces an item, the honest answer to "why was this recommended?" is often some version of "the similarity between two learned embedding vectors was high." Technically correct. Practically not very useful. A product manager can't reason about a 256-dimensional vector, a merchandiser can't tune a latent space, and engineers regularly struggle to explain why a model's behavior shifted after a retrain. I remember sitting in a room at Target trying to explain to a merchandising partner why a retrain had quietly deprioritized an entire item cluster the week before a promotion — the true answer involved a shift in the embedding neighborhood, which is not a sentence you can say to someone who just wants to know if the promotion will show up. As these systems got more capable, they also got harder to inspect.

The industry's answer was SHAP, attention visualization, feature attribution, surrogate models — genuinely useful tools, but fundamentally **post-hoc**. They explain a decision after it's already been made rather than making the decision process itself legible. For a long time this felt like an unavoidable tradeoff: state-of-the-art quality meant accepting that the model underneath would be a black box.

## Language: making personalization understandable again

What's interesting about the current wave of LLM-powered recommendation is that a lot of it seems to be pushing back on that assumption. The implementations vary, but the underlying philosophy keeps rhyming: instead of representing users exclusively through dense latent vectors, represent preferences — at least partly — in natural language. Rather than storing only an embedding, the system maintains an evolving description of a user's interests, goals, and behavioral patterns. Unlike an embedding, that description is readable. More importantly, it's editable.

There are already several variations of this idea in the wild. Some systems pair LLM-generated user profiles with traditional embeddings. Others use LLMs as rerankers, letting efficient retrieval narrow millions of candidates down to a few hundred before a language model reasons over the shortlist. Meta's **Dear Algo** takes a more direct route, letting users explicitly tell the system what they want to see more or less of in plain language, rather than relying only on implicit signals. Recent work on governable personalization goes further still, proposing editable user profiles that both users and developers can inspect directly.

What excites me isn't the fact that these systems use LLMs. It's that explainability is starting to move from an afterthought into part of the architecture itself. In many of these designs, the explanation isn't generated after the recommendation has already happened — the representation driving the recommendation is itself something a person can read. That's a subtle shift, but it's an important one.

## The engineering tradeoffs haven't disappeared

None of this is free. LLM inference is substantially more expensive than an embedding similarity lookup, which is why most production systems today remain hybrid — cheap retrieval narrows the field, and the language model only reasons over what's left.

There's also a faithfulness problem. A language model can generate an explanation that sounds convincing without accurately reflecting why an item was actually selected. If the explanation is just persuasive text wrapped around an opaque scoring model underneath, we've improved the user experience without improving transparency at all.

Natural-language profiles bring their own maintenance burden, too — preferences drift continuously, and keeping a textual profile synchronized with actual behavior is its own engineering problem, not a solved one.

And the question every production team eventually asks: can these more interpretable systems deliver the same measurable business impact as today's heavily optimized embedding-based architectures? We don't know yet.

## Looking ahead

Looking back, I don't think the biggest evolution in recommendation systems has been the models themselves. It's been how we've chosen to represent user preferences. Rules represented preferences as explicit logic. Deep learning represented preferences as latent embeddings. LLMs are beginning to represent preferences as language.

Whether language ultimately becomes the dominant representation is still an open question — latency, scalability, faithfulness, cost, and measurable business impact all matter, and none of them are settled. But for the first time in a while, explainability isn't simply being bolted onto recommendation systems after the fact. It's starting to influence how the recommendation decision gets made in the first place. If that trend continues, the next generation of recommendation systems won't just be better at predicting what users want — they'll also be better at explaining why.

## Further reading

**Industry**
- Meta AI, ["Dear Algo: Giving People More Control Over Recommendations"](https://about.fb.com/news/2026/02/threads-dear-algo/)
- Netflix Research, ["The Netflix Recommender System: Algorithms, Business Value, and Innovation"](https://dl.acm.org/doi/10.1145/2843948)
- Google Research, ["Recommender Systems with Generative Retrieval"](https://arxiv.org/abs/2305.05065) (TIGER)

**Research**
- Wang et al., ["Large Language Models for Recommendation: Progresses and Future Directions"](https://dl.acm.org/doi/10.1145/3589335.3641247) (2024)
- Fan et al., ["A Survey on Large Language Models for Recommendation"](https://arxiv.org/abs/2305.19860) (2024)
- Wu et al., ["RecAI: Leveraging Large Language Models for Next-Generation Recommender Systems"](https://arxiv.org/abs/2403.06465)
- ["From Hidden Profiles to Governable Personalization: Recommender Systems in the Age of LLM Agents"](https://arxiv.org/abs/2604.20065)

---

**A question for practitioners:** can we build recommendation systems that keep the predictive power of deep learning while recovering the transparency of rule-based systems — or is explainability fundamentally at odds with state-of-the-art personalization? It's a question I keep coming back to from my own time on item personalization at Target, and it's part of why the small projects on this blog — [Adaptive Ads](/posts/adaptive-ads-multi-agent-personalization), the [value-router series](/posts/value-router-value-weighted-routing) — keep circling the same theme: logging the reasoning, not just the score. I'd love to hear how others working in personalization, search, and ranking are thinking about this.