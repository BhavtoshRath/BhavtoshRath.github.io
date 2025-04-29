import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import CategoryTag from '@/app/components/CategoryTag';

export default function Categories() {
  const posts = getSortedPostsData();
  
  // Get unique categories and count posts in each
  const categoryMap = posts.reduce((acc, post) => {
    (post.categories || []).forEach(category => {
      if (category) {
        acc[category] = (acc[category] || []).concat(post);
      }
    });
    return acc;
  }, {} as Record<string, typeof posts>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      <div className="grid gap-8">
        {Object.entries(categoryMap).map(([category, posts]) => (
          <div key={category} className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <CategoryTag name={category} />
              <span className="text-gray-600 dark:text-gray-400">
                ({posts.length} posts)
              </span>
            </div>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="group">
                  <Link href={`/posts/${post.id}`}>
                    <div className="hover:text-blue-600 dark:hover:text-blue-400">
                      <h3 className="text-xl font-medium">{post.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {post.date}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 