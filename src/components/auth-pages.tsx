import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Brand } from './brand'
import { Button } from './ui/button'
import { useAuth } from '@/features/auth'
import { supabase } from '@/integrations/supabase/client'
import { areas, levelLabels } from '@/data/areas'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const nav = useNavigate()
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const err = mode === 'login' ? await signIn(email, password) : await signUp(email, password, name)
    setBusy(false)
    if (err) { setError(err); return }
    if (mode === 'login') nav({ to: '/home' })
    else setSent(true)
  }

  const google = async () => {
    setBusy(true)
    setError(null)
    const err = await signInWithGoogle()
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10">
        <Brand />
        <div className="m-auto w-full max-w-md py-12">
          <p className="eyebrow">{mode === 'login' ? 'Bienvenido de nuevo' : 'Empieza tu recorrido'}</p>
          <h1 className="mt-3 font-serif text-4xl">{mode === 'login' ? 'Continúa entendiendo.' : 'Crea tu perfil de aprendizaje.'}</h1>

          {sent ? (
            <div className="mt-8 rounded-lg border border-primary/40 bg-primary/5 p-5 text-sm leading-6">
              Te hemos enviado un correo de confirmación a <b>{email}</b>. Ábrelo para activar tu cuenta y luego inicia sesión.
              <div className="mt-4"><Button asChild><Link to="/login">Ir a iniciar sesión</Link></Button></div>
            </div>
          ) : (
            <>
              <Button variant="secondary" className="mt-8 w-full" onClick={() => void google()} disabled={busy}>
                Continuar con Google
              </Button>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> o con tu correo <span className="h-px flex-1 bg-border" /></div>

              <form className="space-y-4" onSubmit={(e) => void submit(e)}>
                {mode === 'signup' && (
                  <label className="block text-sm">Nombre
                    <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 h-12 w-full rounded-md border border-border bg-surface px-3 outline-none focus:border-primary" placeholder="Alex Morgan" />
                  </label>
                )}
                <label className="block text-sm">Correo
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 h-12 w-full rounded-md border border-border bg-surface px-3 outline-none focus:border-primary" placeholder="alex@example.com" />
                </label>
                <label className="block text-sm">Contraseña
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-2 h-12 w-full rounded-md border border-border bg-surface px-3 outline-none focus:border-primary" placeholder="••••••••" />
                </label>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" type="submit" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" />}{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            {mode === 'login' ? '¿Nuevo por aquí? ' : '¿Ya aprendes con nosotros? '}
            <Link to={mode === 'login' ? '/signup' : '/login'} className="text-primary">{mode === 'login' ? 'Crea una cuenta' : 'Inicia sesión'}</Link>
          </p>
        </div>
      </div>
      <div className="hidden items-end bg-surface p-12 subtle-grid lg:flex">
        <blockquote className="max-w-xl font-serif text-4xl leading-tight">“El conocimiento no es una colección de datos aislados. Es un mapa de relaciones.”</blockquote>
      </div>
    </div>
  )
}

export function Onboarding() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState(false)
  const area = areas[step]!

  const save = async () => {
    setBusy(true)
    if (user) {
      const rows = Object.entries(levels).map(([key, level]) => {
        const [a, s] = key.split('::')
        return { user_id: user.id, area: a!, subarea: s!, level }
      })
      if (rows.length) await supabase.from('knowledge_levels').upsert(rows, { onConflict: 'user_id,area,subarea' })
    }
    setBusy(false)
    nav({ to: '/home' })
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <Brand />
      <div className="mx-auto max-w-3xl py-16">
        <p className="eyebrow">Bienvenido · Paso {step + 1} de {areas.length}</p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">¿Qué nivel tienes en {area.name}?</h1>
        <p className="mt-3 text-muted-foreground">Elige tu nivel en cada subcategoría. Con esto construimos tu ruta personalizada.</p>
        <div className="mt-8 space-y-4">
          {area.subareas.map((s) => {
            const key = `${area.slug}::${s.slug}`
            return (
              <div key={s.slug} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-4">
                  <b className="text-sm">{s.name}</b>
                  <select
                    aria-label={`Nivel en ${s.name}`}
                    value={levels[key] ?? 0}
                    onChange={(e) => setLevels((l) => ({ ...l, [key]: Number(e.target.value) }))}
                    className="h-10 rounded-md border border-border bg-background px-2 text-sm"
                  >
                    <option value={0}>Sin evaluar</option>
                    {levelLabels.map((l, i) => <option key={l} value={i + 1}>{l}</option>)}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-9 flex gap-3">
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Atrás</Button>}
          {step < areas.length - 1
            ? <Button onClick={() => setStep(step + 1)}>Continuar</Button>
            : <Button disabled={busy} onClick={() => void save()}>{busy && <Loader2 className="size-4 animate-spin" />}Generar mi ruta</Button>}
        </div>
        {!user && <p className="mt-6 text-xs text-muted-foreground">Inicia sesión para guardar estos niveles en tu perfil.</p>}
      </div>
    </div>
  )
}
