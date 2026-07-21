import BlogListWithSearch from './components/BlogListWithSearch'
import { getSortedPostsData } from '../lib/posts'

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <div className="py-12">
      <div className="relative text-center mb-12 py-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-[60%] -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-20 blur-3xl dark:opacity-20" />
          <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-[10%] -translate-y-[40%] rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 opacity-20 blur-3xl dark:opacity-20" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          Bhavtosh Rath&apos;s Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Exploring AI research and trends.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
          Recent Posts
        </h2>
        <BlogListWithSearch posts={posts} />
      </div>
    </div>
  )
}