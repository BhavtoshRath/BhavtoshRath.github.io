import { getPostData, getAllPostIds } from '../../../lib/posts'
import { notFound } from 'next/navigation'
import YouTubeEmbed from '@/app/components/YouTubeEmbed'

// Mark the params as a Promise
export async function generateStaticParams() {
  const paths = await getAllPostIds() // Add await here if getAllPostIds is async
  return paths
}

// Mark the component as async and properly handle the params
export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  try {
    // Ensure params.slug is properly awaited
    const slug = await Promise.resolve(params.slug)
    const post = await getPostData(slug)

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
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-gray-600 dark:text-gray-400">5 min read</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight tracking-tight gradient-text">
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
  } catch (error) {
    notFound()
  }
} 