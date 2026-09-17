import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Brand } from './brand'
import { Button } from './ui/button'
import { useAuth } from '@/features/auth'
import { supabase } from '@/integrations/supabase/client'
import { areas, levelLabels } from '@/data/areas'

// ── Mapa de conocimiento animado para la pantalla de auth ─────────────────
const MAP_NODES = [
  { label: 'Economics',    x: 52, y: 18, r: 2.2 },
  { label: 'Democracy',    x: 75, y: 28, r: 1.6 },
  { label: 'Federal Reserve', x: 30, y: 32, r: 1.4 },
  { label: 'Power',        x: 60, y: 45, r: 1.8 },
  { label: 'History',      x: 20, y: 55, r: 1.6 },
  { label: 'Trade',        x: 45, y: 62, r: 1.5 },
  { label: 'Energy',       x: 72, y: 60, r: 1.4 },
  { label: 'Institutions', x: 35, y: 78, r: 1.3 },
  { label: 'Markets',      x: 62, y: 78, r: 1.4 },
  { label: 'Science',      x: 80, y: 42, r: 1.3 },
  { label: 'Law',          x: 18, y: 40, r: 1.2 },
  { label: 'Culture',      x: 50, y: 88, r: 1.2 },
]

const MAP_EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 3], [1, 9], [2, 4], [2, 10],
  [3, 5], [3, 6], [4, 7], [5, 7],
  [5, 8], [6, 8], [6, 9], [7, 11], [8, 11],
]

function KnowledgeMapDecoration() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % MAP_NODES.length), 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* Líneas de conexión */}
      {MAP_EDGES.map(([a, b], i) => {
        const na = MAP_NODES[a!]!
        const nb = MAP_NODES[b!]!
        const isActive = a === active || b === active
        return (
          <line
            key={i}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={isActive ? 0.35 : 0.2}
            strokeOpacity={isActive ? 0.9 : 0.5}
            style={{ transition: 'stroke 0.6s, stroke-width 0.6s, stroke-opacity 0.6s' }}
          />
        )
      })}

      {/* Nodos */}
      {MAP_NODES.map((n, i) => {
        const isActive = i === active
        return (
          <g key={n.label} transform={`translate(${n.x},${n.y})`}>
            <circle
              r={n.r + (isActive ? 0.8 : 0)}
              fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--surface))'}
              stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
              strokeWidth="0.4"
              style={{ transition: 'all 0.5s' }}
            />
            <text
              y={-n.r - 1.2}
              textAnchor="middle"
              fontSize="2.4"
              fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
              fontFamily="system-ui, sans-serif"
              style={{ transition: 'fill 0.5s' }}
            >
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Página de autenticación ────────────────────────────────────────────────
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
      {/* Columna izquierda — formulario */}
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

      {/* Columna derecha — mapa de conocimiento animado */}
      <div className="relative hidden overflow-hidden bg-surface subtle-grid lg:block">
        <KnowledgeMapDecoration />
        {/* Gradiente inferior con la cita */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface via-surface/80 to-transparent p-10 pt-24">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Everything connects</p>
          <blockquote className="mt-3 font-serif text-2xl leading-snug text-foreground">
            "El conocimiento no es una colección de datos aislados. Es un mapa de relaciones."
          </blockquote>
        </div>
      </div>
    </div>
  )
}

// ── Onboarding ────────────────────────────────────────────────────────────
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
