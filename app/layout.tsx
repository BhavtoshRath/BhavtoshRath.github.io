import './globals.css'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import Footer from './components/Footer'
import { ThemeProvider } from './components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = 'https://bhavtoshrath.github.io'
const description =
  'Bhavtosh Rath — Machine Learning Scientist & AI Engineer, writing about recommendation systems, LLMs, and agentic AI, from research ideas to production systems.'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bhavtosh Rath's blog website",
  description,
  openGraph: {
    title: "Bhavtosh Rath's blog website",
    description,
    url: siteUrl,
    siteName: "Bhavtosh Rath's blog website",
    images: ['/images/profile.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Bhavtosh Rath's blog website",
    description,
    images: ['/images/profile.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-900`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}