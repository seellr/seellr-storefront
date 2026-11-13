import { redirect } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'

// `/` is normally redirected to the default locale by the next-intl proxy.
// This is a fallback for direct server rendering.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`)
}
