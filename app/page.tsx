import { PageRenderer } from '@/lib/theme/PageRenderer'
import type { StorefrontPage } from '@/lib/theme/types'

export default function Home() {
  const page: StorefrontPage = {
    id: 'home', type: 'home', sections: [
      { id: 'header', type: 'header', settings: { label: { ar: 'متجري', en: 'My store' } } },
      { id: 'announcement', type: 'announcement', settings: { message: { ar: 'شحن مجاني لفترة محدودة', en: 'Free shipping for a limited time' } } },
      { id: 'hero', type: 'hero', settings: { title: { ar: 'اكتشف ما يناسبك', en: 'Find what fits you' }, subtitle: { ar: 'تجربة متجر بسيطة وجميلة', en: 'A simple, beautiful shopping experience' } } },
      { id: 'products', type: 'product_grid', settings: { title: { ar: 'منتجات مميزة', en: 'Featured products' }, count: 3 } },
      { id: 'cta', type: 'cta', settings: { title: { ar: 'ابدأ الآن', en: 'Get started today' }, button_label: { ar: 'تسوق الآن', en: 'Shop now' } } },
      { id: 'footer', type: 'footer', settings: { label: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' } } },
    ],
  }
  return <PageRenderer page={page} locale="ar" />
}
