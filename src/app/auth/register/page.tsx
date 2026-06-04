import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'

export default async function RegisterPage() {
  const dict = await getDictionary(await getLocale())

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{dict.auth.signUpTitle}</CardTitle>
          <CardDescription>{dict.auth.signUpSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <p className="text-sm text-center text-gray-500">
            {dict.auth.hasAccount}{' '}
            <Link href="/auth/login" className="text-blue-600 underline">
              {dict.auth.login}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
