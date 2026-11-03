import { PreviewPageClient } from '@/components/preview/PreviewPageClient'
export default async function StorefrontPreviewPage({ params }: { params: Promise<{ locale: string }> }) { const locale = (await params).locale === 'ar' ? 'ar' : 'en'; return <PreviewPageClient initialLocale={locale} /> }
