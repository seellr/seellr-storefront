'use client'

import { useState } from 'react'
import { use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { commerceClient } from '@/lib/commerce/client'
import type { Locale } from '@/lib/commerce/types'

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const value = use(params) as { locale: Locale }; const ar = value.locale === 'ar'; const router = useRouter(); const search = useSearchParams(); const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(''); try { await commerceClient.login(identifier, password); const next = search.get('next'); router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : `/${value.locale}/account`) } catch { setError(ar ? 'بيانات الدخول غير صحيحة.' : 'The credentials are not valid.') } finally { setBusy(false) } }
  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-16"><form onSubmit={submit} className="w-full rounded-3xl border bg-card p-7 shadow-sm sm:p-9"><h1 className="text-3xl font-bold">{ar ? 'تسجيل الدخول' : 'Sign in'}</h1><p className="mt-2 text-sm text-muted-foreground">{ar ? 'أكمل للمتابعة إلى حسابك.' : 'Continue to your account.'}</p>{error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<label className="mt-7 block text-sm font-medium">{ar ? 'البريد أو الهاتف' : 'Email or phone'}<input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="mt-2 h-11 w-full rounded-xl border bg-background px-3 outline-none ring-primary/20 focus:ring-4" /></label><label className="mt-4 block text-sm font-medium">{ar ? 'كلمة المرور' : 'Password'}<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border bg-background px-3 outline-none ring-primary/20 focus:ring-4" /></label><button disabled={busy} className="mt-7 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">{busy ? (ar ? 'جارٍ الدخول...' : 'Signing in...') : (ar ? 'دخول' : 'Sign in')}</button></form></main>
}
