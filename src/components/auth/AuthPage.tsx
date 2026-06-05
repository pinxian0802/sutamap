'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, User, Lock } from 'lucide-react'
import { useDictionary } from '@/lib/i18n/context'

interface Props {
  initialMode: 'login' | 'signup'
}

export function AuthPage({ initialMode }: Props) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const dict = useDictionary()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      if (error) { setError(error.message); setLoading(false); return }
    }

    router.push('/map')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(170deg, #dde7e2 0%, #ebeee4 46%, #f1ecdf 100%)' }}
    >
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        <div className="text-center mb-[30px]">
          <div
            className="w-[74px] h-[74px] mx-auto mb-4 rounded-[21px] bg-green text-white grid place-items-center"
            style={{ boxShadow: '0 16px 30px -12px rgba(122,168,60,.85)' }}
          >
            <MapPin size={36} strokeWidth={2} />
          </div>
          <div className="text-[30px] font-bold tracking-[.02em]" style={{ fontFamily: 'var(--font-display)' }}>
            sutamap
          </div>
          <div className="text-[13.5px] text-sub mt-[7px] leading-relaxed">
            {dict.auth.heroLine1}<br />{dict.auth.heroLine2}
          </div>
        </div>

        <div className="flex bg-paper2 rounded-[13px] p-1 mb-[18px]">
          {[
            { id: 'login' as const, label: dict.auth.login },
            { id: 'signup' as const, label: dict.auth.signUp },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className="flex-1 py-[11px] rounded-[10px] border-none cursor-pointer text-[14px] font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                background: mode === opt.id ? 'var(--paper)' : 'transparent',
                color: mode === opt.id ? 'var(--ink)' : 'var(--sub)',
                boxShadow: mode === opt.id ? '0 2px 8px -3px rgba(45,74,107,.4)' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[11px] mb-[18px]">
          {mode === 'signup' && (
            <AuthField icon={<User size={18} className="text-sub" />} placeholder={dict.auth.username} value={username} onChange={setUsername} />
          )}
          <AuthField icon={<MapPin size={18} className="text-sub" />} placeholder={dict.auth.email} value={email} onChange={setEmail} type="email" />
          <AuthField icon={<Lock size={18} className="text-sub" />} placeholder={dict.auth.password} value={password} onChange={setPassword} type="password" />
        </form>

        {error && <p className="text-sm text-terra text-center mb-3">{error}</p>}

        <button className="sm-btn sm-btn-primary mb-[14px]" onClick={handleSubmit} disabled={loading}>
          {loading
            ? (mode === 'login' ? dict.auth.loggingIn : dict.auth.signingUp)
            : (mode === 'login' ? dict.auth.login : dict.auth.createAccount)}
        </button>

        <div className="flex items-center gap-3 text-faint text-[12px] my-1 mb-[14px]">
          <div className="flex-1 h-px bg-line" />
          {dict.auth.orDivider}
          <div className="flex-1 h-px bg-line" />
        </div>

        <button className="sm-btn sm-btn-ghost">
          <span className="font-extrabold text-[17px]">G</span> {dict.auth.googleLogin}
        </button>

        <div className="text-center text-[11.5px] text-faint mt-[22px] leading-relaxed">
          {dict.auth.terms}
        </div>
      </div>
    </div>
  )
}

function AuthField({ icon, placeholder, value, onChange, type = 'text' }: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div className="flex items-center gap-[11px] bg-paper border border-line rounded-[13px] py-[14px] px-[15px]">
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 border-none outline-none text-[14px] bg-transparent text-ink placeholder:text-sub"
        style={{ fontFamily: 'var(--font-sans)' }}
        required
      />
    </div>
  )
}
