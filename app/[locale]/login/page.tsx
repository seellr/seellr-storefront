'use client'

import { Suspense, use, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { mergeGuestCart } from '@/lib/commerce/cart'
import { commerceClient } from '@/lib/commerce/client'
import type { Locale } from '@/lib/commerce/types'

function LoginForm({ params }: { params: Promise<{ locale: string }> }) {
  const locale = use(params).locale as Locale
  const ar = locale === 'ar'
  const router = useRouter()
  const search = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await commerceClient.login(identifier, password)
      // The login route has already set the customer cookie, so the guest cart
      // can be attached to the account before the first authenticated render.
      await mergeGuestCart()
      const next = search.get('next')
      const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : null
      router.replace(safeNext ?? `/${locale}/account`)
      router.refresh()
    } catch (cause) {
      const value = cause as { message?: string; status?: number }
      setError(
        value.status === 403
          ? (ar ? 'يرجى تأكيد بريدك الإلكتروني أولًا.' : 'Please verify your email address first.')
          : (ar ? 'بيانات الدخول غير صحيحة.' : 'The credentials are not valid.'),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16">
      <form onSubmit={submit} className="w-full rounded-3xl border bg-card p-7 shadow-sm sm:p-9">
        <h1 className="text-3xl font-bold">{ar ? 'تسجيل الدخول' : 'Sign in'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{ar ? 'أكمل للمتابعة إلى حسابك.' : 'Continue to your account.'}</p>
        {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <label className="mt-7 block text-sm font-medium">{ar ? 'البريد أو الهاتف' : 'Email or phone'}
          <input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" dir="ltr" className="mt-2 h-11 w-full rounded-xl border bg-background px-3 outline-none ring-primary/20 focus:ring-4" />
        </label>
        <label className="mt-4 block text-sm font-medium">{ar ? 'كلمة المرور' : 'Password'}
          <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 h-11 w-full rounded-xl border bg-background px-3 outline-none ring-primary/20 focus:ring-4" />
        </label>
        <div className="mt-3 text-end"><Link href={`/${locale}/forgot-password`} className="text-xs font-semibold text-primary hover:underline">{ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</Link></div>
        <button disabled={busy} className="mt-6 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">{busy ? (ar ? 'جارٍ الدخول...' : 'Signing in...') : ar ? 'دخول' : 'Sign in'}</button>
        <p className="mt-5 text-center text-sm text-muted-foreground">{ar ? 'ليس لديك حساب؟' : "Don't have an account?"} <Link href={`/${locale}/register`} className="font-semibold text-primary hover:underline">{ar ? 'أنشئ حسابًا' : 'Create one'}</Link></p>
      </form>
    </main>
  )
}

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md animate-pulse px-5 py-24"><div className="h-96 rounded-3xl bg-muted" /></main>}>
      <LoginForm params={params} />
    </Suspense>
  )
}
