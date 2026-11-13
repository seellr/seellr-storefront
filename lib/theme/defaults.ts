import type { StorefrontPage, ThemeSection } from './types'

/**
 * The published theme supplies every page, but a freshly provisioned store (or
 * a store whose theme is not active yet) can return `409 theme_not_active`.
 * These defaults keep the storefront usable instead of rendering a blank page.
 * They use the same section types and setting keys as the live theme schema.
 */
function section(id: string, type: string, settings: ThemeSection['settings'], blocks: ThemeSection['blocks'] = []): ThemeSection {
  return { id, type, settings, blocks }
}

export function defaultHeader(): ThemeSection {
  return section('default-header', 'header', {
    label: { ar: 'متجري', en: 'My store' },
    sticky: true,
  }, [
    { id: 'default-header-links', type: 'link', settings: { label: { ar: 'الرئيسية', en: 'Home' }, url: '/' } },
    { id: 'default-header-products', type: 'link', settings: { label: { ar: 'المنتجات', en: 'Products' }, url: '/products' } },
    { id: 'default-header-cart', type: 'link', settings: { label: { ar: 'السلة', en: 'Cart' }, url: '/cart' } },
    { id: 'default-header-account', type: 'link', settings: { label: { ar: 'حسابي', en: 'Account' }, url: '/account' } },
  ])
}

export function defaultFooter(): ThemeSection {
  return section('default-footer', 'footer', {
    copyright: { ar: '© جميع الحقوق محفوظة', en: '© All rights reserved' },
  }, [
    { id: 'default-footer-products', type: 'link', settings: { label: { ar: 'المنتجات', en: 'Products' }, url: '/products' } },
    { id: 'default-footer-account', type: 'link', settings: { label: { ar: 'حسابي', en: 'Account' }, url: '/account' } },
  ])
}

function homeSections(): ThemeSection[] {
  return [
    section('default-home-hero', 'hero', {
      heading: { ar: 'اكتشف ما يناسبك', en: 'Find what fits you' },
      subheading: { ar: 'تجربة متجر بسيطة وجميلة، مصممة لتناسب أسلوبك.', en: 'A simple, beautiful shopping experience built around you.' },
      height: 'md',
    }, [
      { id: 'default-home-hero-cta', type: 'button', settings: { label: { ar: 'تسوق الآن', en: 'Shop now' }, url: '/products' } },
    ]),
    section('default-home-products', 'product_grid', {
      heading: { ar: 'منتجات مميزة', en: 'Featured products' },
      columns: 3,
      count: 6,
    }),
    section('default-home-testimonials', 'testimonials', {
      heading: { ar: 'ماذا يقول عملاؤنا', en: 'What our customers say' },
    }, [
      { id: 'default-home-testimonial-1', type: 'testimonial', settings: { quote: { ar: 'تجربة سلسة ومنتجات رائعة.', en: 'A smooth experience and great products.' }, author: { ar: 'عميل سعيد', en: 'Happy customer' } } },
      { id: 'default-home-testimonial-2', type: 'testimonial', settings: { quote: { ar: 'الدفع سهل والتوصيل سريع.', en: 'Easy checkout and fast delivery.' }, author: { ar: 'عميل دائم', en: 'Returning customer' } } },
      { id: 'default-home-testimonial-3', type: 'testimonial', settings: { quote: { ar: 'أنصح الجميع بالتجربة.', en: 'I recommend it to everyone.' }, author: { ar: 'مشترية جديدة', en: 'New shopper' } } },
    ]),
    section('default-home-faq', 'faq', {
      heading: { ar: 'الأسئلة الشائعة', en: 'Frequently asked questions' },
    }, [
      { id: 'default-home-faq-1', type: 'item', settings: { question: { ar: 'كيف أستلم منتجي؟', en: 'How do I receive my product?' }, answer: { ar: 'ستصلك تفاصيل الوصول مباشرة بعد تأكيد الطلب.', en: 'Access details arrive right after your order is confirmed.' } } },
      { id: 'default-home-faq-2', type: 'item', settings: { question: { ar: 'ما طرق الدفع المتاحة؟', en: 'Which payment methods are available?' }, answer: { ar: 'يمكنك الدفع بالبطاقة أو المحفظة أو عند الاستلام.', en: 'You can pay by card, wallet, or cash on delivery.' } } },
    ]),
  ]
}

function productListSections(): ThemeSection[] {
  return [
    section('default-list-hero', 'hero', {
      heading: { ar: 'كل المنتجات', en: 'All products' },
      subheading: { ar: 'تصفح المجموعة كاملة واختر ما يناسبك.', en: 'Browse the full collection and pick what you love.' },
      height: 'sm',
    }),
    section('default-list-products', 'product_grid', {
      heading: { ar: 'المنتجات', en: 'Products' },
      columns: 3,
      count: 12,
    }),
  ]
}

function productSections(): ThemeSection[] {
  return [section('default-product-detail', 'product_detail', {})]
}

function cartSections(): ThemeSection[] {
  return [section('default-cart-items', 'cart_items', {})]
}

function accountSections(): ThemeSection[] {
  return [section('default-account', 'account_dashboard', {})]
}

function notFoundSections(): ThemeSection[] {
  return [section('default-not-found', 'not_found_message', {})]
}

const defaultsByType: Record<string, () => ThemeSection[]> = {
  home: homeSections,
  product_list: productListSections,
  product: productSections,
  cart: cartSections,
  account: accountSections,
  '404': notFoundSections,
  not_found: notFoundSections,
}

export function defaultSections(type: string): ThemeSection[] {
  return (defaultsByType[type] ?? homeSections)()
}

/** A complete fallback page (header + content + footer) for a page type. */
export function defaultPage(type: string): StorefrontPage {
  return {
    id: `default-${type}`,
    type,
    sections: [defaultHeader(), ...defaultSections(type), defaultFooter()],
  }
}
