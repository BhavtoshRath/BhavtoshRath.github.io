import Link from 'next/link'
import CategoryTag from './CategoryTag'
import FadeInWhenVisible from './FadeInWhenVisible'
import { PostData } from '@/lib/posts'

export default function PostListItem({ post }: { post: PostData }) {
  return (
    <FadeInWhenVisible>
    <article className="card-hover py-6 px-4 -mx-4 rounded-lg border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/60">
      {post.categories && post.categories.length > 0 && (
        <div className="flex flex-wrap mb-2">
          {post.categories.map(category => (
            <CategoryTag key={category} name={category} />
          ))}
        </div>
      )}
      <Link href={`/posts/${post.id}`} className="group">
        <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
      </Link>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
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
      <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
        {post.excerpt}
      </p>
      <Link
        href={`/posts/${post.id}`}
        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
      >
        Read more →
      </Link>
    </article>
    </FadeInWhenVisible>
  )
}
