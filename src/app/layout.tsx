import type { Metadata, Viewport } from 'next'
import { Zen_Kaku_Gothic_New, JetBrains_Mono } from 'next/font/google'
import { NavBar } from '@/components/layout/NavBar'
import { Toaster } from '@/components/ui/sonner'
import { I18nProvider } from '@/lib/i18n/context'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'
import './globals.css'

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'sutamap',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fbf8f1',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLocale()
  const dict = await getDictionary(lang)

  return (
    <html lang={lang}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=RocknRoll+One&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root { --font-display: 'RocknRoll One', 'Zen Kaku Gothic New', sans-serif; }
        `}</style>
      </head>
      <body className={`${zenKaku.variable} ${jetbrainsMono.variable} font-sans`}>
        <I18nProvider dict={dict} lang={lang}>
          {children}
          <NavBar />
          <Toaster position="top-center" />
        </I18nProvider>
      </body>
    </html>
  )
}
