'use client'

import { useEffect, useRef } from 'react'

export default function PostBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const updateOverflow = () => {
      container.querySelectorAll('pre').forEach((pre) => {
        if (pre.scrollWidth > pre.clientWidth) {
          pre.setAttribute('data-scrollable', 'true')
        } else {
          pre.removeAttribute('data-scrollable')
        }
      })
    }

    updateOverflow()
    window.addEventListener('resize', updateOverflow)
    return () => window.removeEventListener('resize', updateOverflow)
  }, [html])

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}