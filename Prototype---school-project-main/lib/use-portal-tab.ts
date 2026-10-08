'use client'

import { useEffect, useState } from 'react'

const EVENT = 'portal:tab'

// Active portal tab that can also be set from outside the page:
// via `?tab=` in the URL on load, or openPortalTab() while the page is open.
export function usePortalTab<T extends string>(initial: T) {
  const [tab, setTab] = useState<T>(initial)
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('tab')
    if (fromUrl) setTab(fromUrl as T)
    const onOpen = (e: Event) => setTab((e as CustomEvent<string>).detail as T)
    window.addEventListener(EVENT, onOpen)
    return () => window.removeEventListener(EVENT, onOpen)
  }, [])
  return [tab, setTab] as const
}

export function openPortalTab(tab: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: tab }))
  const anchor = document.getElementById('portal-sections')
  const target = anchor && anchor.offsetParent !== null ? anchor : document.querySelector('main [data-portal-tabs]')
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' })
}
