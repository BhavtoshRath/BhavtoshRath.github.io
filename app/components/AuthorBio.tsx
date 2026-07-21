import Image from 'next/image'

export default function AuthorBio() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <Image
          src="/images/profile.jpg"
          alt="Bhavtosh Rath"
          width={80}
          height={80}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">Bhavtosh Rath</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Machine Learning Scientist &amp; AI Engineer
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        Writing about recommendation systems, LLMs, and agentic AI&mdash;from research ideas to production systems.
      </p>
      <div className="flex justify-center gap-4 text-sm">
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
  )
}
