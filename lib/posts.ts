import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface PostData {
  id: string
  title: string
  date: string
  excerpt: string
  author: string
  youtube?: string
  contentHtml?: string
  categories?: string[]
}

export async function getAllPostIds() {
  const fileNames = await fs.promises.readdir(postsDirectory)
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, '')
    }
  })
}

export function getSortedPostsData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    return {
      id,
      ...(matterResult.data as { 
        title: string
        date: string
        excerpt: string
        author: string
        categories?: string[]
      })
    }
  })

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export async function getPostData(slug: string): Promise<PostData & { contentHtml: string }> {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = await fs.promises.readFile(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  
  // Remove the iframe from the markdown content as we'll render it separately
  const contentWithoutIframe = matterResult.content.replace(/<div class="aspect-w-16[\s\S]*?<\/div>/, '')
  
  const processedContent = await remark()
    .use(html)
    .process(contentWithoutIframe)
  const contentHtml = processedContent.toString()

  return {
    id: slug,
    contentHtml,
    ...(matterResult.data as { 
      title: string
      date: string
      excerpt: string
      author: string
      youtube?: string
      categories?: string[]
    })
  }
} 