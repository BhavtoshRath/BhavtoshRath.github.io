'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

type Attribute = 'class' | 'data-theme' | 'data-mode'

interface Props {
  children: ReactNode
  attribute?: Attribute | Attribute[]
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ 
  children,
  ...props
}: Props) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}