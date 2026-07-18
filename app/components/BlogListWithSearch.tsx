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
  const isSearching = query.trim().length > 0;
  const filteredPosts = posts.filter(
    post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase())
  );

  const [featuredPost, ...remainingPosts] = posts;

  return (
    <>
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isSearching ? (
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
