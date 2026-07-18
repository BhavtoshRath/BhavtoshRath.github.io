import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'

export const dynamic = 'force-static'

const SITE_URL = 'https://bhavtoshrath.github.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData()

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.id}`,
    lastModified: post.date,
  }))

  return [
    {
      url: SITE_URL,
    },
    {
      url: `${SITE_URL}/about`,
    },
    {
      url: `${SITE_URL}/categories`,
    },
    ...postEntries,
  ]
}