"use client";
import { useState } from "react";
import FeaturedPost from "./FeaturedPost";
import PostListItem from "./PostListItem";
import AuthorBio from "./AuthorBio";
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

  const categoryCounts = allCategories.reduce<Record<string, number>>((counts, category) => {
    counts[category] = posts.filter(post => post.categories?.includes(category)).length;
    return counts;
  }, {});

  const isFiltering = query.trim().length > 0 || selectedCategory !== null;
  const filteredPosts = posts.filter(
    post =>
      (post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase())) &&
      (selectedCategory === null || post.categories?.includes(selectedCategory))
  );

  const [featuredPost, ...remainingPosts] = posts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start">
    <div>
      {allCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6 lg:hidden">
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
    </div>

    <aside className="hidden lg:block sticky top-24 space-y-6">
      <AuthorBio />

      {allCategories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Categories</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>All Posts</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{posts.length}</span>
              </button>
            </li>
            {allCategories.map(category => (
              <li key={category}>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{category}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{categoryCounts[category]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
    </div>
  );
}
