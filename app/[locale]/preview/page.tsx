import { Suspense } from 'react'
import { PreviewPageClient } from '@/components/preview/PreviewPageClient'
import type { StoreLocale } from '@/lib/theme/types'

async function PreviewContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <PreviewPageClient initialLocale={(locale === 'ar' ? 'ar' : 'en') as StoreLocale} />
}

export default function StorefrontPreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={<main className="min-h-dvh animate-pulse bg-muted/30" />}>
      <PreviewContent params={params} />
    </Suspense>
  )
}
