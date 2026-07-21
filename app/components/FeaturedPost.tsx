import Link from 'next/link'
import CategoryTag from './CategoryTag'
import FadeInWhenVisible from './FadeInWhenVisible'
import { PostData } from '@/lib/posts'

export default function FeaturedPost({ post }: { post: PostData }) {
  return (
    <FadeInWhenVisible>
    <Link href={`/posts/${post.id}`} className="block group mb-12">
      <article className="card-hover relative bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 overflow-hidden group-hover:shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-3">
          Latest Post
        </span>
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap mb-3">
            {post.categories.map(category => (
              <CategoryTag key={category} name={category} />
            ))}
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <time>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
            })}
          </time>
          {post.readTime && (
            <>
              <span>•</span>
              <span>{post.readTime} read</span>
            </>
          )}
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          {post.excerpt}
        </p>
        <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold">
          Read full post →
        </span>
      </article>
    </Link>
    </FadeInWhenVisible>
  )
}
