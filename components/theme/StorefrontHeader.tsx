'use client'

import Link from 'next/link'
import { Languages, Menu, Moon, ShoppingBag, Sun, UserRound, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore, useState } from 'react'
import { FavouritesButton } from '@/components/favourites/FavouritesDrawer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import type { StoreLocale } from '@/lib/theme/types'

export interface StorefrontNavLink {
  label: string
  href: string
}

interface StorefrontHeaderProps {
  locale: StoreLocale
  label: string
  logo?: string
  links?: StorefrontNavLink[]
  sticky?: boolean
}

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto:|tel:)/i.test(href)
}

function NavLink({ link, className, onClick }: { link: StorefrontNavLink; className?: string; onClick?: () => void }) {
  if (!link.href || !link.label) return null
  if (isExternal(link.href)) {
    return <a href={link.href} className={className} onClick={onClick}>{link.label}</a>
  }
  return <Link href={link.href} className={className} onClick={onClick}>{link.label}</Link>
}

const THEME_CHANGE_EVENT = 'seellr-theme-change'

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback)
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback)
}

function readTheme() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

export function StorefrontHeader({ locale, label, logo, links = [], sticky = true }: StorefrontHeaderProps) {
  const ar = locale === 'ar'
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  // The saved theme is applied pre-paint by an inline script in the root layout.
  // `useSyncExternalStore` keeps the toggle in sync without an effect.
  const dark = useSyncExternalStore(subscribeTheme, readTheme, () => false)
  const otherLocale = ar ? 'en' : 'ar'
  const restPath = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/'
  const localeHref = `/${otherLocale}${restPath === '/' ? '' : restPath}`

  function toggleTheme() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    window.localStorage.setItem('seellr-theme', next ? 'dark' : 'light')
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }

  function closeMenu() { setMenuOpen(false) }

  const brand = (
    <>
      {logo
        ? <img src={logo} alt={label} className="size-9 rounded-xl object-cover" />
        : <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><ShoppingBag className="size-4" /></span>}
      {label}
    </>
  )

  return <header data-preview-interactive-ignore className={`${sticky ? 'sticky top-0' : 'relative'} z-30 border-b border-border/70 bg-background/95 px-4 py-3 shadow-sm backdrop-blur-md sm:px-8`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <Link href={`/${locale}`} onClick={closeMenu} className="flex items-center gap-2 text-lg font-bold tracking-tight">{brand}</Link>
      <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
        {links.map((link, index) => <NavLink key={`${link.href}-${index}`} link={link} className="text-foreground transition-colors hover:text-primary" />)}
      </nav>
      <div className="flex items-center gap-2">
        <Link href={localeHref} className="hidden h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-bold transition-colors hover:bg-muted sm:inline-flex" aria-label={ar ? 'تغيير اللغة' : 'Change language'}><Languages className="size-4" />{otherLocale.toUpperCase()}</Link>
        <button type="button" onClick={toggleTheme} className="hidden size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted sm:grid" aria-label={dark ? (ar ? 'الوضع الفاتح' : 'Light mode') : (ar ? 'الوضع الداكن' : 'Dark mode')}>{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
        <Link href={`/${locale}/account`} className="hidden size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted sm:grid" aria-label={ar ? 'الحساب' : 'Account'}><UserRound className="size-4" /></Link>
        <FavouritesButton locale={locale} />
        <CartDrawer locale={locale} />
        <button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted md:hidden" aria-label={menuOpen ? (ar ? 'إغلاق القائمة' : 'Close menu') : (ar ? 'فتح القائمة' : 'Open menu')} aria-expanded={menuOpen}>{menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button>
      </div>
    </div>
    {menuOpen && <div className="border-t border-border/70 pb-2 pt-4 md:hidden"><nav className="grid gap-1 text-sm font-semibold">{links.map((link, index) => <NavLink key={`${link.href}-${index}`} link={link} className="rounded-xl px-4 py-3 hover:bg-muted" onClick={closeMenu} />)}</nav><div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/70 pt-3"><Link href={localeHref} onClick={closeMenu} className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-bold"><Languages className="size-4" />{otherLocale.toUpperCase()}</Link><button type="button" onClick={toggleTheme} className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-bold">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}{dark ? (ar ? 'فاتح' : 'Light') : (ar ? 'داكن' : 'Dark')}</button><Link href={`/${locale}/account`} onClick={closeMenu} className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-bold"><UserRound className="size-4" />{ar ? 'حسابي' : 'Account'}</Link></div></div>}
  </header>
}
