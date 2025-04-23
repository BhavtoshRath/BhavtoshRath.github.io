'use client'

import Link from 'next/link'
import ThemeToggle from './ThemeToggle'


export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-2xl font-bold gradient-text"
          >
            My Blog
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}