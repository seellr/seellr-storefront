import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from "./lib/i18n/routing";

const intlMiddleware = createMiddleware(routing)

export default function proxy(request: NextRequest) {
    const response = intlMiddleware(request)
    if (response.headers.get('location')) return response
    const pathname = request.nextUrl.pathname
    const protectedRoute = /^\/(?:ar|en)\/(account|orders|library|funnel|checkout)(?:\/|$)/.test(pathname)
    const authPage = /^\/(?:ar|en)\/(login|register)(?:\/|$)/.test(pathname)
    const loggedIn = Boolean(request.cookies.get('customer_token')?.value)
    if ((protectedRoute && !loggedIn) || (authPage && loggedIn)) {
        const locale = pathname.split('/')[1] || routing.defaultLocale
        const destination = protectedRoute ? `/${locale}/login?next=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}` : `/${locale}/account`
        return NextResponse.redirect(new URL(destination, request.url))
    }
    return response
}

export const config = {
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
