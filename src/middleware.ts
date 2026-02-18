import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Refresh Session Logic
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 2. Route Protection
    const url = request.nextUrl.clone()

    // Exclude static assets, images, API routes, and auth pages from redirect
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/static') ||
        url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/auth') ||
        url.pathname === '/' || // Allow landing page if it exists/is public
        url.pathname.includes('.') // common for files like favicon.ico
    ) {
        return response
    }

    // Redirect unauthenticated users to login
    if (!user) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
