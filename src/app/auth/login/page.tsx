import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'

export default async function LoginPage() {
  const dict = await getDictionary(await getLocale())

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{dict.auth.loginTitle}</CardTitle>
          <CardDescription>{dict.auth.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-sm text-center text-gray-500">
            {dict.auth.noAccount}{' '}
            <Link href="/auth/register" className="text-blue-600 underline">
              {dict.auth.signUp}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
