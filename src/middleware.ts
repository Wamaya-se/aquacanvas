import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/login']

export async function middleware(request: NextRequest) {
	const { user, supabaseResponse } = await updateSession(request)
	const { pathname } = request.nextUrl

	const isAdminRoute = ADMIN_ROUTES.some((route) =>
		pathname.startsWith(route),
	)
	const isAuthRoute = AUTH_ROUTES.some((route) =>
		pathname.startsWith(route),
	)

	if (isAdminRoute && !user) {
		const loginUrl = new URL('/login', request.url)
		loginUrl.searchParams.set('redirect', pathname)
		return NextResponse.redirect(loginUrl)
	}

	if (isAdminRoute && user) {
		const role = (user.app_metadata?.role as string) ?? 'customer'
		if (role !== 'admin') {
			return NextResponse.redirect(new URL('/', request.url))
		}
	}

	if (isAuthRoute && user) {
		const role = (user.app_metadata?.role as string) ?? 'customer'
		const redirect = role === 'admin' ? '/admin' : '/'
		return NextResponse.redirect(new URL(redirect, request.url))
	}

	return supabaseResponse
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|api/webhooks/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
