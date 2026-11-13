'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { commerceClient } from '@/lib/commerce/client'
import type { Locale } from '@/lib/commerce/types'

type Field = 'first_name' | 'last_name' | 'email' | 'password' | 'password_confirmation'

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = use(params).locale as Locale
  const ar = locale === 'ar'
  const router = useRouter()
  const [form, setForm] = useState<Record<Field, string>>({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string[]>>({})
  const [busy, setBusy] = useState(false)

  function update(field: Field, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFields({})
    try {
      await commerceClient.register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      router.replace(`/${locale}/check-email`)
    } catch (cause) {
      const value = cause as { message?: string; fields?: Record<string, string[]> }
      setError(value.message || (ar ? 'تعذر إنشاء الحساب.' : 'Could not create your account.'))
      if (value.fields) setFields(value.fields)
    } finally {
      setBusy(false)
    }
  }

  const labels: Record<Field, string> = {
    first_name: ar ? 'الاسم الأول' : 'First name',
    last_name: ar ? 'اسم العائلة' : 'Last name',
    email: ar ? 'البريد الإلكتروني' : 'Email',
    password: ar ? 'كلمة المرور' : 'Password',
    password_confirmation: ar ? 'تأكيد كلمة المرور' : 'Confirm password',
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-5 py-16">
      <form onSubmit={submit} className="w-full rounded-3xl border bg-card p-7 shadow-sm sm:p-9">
        <h1 className="text-3xl font-bold">{ar ? 'إنشاء حساب' : 'Create an account'}</h1>
        {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {(['first_name', 'last_name'] as const).map((field) => <label key={field} className="text-sm font-medium">{labels[field]}
            <input required minLength={2} value={form[field]} onChange={(event) => update(field, event.target.value)} autoComplete={field === 'first_name' ? 'given-name' : 'family-name'} className="mt-2 h-11 w-full rounded-xl border bg-background px-3" />
            {fields[field] && <span className="mt-1 block text-xs text-destructive">{fields[field].join(' ')}</span>}
          </label>)}
        </div>
        <label className="mt-4 block text-sm font-medium">{labels.email}
          <input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" dir="ltr" className="mt-2 h-11 w-full rounded-xl border bg-background px-3" />
          {fields.email && <span className="mt-1 block text-xs text-destructive">{fields.email.join(' ')}</span>}
        </label>
        {(['password', 'password_confirmation'] as const).map((field) => <label key={field} className="mt-4 block text-sm font-medium">{labels[field]}
          <input required minLength={8} type="password" value={form[field]} onChange={(event) => update(field, event.target.value)} autoComplete={field === 'password' ? 'new-password' : 'new-password'} className="mt-2 h-11 w-full rounded-xl border bg-background px-3" />
          {fields[field] && <span className="mt-1 block text-xs text-destructive">{fields[field].join(' ')}</span>}
        </label>)}
        <p className="mt-3 text-xs text-muted-foreground">{ar ? '8 أحرف على الأقل مع حرف كبير وصغير ورقم ورمز.' : 'At least 8 characters with upper and lower case, a number and a symbol.'}</p>
        <button disabled={busy} className="mt-6 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60">{busy ? (ar ? 'جارٍ الإنشاء...' : 'Creating...') : ar ? 'إنشاء الحساب' : 'Create account'}</button>
        <p className="mt-5 text-center text-sm text-muted-foreground">{ar ? 'لديك حساب بالفعل؟' : 'Already have an account?'} <Link href={`/${locale}/login`} className="font-semibold text-primary hover:underline">{ar ? 'سجل الدخول' : 'Sign in'}</Link></p>
      </form>
    </main>
  )
}
