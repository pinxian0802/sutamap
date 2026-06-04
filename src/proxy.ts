import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from '@/lib/i18n/config'

function getLocale(request: NextRequest): string {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && locales.includes(cookie as any)) return cookie

  const accept = request.headers.get('accept-language') ?? ''
  for (const locale of locales) {
    if (accept.includes(locale)) return locale
  }

  return defaultLocale
}

export async function proxy(request: NextRequest) {
  const locale = getLocale(request)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  if (!request.cookies.get('NEXT_LOCALE')?.value) {
    supabaseResponse.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 31536000,
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
