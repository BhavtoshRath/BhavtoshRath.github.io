import { getPostData, getAllPostIds } from '../../../lib/posts'
import { notFound } from 'next/navigation'
import YouTubeEmbed from '@/app/components/YouTubeEmbed'
import CategoryTag from '@/app/components/CategoryTag'
import Link from 'next/link'

interface Params {
  slug: string;
}

interface Props {
  params: Promise<Params>;
}

export default async function BlogPost({ params }: Props) {
  try {
    const resolvedParams = await params;
    const post = await getPostData(resolvedParams.slug)

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <article className="max-w-7xl mx-auto px-4 py-16">
          {/* Enhanced Header Section */}
          <header className="mb-16 text-center">
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <time className="text-blue-600 dark:text-blue-400 font-medium">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight tracking-tight text-blue-500">
              {post.title}
            </h1>

            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-medium shadow-lg">
                  {post.author[0]}
                </div>
                <div className="ml-3 text-left">
                  <p className="text-gray-900 dark:text-white font-medium">{post.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Author</p>
                </div>
              </div>
            </div>

            {/* Add categories section */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories?.map(category => (
                <Link key={category} href={`/categories#${category}`}>
                  <CategoryTag name={category} />
                </Link>
              ))}
            </div>
          </header>

          {/* YouTube Section with Reduced Width */}
          {post.youtube && (
            <div className="mb-16 max-w-2xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <YouTubeEmbed url={post.youtube} />
              </div>
            </div>
          )}
          
          {/* Enhanced Content Section */}
          <div className="prose prose-lg dark:prose-invert mx-auto
            bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl
            prose-p:text-[18px]
            prose-p:leading-[1.8]
            prose-p:mb-6
            prose-h1:text-3xl
            prose-h2:text-2xl
            prose-h3:text-xl
            prose-li:text-[18px]">
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          </div>
        </article>
      </div>
    )
  } catch {
    notFound()
  }
}

export async function generateStaticParams() {
  const paths = await getAllPostIds()
  return paths
} 