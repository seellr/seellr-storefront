import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LogoutButton } from '@/components/account/LogoutButton'
import { getStoreHost, storeBackendHeaders } from '@/lib/backend/headers'
import type { User } from '@/lib/commerce/types'

async function AccountContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const ar = locale === 'ar'
  const token = (await cookies()).get('customer_token')?.value
  if (!token) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/account`)}`)

  let user: User | null = null
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/customer/auth/me`, {
      headers: storeBackendHeaders(await getStoreHost(), locale, true, token),
      cache: 'no-store',
    })
    const payload = (await response.json()) as { data?: User }
    user = payload.data ?? null
  } catch {
    user = null
  }

  const displayName = (user?.name ?? `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()) || (ar ? 'مرحبًا' : 'Welcome')
  const links = [
    { href: `/${locale}/orders`, label: ar ? 'طلباتي' : 'My orders' },
    { href: `/${locale}/cart`, label: ar ? 'سلة التسوق' : 'My cart' },
    { href: `/${locale}/products`, label: ar ? 'تصفح المنتجات' : 'Browse products' },
    { href: `/${locale}`, label: ar ? 'الرئيسية' : 'Home' },
  ]

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{ar ? 'حسابك' : 'Your account'}</span>
      <h1 className="mt-3 text-4xl font-bold">{displayName}</h1>
      <p className="mt-3 text-muted-foreground" dir="ltr">{user?.email ?? user?.phone ?? ''}</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {links.map((link) => <Link key={link.href} href={link.href} className="rounded-2xl border bg-card p-6 font-semibold transition-colors hover:border-primary">{link.label}</Link>)}
      </div>
      <div className="mt-8"><LogoutButton locale={ar ? 'ar' : 'en'} /></div>
    </main>
  )
}

export default function AccountPage({ params }: PageProps<'/[locale]/account'>) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl animate-pulse px-5 py-24"><div className="h-10 w-1/3 rounded bg-muted" /><div className="mt-8 h-40 rounded-2xl bg-muted" /></main>}>
      <AccountContent params={params} />
    </Suspense>
  )
}
