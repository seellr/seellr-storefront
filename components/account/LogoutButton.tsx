'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { commerceClient } from '@/lib/commerce/client'
import type { StoreLocale } from '@/lib/theme/types'

export function LogoutButton({ locale }: { locale: StoreLocale }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    setBusy(true)
    try {
      await commerceClient.logout()
    } catch {
      // The cookie is cleared by the route handler even when the backend call fails.
    } finally {
      router.replace(`/${locale}`)
      router.refresh()
    }
  }

  return (
    <button type="button" onClick={() => void logout()} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60">
      <LogOut className="size-4" />
      {locale === 'ar' ? (busy ? 'جارٍ الخروج...' : 'تسجيل الخروج') : busy ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
