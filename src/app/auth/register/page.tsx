import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
          <CardDescription>アカウントを作成してスタンプラリーを始めよう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <p className="text-sm text-center text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/auth/login" className="text-blue-600 underline">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
