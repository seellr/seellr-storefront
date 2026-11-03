import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getStoreHost, storeBackendHeaders } from '@/lib/backend/headers'
import type { User } from '@/lib/commerce/types'

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale; const token = (await cookies()).get('customer_token')?.value
  if (!token) redirect(`/${locale}/login?next=/${locale}/account`)
  let user: User | null = null
  try { const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/customer/auth/me`, { headers: storeBackendHeaders(await getStoreHost(), locale, true, token), cache: 'no-store' }); const payload = await response.json() as { data?: User }; user = payload.data ?? null } catch { user = null }
  const displayName = (user?.name ?? `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()) || (locale === 'ar' ? 'مرحبًا' : 'Welcome')
  return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24"><span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{locale === 'ar' ? 'حسابك' : 'Your account'}</span><h1 className="mt-3 text-4xl font-bold">{displayName}</h1><p className="mt-3 text-muted-foreground">{user?.email ?? user?.phone}</p></main>
}
