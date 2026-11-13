import Link from 'next/link'

export default function LocaleNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">الصفحة غير موجودة · Page not found</h1>
      <p className="mt-4 text-muted-foreground">تعذر العثور على الصفحة المطلوبة. · The page you requested could not be found.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/ar" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">الرئيسية · Home</Link>
        <Link href="/ar/products" className="rounded-full border px-6 py-3 text-sm font-semibold">المنتجات · Products</Link>
      </div>
    </main>
  )
}
