import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/env'

const intlMiddleware = createIntlMiddleware(routing)

const ADMIN_ROUTES = ['/admin']

function isAdminPath(pathname: string) {
	return ADMIN_ROUTES.some((route) => pathname.startsWith(route))
}

function matchLocalizedAuthRoute(pathname: string) {
	// Accept /login or /<locale>/login
	const parts = pathname.split('/').filter(Boolean)
	if (parts.length === 1 && parts[0] === 'login') return true
	if (parts.length === 2 && routing.locales.includes(parts[0] as 'sv' | 'en') && parts[1] === 'login') {
		return true
	}
	return false
}

async function refreshSupabaseSession(
	request: NextRequest,
	response: NextResponse,
) {
	const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => {
					request.cookies.set(name, value)
				})
				cookiesToSet.forEach(({ name, value, options }) => {
					response.cookies.set(name, value, options)
				})
			},
		},
	})

	const {
		data: { user },
	} = await supabase.auth.getUser()

	return user
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Admin routes: Supabase session + role guard, no i18n routing
	if (isAdminPath(pathname)) {
		const response = NextResponse.next({ request })
		const user = await refreshSupabaseSession(request, response)

		if (!user) {
			const loginUrl = new URL('/login', request.url)
			loginUrl.searchParams.set('redirect', pathname)
			return NextResponse.redirect(loginUrl)
		}

		const role = (user.app_metadata?.role as string) ?? 'customer'
		if (role !== 'admin') {
			return NextResponse.redirect(new URL('/', request.url))
		}

		response.headers.set('x-pathname', pathname)
		return response
	}

	// Everything else: run next-intl first (may redirect/rewrite)
	const intlResponse = intlMiddleware(request)

	// If next-intl responded with a redirect, return it directly
	if (intlResponse.headers.get('location')) {
		return intlResponse
	}

	// Otherwise attach Supabase session refresh and merge cookies on intl response
	const user = await refreshSupabaseSession(request, intlResponse)

	// Logged-in users hitting /login bounce away
	if (matchLocalizedAuthRoute(pathname) && user) {
		const role = (user.app_metadata?.role as string) ?? 'customer'
		const target = role === 'admin' ? '/admin' : '/'
		return NextResponse.redirect(new URL(target, request.url))
	}

	intlResponse.headers.set('x-pathname', pathname)
	return intlResponse
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|_vercel|favicon\\.ico|sitemap\\.xml|robots\\.txt|api/webhooks/|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
	],
}
