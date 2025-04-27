import BlogListWithSearch from './components/BlogListWithSearch'
import { getSortedPostsData } from '../lib/posts'

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <div className="py-12">
      <div className="text-center mb-12">
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