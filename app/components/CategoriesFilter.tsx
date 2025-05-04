"use client";
import { useState } from 'react';
import Link from 'next/link';
import CategoryTag from '@/app/components/CategoryTag';
import type { PostData } from '@/lib/posts';

const ALPHABETS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function CategoriesFilter({ categoryMap }: { categoryMap: Record<string, PostData[]> }) {
  const allCategories = Object.keys(categoryMap).sort((a, b) => a.localeCompare(b));
  const [selectedAlpha, setSelectedAlpha] = useState<string>('All');

  const filteredCategories =
    selectedAlpha === 'All'
      ? allCategories
      : allCategories.filter(cat => cat[0].toUpperCase() === selectedAlpha);

  return (
    <>
      {/* Alphabet Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          className={`px-3 py-1 rounded-full font-semibold border ${selectedAlpha === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          onClick={() => setSelectedAlpha('All')}
        >
          All
        </button>
        {ALPHABETS.map(letter => (
          <button
            key={letter}
            className={`px-3 py-1 rounded-full font-semibold border ${selectedAlpha === letter ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setSelectedAlpha(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="grid gap-8">
        {filteredCategories.length === 0 && (
          <div className="text-gray-500">No categories found for &quot;{selectedAlpha}&quot;.</div>
        )}
        {filteredCategories.map(category => (
          <div key={category} className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <CategoryTag name={category} />
              <span className="text-gray-600 dark:text-gray-400">
                ({categoryMap[category].length} posts)
              </span>
            </div>
            <div className="space-y-4">
              {categoryMap[category].map(post => (
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
    </>
  );
} 