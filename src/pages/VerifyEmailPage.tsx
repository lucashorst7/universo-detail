import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import './auth.css'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  useEffect(() => {
    inputsRef.current[0]?.focus()
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session && !email) {
          const sessionEmail = data.session.user.email ?? ''
          if (sessionEmail) {
            await supabase.rpc('mark_email_verified')
            await refreshProfile()
            navigate('/')
          }
        }
      } catch { /* best-effort */ }
    })()
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  function handleChange(idx: number, val: string) {
    const clean = val.replace(/\D/g, '')
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('')
      const next = ['', '', '', '', '', '']
      chars.forEach((c, i) => { next[i] = c })
      setDigits(next)
      inputsRef.current[Math.min(chars.length, 5)]?.focus()
      return
    }
    const next = [...digits]
    next[idx] = clean
    setDigits(next)
    if (clean && idx < 5) inputsRef.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = ['', '', '', '', '', '']
    text.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    inputsRef.current[Math.min(text.length, 5)]?.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const code = digits.join('')
    if (code.length !== 6) { setError('Digite o código de 6 dígitos.'); return }
    setLoading(true)
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    if (verifyError) {
      setError(verifyError.message)
      setLoading(false)
      return
    }
    try {
      await supabase.rpc('mark_email_verified')
      await refreshProfile()
    } catch { /* profile refresh best-effort */ }
    setSuccess('E-mail verificado com sucesso!')
    setLoading(false)
    setTimeout(() => navigate('/'), 1500)
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError('')
    setResendCooldown(60)
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email })
    if (resendError) { setError(resendError.message); setResendCooldown(0); return }
    setSuccess('Novo código enviado para seu e-mail.')
    setTimeout(() => setSuccess(''), 4000)
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Verifique seu e-mail</h1>
        <p className="auth-sub">Enviamos um código de 6 dígitos para <strong style={{ color: 'var(--color-text)' }}>{email || 'seu e-mail'}</strong></p>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <div className="auth-otp-grid" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              required
            />
          ))}
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </button>
        <p className="auth-hint">
          Não recebeu?{' '}
          <button type="button" className="auth-resend" onClick={handleResend} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar código'}
          </button>
        </p>
        <p className="auth-link"><Link to="/login">Voltar para login</Link></p>
      </form>
    </div>
  )
}
