import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Section with Image */}
      <div className="text-center mb-12">
        <div className="mb-8">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <Image
              src="/images/profile.jpg"
              alt="Bhavtosh Rath"
              width={192}
              height={192}
              className="rounded-full shadow-lg"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">About Me</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Machine Learning Scientist &amp; AI Engineer
          </p>
        </div>
      </div>

      {/* Bio Section */}
      <div className="prose dark:prose-invert mx-auto mb-12">
        <p className="text-lg leading-relaxed mb-6">
          I&apos;m a Machine Learning Scientist and AI Engineer with over 11 years of experience building
          intelligent systems that solve complex, real-world problems. My work sits at the intersection of
          machine learning, large-scale data systems, and product strategy, where I enjoy turning research
          ideas into production systems that create measurable business and user impact.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          My core expertise is in recommendation systems, personalization, search and ranking, experimentation,
          and real-time decision-making. Throughout my career, I&apos;ve designed and deployed end-to-end machine
          learning solutions&mdash;from data pipelines and feature engineering to model training, online
          inference, experimentation, and continuous optimization. I enjoy working on problems where scale,
          ambiguity, and user experience intersect.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Most recently, I&apos;ve been expanding my focus into Generative AI and Agentic AI. I&apos;m particularly
          interested in building AI systems that can reason, use tools, retrieve knowledge, and collaborate
          across multiple agents to solve complex tasks. I&apos;ve been developing applications using LLMs,
          Retrieval-Augmented Generation (RAG), LangGraph, tool calling, vector databases, and modern AI
          orchestration frameworks to create practical enterprise AI assistants and copilots.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          I hold a Ph.D. in Computer Science and have spent my career combining deep technical expertise with a
          strong product mindset. I enjoy collaborating with cross-functional teams, mentoring engineers and
          data scientists, and translating business problems into scalable AI solutions.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          What motivates me most is building products that people genuinely find useful. Whether it&apos;s
          improving personalization for millions of users, designing intelligent recommendation systems, or
          creating the next generation of AI-powered applications, I&apos;m driven by solving challenging
          problems with elegant, data-driven solutions.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          I&apos;m also passionate about the rapidly evolving AI ecosystem and continuously explore new ideas in
          agentic systems, foundation models, and AI-native product development. I believe we&apos;re only at the
          beginning of what&apos;s possible with modern AI, and I&apos;m excited to help shape that future.
        </p>
        <p className="text-lg leading-relaxed">
          Outside of work, I enjoy spending time with my son, Shivam&mdash;cooking, playing guitar, singing,
          playing PS5 games, and exploring new technologies. I upload some of my
          guitar covers to my{' '}
          <a
            href="https://www.youtube.com/@bhavtoshguitar948"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            YouTube channel
          </a>
          . I believe the best engineers are lifelong learners, and I&apos;m always looking for opportunities to
          build, experiment, and grow.
        </p>
      </div>

      {/* Expertise Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Areas of Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Core ML Expertise</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>Recommendation Systems & Personalization</li>
              <li>Search & Ranking</li>
              <li>Experimentation & Real-Time Decision-Making</li>
              <li>End-to-End ML: Pipelines, Feature Engineering, Online Inference</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Generative & Agentic AI</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>LLMs & Retrieval-Augmented Generation (RAG)</li>
              <li>Multi-Agent Systems & Tool Calling</li>
              <li>LangGraph & AI Orchestration Frameworks</li>
              <li>Vector Databases</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Get in Touch</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          I&apos;m always interested in collaborating on innovative projects and research opportunities.
        </p>
        <div className="flex justify-center space-x-6">
          <a 
            href="https://github.com/BhavtoshRath" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            GitHub
          </a>
          <a 
            href="https://www.linkedin.com/in/bhavtosh-rath"
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            LinkedIn
          </a>
          <a 
            href="mailto:rathbhavtosh3003@gmail.com"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  )
} 