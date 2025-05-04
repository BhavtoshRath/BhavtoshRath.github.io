import { getSortedPostsData } from '@/lib/posts';
import CategoriesFilter from '@/app/components/CategoriesFilter';

export default function Categories() {
  const posts = getSortedPostsData();

  // Build category map on the server
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
      <CategoriesFilter categoryMap={categoryMap} />
    </div>
  );
} 