"use client";
import { useState } from "react";
import FeaturedPost from "./FeaturedPost";
import PostListItem from "./PostListItem";
import type { PostData } from "@/lib/posts";

interface BlogListWithSearchProps {
  posts: PostData[];
}

export default function BlogListWithSearch({ posts }: BlogListWithSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allCategories = Array.from(
    new Set(posts.flatMap(post => post.categories ?? []))
  ).sort((a, b) => a.localeCompare(b));

  const isFiltering = query.trim().length > 0 || selectedCategory !== null;
  const filteredPosts = posts.filter(
    post =>
      (post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase())) &&
      (selectedCategory === null || post.categories?.includes(selectedCategory))
  );

  const [featuredPost, ...remainingPosts] = posts;

  return (
    <>
      {allCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {allCategories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isFiltering ? (
        filteredPosts.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            {filteredPosts.map(post => (
              <PostListItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts found.</p>
        )
      ) : featuredPost ? (
        <>
          <div className="max-w-3xl mx-auto">
            <FeaturedPost post={featuredPost} />
          </div>
          {remainingPosts.length > 0 && (
            <div className="max-w-3xl mx-auto">
              {remainingPosts.map(post => (
                <PostListItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">No posts found.</p>
      )}
    </>
  );
}
