---
title: 'How Netflix Uses Large Language Models for Personalization'
date: '2024-05-10'
excerpt: 'Explore how Netflix leverages LLMs to deliver highly personalized recommendations and user experiences.'
author: 'Your Name'
categories: ['Personalization', 'LLM']
---

Here is a summary of an interesting blog post I recently read about how Netflix is using a foundation model for its personalized recommendation system. As a scientist who has worked in the item personalization team at Target, I believe this is the future of every platform that builds recommendation models.

The blog discusses how Netflix’s personalized recommender system has evolved, becoming a complex network of machine-learned models, each designed for specific user needs such as "Continue Watching" and "Today’s Top Picks for You." However, as the platform grew, the demand for more sophisticated personalization models increased, making it costly to maintain these models. Additionally, the fact that most models were independently trained despite using similar data made it difficult to transfer innovations across them. This highlighted a critical limitation in the system, emphasizing the need for a more unified and scalable architecture that could better centralize member preference learning and make data more accessible and useful across all models.

In response, Netflix shifted towards building a foundation model for recommendations, drawing inspiration from how large language models (LLMs) have transformed natural language processing (NLP). Traditional NLP systems often used multiple specialized models, but the trend has now moved toward a large, versatile model that can handle various tasks with minimal fine-tuning. Netflix is applying this paradigm to its recommendation system, moving from multiple specialized models to a single large foundation model capable of integrating vast amounts of data from user interaction histories and content.

The goal of this foundation model is to assimilate data from users' comprehensive interaction histories, unlike previous models that often relied on a narrow time window due to latency or training cost constraints. By consolidating data at scale, the foundation model allows Netflix to share insights across models through fine-tuning or by using embeddings. This approach ensures that the system is scalable, efficient, and adaptable to the evolving needs of both users and the platform.

Key insights from the shift toward LLMs have shaped Netflix’s approach, including a **data-centric approach** that prioritizes large-scale, high-quality data over model-centric strategies. Transitioning from small, specialized models to one large, efficient system is expected to improve performance and reduce complexity. Additionally, Netflix is leveraging **semi-supervised learning**, inspired by LLMs’ "next-token prediction" objective, which allows the use of large amounts of unlabeled data to help the model better understand user preferences and content characteristics.

In terms of data management, Netflix has a vast and growing user base of over 300 million users by the end of 2024, generating billions of interactions daily. This data is comparable to the token volume seen in LLMs. However, the platform recognizes that the quality of the data is far more important than its sheer volume. To maximize data utility, Netflix uses **interaction tokenization**, ensuring that only meaningful events are considered in the recommendation process. Tokenization is similar to Byte Pair Encoding (BPE) in NLP, where adjacent user actions are combined into higher-level tokens to make the data more manageable. Unlike traditional language tokenization, Netflix’s tokenization must carefully preserve important information, such as watch duration and types of user engagement, to ensure the model accurately understands and predicts user preferences.

Ultimately, this shift toward a foundation model aims to address both current and future needs for Netflix’s recommendation system. By centralizing user preference learning, scaling up data and model parameters, and employing advanced training techniques, Netflix seeks to create a system that is adaptable and efficient. This ensures they can continue innovating while managing resources effectively, providing highly personalized and relevant content at scale.

---

