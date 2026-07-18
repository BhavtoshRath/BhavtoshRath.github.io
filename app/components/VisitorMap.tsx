'use client'

import { useEffect, useState } from 'react'

const EXCLUDE_KEY = 'visitorMapExcludeSelf'

export default function VisitorMap() {
  const [excluded, setExcluded] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('nostat') === '1') {
      localStorage.setItem(EXCLUDE_KEY, 'true')
    }
    setExcluded(localStorage.getItem(EXCLUDE_KEY) === 'true')
  }, [])

  if (excluded) {
    return null
  }

  return (
    <a
      href="https://info.flagcounter.com/CmXD"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-md bg-white p-2 shadow-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://s05.flagcounter.com/map/CmXD/size_s/txt_000000/border_CCCCCC/pageviews_0/viewers_0/flags_0/"
        alt="Map of visitor locations"
        width={400}
        height={205}
        className="max-w-full h-auto"
      />
    </a>
  )
}
