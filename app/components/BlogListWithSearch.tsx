"use client";
import { useState } from "react";
import PostCard from "./PostCard";
import type { PostData } from "@/lib/posts";

interface BlogListWithSearchProps {
  posts: PostData[];
}

export default function BlogListWithSearch({ posts }: BlogListWithSearchProps) {
  const [query, setQuery] = useState("");
  const filteredPosts = posts.filter(
    post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase())
  );

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No posts found.</p>
        )}
      </div>
    </>
  );
} 