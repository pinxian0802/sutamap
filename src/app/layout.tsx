import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { NavBar } from '@/components/layout/NavBar'
import { I18nProvider } from '@/lib/i18n/context'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'sutamap',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1a2e',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLocale()
  const dict = await getDictionary(lang)

  return (
    <html lang={lang}>
      <body className={`${geist.className} pb-16`}>
        <I18nProvider dict={dict} lang={lang}>
          {children}
          <NavBar />
        </I18nProvider>
      </body>
    </html>
  )
}
