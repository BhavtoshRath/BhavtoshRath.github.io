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
            Machine Learning Scientist
          </p>
        </div>
      </div>

      {/* Bio Section */}
      <div className="prose dark:prose-invert mx-auto mb-12">
        <p className="text-lg leading-relaxed mb-6">
          Hello! I&apos;m Bhavtosh Rath, an AI researcher and software engineer passionate about pushing the boundaries 
          of artificial intelligence and its applications. With a background in computer science and machine learning, 
          I focus on developing innovative solutions that bridge the gap between theoretical AI and practical applications.
        </p>
        <p className="text-lg leading-relaxed">
          Currently, I&apos;m exploring advanced machine learning techniques and their applications in real-world scenarios. 
          Through this blog, I share my insights, experiences, and discoveries in AI, software development, and technology.
        </p>
      </div>

      {/* Expertise Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Areas of Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI & Machine Learning</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>Deep Learning & Neural Networks</li>
              <li>Natural Language Processing</li>
              <li>Computer Vision</li>
              <li>Reinforcement Learning</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Software Development</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>Python & TensorFlow</li>
              <li>React & Next.js</li>
              <li>Cloud Computing</li>
              <li>System Architecture</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Publications & Projects Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 gradient-text">Selected Projects</h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">AI Research Projects</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Led research initiatives in natural language processing and machine learning,
              focusing on improving model efficiency and accuracy.
            </p>
            <a 
              href="#" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Learn More →
            </a>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Open Source Contributions</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Active contributor to various open-source AI and software development projects,
              helping build tools and libraries used by developers worldwide.
            </p>
            <a 
              href="#" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Projects →
            </a>
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
            href="www.linkedin.com/in/bhavtosh-rath" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            LinkedIn
          </a>
          <a 
            href="mailto:rathbhavosh3003@gmail.com" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  )
} 