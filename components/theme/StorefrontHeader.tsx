'use client'

import Link from 'next/link'
import { Languages, Menu, Moon, ShoppingBag, Sun, UserRound, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CartDrawer } from '@/components/cart/CartDrawer'
import type { StoreLocale } from '@/lib/theme/types'

export function StorefrontHeader({ locale, label }: { locale: StoreLocale; label: string }) {
  const ar = locale === 'ar'
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
  const otherLocale = ar ? 'en' : 'ar'
  const restPath = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/'
  const localeHref = `/${otherLocale}${restPath === '/' ? '' : restPath}`

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    window.localStorage.setItem('seellr-theme', next ? 'dark' : 'light')
    setDark(next)
  }

  function closeMenu() { setMenuOpen(false) }

  return <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-8" data-preview-interactive-ignore>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <Link href={`/${locale}`} onClick={closeMenu} className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><ShoppingBag className="size-4" /></span>{label}</Link>
      <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"><Link href={`/${locale}`} className="text-foreground transition-colors hover:text-primary">{ar ? 'الرئيسية' : 'Home'}</Link><Link href={`/${locale}/products`} className="transition-colors hover:text-primary">{ar ? 'المتجر' : 'Shop'}</Link><a href="#about" className="transition-colors hover:text-primary">{ar ? 'عن المتجر' : 'About'}</a></nav>
      <div className="flex items-center gap-2">
        <Link href={localeHref} className="hidden h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-bold transition-colors hover:bg-muted sm:inline-flex" aria-label={ar ? 'تغيير اللغة' : 'Change language'}><Languages className="size-4" />{otherLocale.toUpperCase()}</Link>
        <button type="button" onClick={toggleTheme} className="hidden size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted sm:grid" aria-label={dark ? (ar ? 'الوضع الفاتح' : 'Light mode') : (ar ? 'الوضع الداكن' : 'Dark mode')}>{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
        <Link href={`/${locale}/account`} className="hidden size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted sm:grid" aria-label={ar ? 'الحساب' : 'Account'}><UserRound className="size-4" /></Link>
        <CartDrawer locale={locale} />
        <button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted md:hidden" aria-label={menuOpen ? (ar ? 'إغلاق القائمة' : 'Close menu') : (ar ? 'فتح القائمة' : 'Open menu')} aria-expanded={menuOpen}>{menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button>
      </div>
    </div>
    {menuOpen && <div className="border-t border-border/70 pb-2 pt-4 md:hidden"><nav className="grid gap-1 text-sm font-semibold"><Link href={`/${locale}`} onClick={closeMenu} className="rounded-xl px-4 py-3 hover:bg-muted">{ar ? 'الرئيسية' : 'Home'}</Link><Link href={`/${locale}/products`} onClick={closeMenu} className="rounded-xl px-4 py-3 hover:bg-muted">{ar ? 'المتجر' : 'Shop'}</Link><a href="#about" onClick={closeMenu} className="rounded-xl px-4 py-3 hover:bg-muted">{ar ? 'عن المتجر' : 'About'}</a></nav><div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/70 pt-3"><Link href={localeHref} onClick={closeMenu} className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-bold"><Languages className="size-4" />{otherLocale.toUpperCase()}</Link><button type="button" onClick={toggleTheme} className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-bold">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}{dark ? (ar ? 'فاتح' : 'Light') : (ar ? 'داكن' : 'Dark')}</button><Link href={`/${locale}/account`} onClick={closeMenu} className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-bold"><UserRound className="size-4" />{ar ? 'حسابي' : 'Account'}</Link></div></div>}
  </header>
}
