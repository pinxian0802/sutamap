import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>sutamap へようこそ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-sm text-center text-gray-500">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/register" className="text-blue-600 underline">
              新規登録
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
