import Link from 'next/link'
import { PostData } from '@/lib/posts'

export default function PostCard({ post }: { post: PostData }) {
  return (
    <Link href={`/posts/${post.id}`}>
      <article className="card-hover bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <div className="inline-block px-3 py-1 mb-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              Blog Post
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              {post.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
              {post.excerpt}
            </p>
          </div>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {post.author[0]}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {post.author}
                </p>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  )
}
