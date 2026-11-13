'use client'

import { useMemo, useSyncExternalStore } from 'react'
import DOMPurify from 'dompurify'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// DOMPurify needs a DOM, so the sanitized markup can only be produced in the
// browser. `useSyncExternalStore` gives us a hydration-safe "is this the
// client yet?" flag without setting state from an effect.
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function RichTextContent({ html, className }: { html: string; className?: string }) {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const sanitized = useMemo(() => {
    if (!isClient) return ''
    const source = (html ?? '').trim()
    if (!source) return ''
    const markup = source.includes('<') ? source : `<p>${escapeHtml(source)}</p>`
    return DOMPurify.sanitize(markup, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target'],
      FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input', 'button'],
    })
  }, [html, isClient])

  if (!sanitized) return null
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />
}
