'use client'

import Link from 'next/link'
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Logo } from '@/components/layout/Logo'
import { api } from '@/lib/api/client'
import { useRouter } from 'next/navigation'

function PasswordField({ name, label, placeholder = 'At least 8 characters', minLength = 8 }: { name: string; label: string; placeholder?: string; minLength?: number }) {
  const [visible, setVisible] = useState(false)
  return <label className="password-field">{label}<span className="input-with-action"><input name={name} type={visible ? 'text' : 'password'} placeholder={placeholder} minLength={minLength} required /><button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
}

export function AuthLayout({ mode, children }: { mode: 'login' | 'signup'; children: React.ReactNode }) {
  return <main className="auth-page"><div className="auth-art"><Logo light /><div><span className="eyebrow cream">Freshly prepared / Since 1998</span><h1>Good food.<br /><i>Good mood.</i></h1><p>Bold Pakistani flavor, made fresh for tables worth gathering around.</p><div className="auth-proof"><span>4.9/5</span><span>2k+ happy customers</span></div></div></div><section className="auth-panel"><div className="auth-mobile-logo"><Logo /></div><div className="auth-form-wrap"><span className="eyebrow">Bilal Broast account</span><h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p>{mode === 'login' ? 'Sign in to keep your favorite orders close.' : 'Save your details and order faster next time.'}</p>{children}</div></section></main>
}

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); setLoading(true); try { const user = await api.post<{ role?: string }>('/auth/login', { email: form.get('email'), password: form.get('password') }); setLoading(false); router.push(user.role === 'admin' ? '/dashboard' : '/menu') } catch (cause) { setLoading(false); setError(cause instanceof Error ? cause.message : 'Unable to log in. Please try again.') } }
  if (submitted) return <div className="auth-success"><span><Check size={22} /></span><h3>You&apos;re all set.</h3><p>Your account preview is ready. Backend authentication can be connected here later.</p><Link href="/menu" className="button button-primary full-button">Browse the menu <ArrowRight size={16} /></Link></div>
  return <form className="auth-form" onSubmit={submit}><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><PasswordField name="password" label="Password" placeholder="••••••••" minLength={6} /><div className="auth-options"><label className="checkbox-label"><input type="checkbox" /> Remember me</label><a href="#forgot">Forgot password?</a></div>{error && <p className="form-error">{error}</p>}<button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={16} /> Checking...</> : <>Log in <ArrowRight size={16} /></>}</button><p className="auth-switch">Don&apos;t have an account? <Link href="/signup">Sign up</Link></p></form>
}

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); if (form.get('password') !== form.get('confirmPassword')) { setError('Passwords do not match.'); return }; setError(''); setLoading(true); try { await api.post('/auth/register', { name: form.get('name'), email: form.get('email'), password: form.get('password'), phone: form.get('phone') }); router.push('/login') } catch (cause) { setLoading(false); setError(cause instanceof Error ? cause.message : 'Unable to create your account.') } }
  if (submitted) return <div className="auth-success"><span><Check size={22} /></span><h3>Welcome to the table.</h3><p>Your account preview is ready. You can connect signup and customer profiles to your API later.</p><Link href="/menu" className="button button-primary full-button">Start your order <ArrowRight size={16} /></Link></div>
  return <form className="auth-form" onSubmit={submit}><div className="form-grid"><label>Full name<input name="name" placeholder="Your full name" required /></label><label>Phone number<input name="phone" placeholder="+92 300 0000000" required /></label></div><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><div className="form-grid"><PasswordField name="password" label="Password" /><PasswordField name="confirmPassword" label="Confirm password" /></div><label className="checkbox-label"><input type="checkbox" required /><span>I agree to the terms and privacy policy.</span><Check size={15} /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={16} /> Creating...</> : <>Create account <ArrowRight size={16} /></>}</button><p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p></form>
}
