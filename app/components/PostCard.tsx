import Link from 'next/link'
import { PostData } from '@/lib/posts'

export default function PostCard({ post }: { post: PostData }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <article className="relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500">
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-gradient-to-r from-blue-500 to-indigo-500" />
        <div className="flex flex-wrap gap-2 mb-2">
          {post.categories?.map(category => (
            <span key={category} className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-semibold">
              {category}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
          <span>📺</span> {post.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <time>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {post.readTime && (
            <>
              <span>•</span>
              <span>{post.readTime} read</span>
            </>
          )}
        </div>
        <div className="relative group">
          <p className="text-gray-600 dark:text-gray-300 line-clamp-2 group-hover:line-clamp-none transition-all duration-200">
            {post.excerpt}
          </p>
          <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-64 rounded bg-gray-900 text-white text-sm px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
            {post.excerpt}
          </span>
        </div>
        <div className="mt-4">
          <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition">
            Read More →
          </span>
        </div>
      </article>
    </Link>
  )
}
