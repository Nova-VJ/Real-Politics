import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ChevronLeft, Info, Lightbulb, TriangleAlert } from 'lucide-react'
import { robinsonScenes, type Scene } from '@/data/robinson-scenes'
import { Narrator } from './narrator'
import { Button } from './ui/button'

/* ---------- Ilustraciones animadas (SVG) ---------- */

function Sun({ still }: { still: boolean }) {
  return (
    <motion.circle
      cx="640" cy="90" r="34" fill="var(--primary)" opacity={0.9}
      animate={still ? {} : { r: [34, 38, 34], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
  )
}

function Waves({ still }: { still: boolean }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M0 ${300 + i * 16} Q 90 ${288 + i * 16} 180 ${300 + i * 16} T 360 ${300 + i * 16} T 540 ${300 + i * 16} T 720 ${300 + i * 16} T 900 ${300 + i * 16}`}
          stroke="var(--primary)" strokeOpacity={0.25 + i * 0.1} strokeWidth="3" fill="none"
          animate={still ? {} : { x: [0, -60, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </g>
  )
}

function Character({ x, label, color, still }: { x: number; label: string; color: string; still: boolean }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: still ? 0 : [0, -5, 0] }}
      transition={{ y: { duration: 3.2, repeat: Infinity }, opacity: { duration: 0.6 } }}
    >
      <circle cx={x} cy={318} r="16" fill={color} />
      <rect x={x - 13} y={336} width="26" height="46" rx="12" fill={color} opacity={0.85} />
      <rect x={x - 26} y={344} width="14" height="34" rx="7" fill={color} opacity={0.6} />
      <rect x={x + 12} y={344} width="14" height="34" rx="7" fill={color} opacity={0.6} />
      <text x={x} y={404} textAnchor="middle" fontSize="15" fill="currentColor" opacity={0.7}>{label}</text>
    </motion.g>
  )
}

function Palm({ x, still }: { x: number; still: boolean }) {
  return (
    <motion.g animate={still ? {} : { rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 6, repeat: Infinity }} style={{ originX: `${x}px`, originY: '380px' }}>
      <rect x={x - 5} y={250} width="10" height="130" rx="5" fill="var(--muted-foreground)" opacity={0.5} />
      {[-1, 1].map((d) => (
        <path key={d} d={`M${x} 252 q ${45 * d} -30 ${78 * d} -6 q ${-42 * d} -6 ${-78 * d} 22 Z`} fill="var(--economics, var(--primary))" opacity={0.55} />
      ))}
      <path d={`M${x} 248 q 8 -46 -6 -62 q 26 16 24 62 Z`} fill="var(--economics, var(--primary))" opacity={0.45} />
    </motion.g>
  )
}

function FloatingItem({ x, y, emoji, glow, still }: { x: number; y: number; emoji: string; glow?: boolean; still: boolean }) {
  return (
    <motion.g animate={still ? {} : { y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
      {glow && <circle cx={x} cy={y - 10} r="34" fill="var(--primary)" opacity={0.18} />}
      <text x={x} y={y} fontSize="42" textAnchor="middle">{emoji}</text>
    </motion.g>
  )
}

function Stage({ scene }: { scene: Scene }) {
  const reduce = useReducedMotion()
  const still = !!reduce
  const v = scene.visual
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface-elevated to-surface">
      <svg viewBox="0 0 900 440" className="h-auto w-full" role="img" aria-label={scene.title}>
        <rect width="900" height="440" fill="transparent" />
        <Sun still={still} />
        <rect y="300" width="900" height="140" fill="var(--muted)" opacity={0.35} />
        <Waves still={still} />
        <Palm x={120} still={still} />
        {v !== 'summary' && <Character x={v === 'friday' || v === 'trade' ? 380 : 450} label="Robinson" color="var(--primary)" still={still} />}
        {(v === 'friday' || v === 'trade') && <Character x={560} label="Viernes" color="var(--economics, var(--primary))" still={still} />}
        {v === 'choice' && (
          <>
            <FloatingItem x={300} y={250} emoji="💧" glow still={still} />
            <FloatingItem x={640} y={250} emoji="🪙" still={still} />
          </>
        )}
        {v === 'spring' && <FloatingItem x={680} y={250} emoji="⛲" glow still={still} />}
        {v === 'fishing' && (
          <>
            <FloatingItem x={300} y={250} emoji="🐟" still={still} />
            <FloatingItem x={660} y={250} emoji="🥥" still={still} />
          </>
        )}
        {v === 'tools' && <FloatingItem x={640} y={250} emoji="🛠️" glow still={still} />}
        {v === 'trade' && (
          <>
            <FloatingItem x={470} y={220} emoji="🐟" still={still} />
            <FloatingItem x={470} y={286} emoji="🥥" still={still} />
          </>
        )}
        {v === 'summary' && <FloatingItem x={450} y={250} emoji="🗺️" glow still={still} />}
      </svg>
      <span className="absolute left-4 top-4 rounded-sm bg-background/70 px-2 py-1 text-xs font-bold tracking-wide">{scene.kicker.toUpperCase()}</span>
    </div>
  )
}

/* ---------- Apoyos gráficos ---------- */

function Bars({ chart }: { chart: NonNullable<Scene['chart']> }) {
  return (
    <div className="mt-6 rounded-lg border border-border bg-surface p-5">
      <p className="text-sm font-semibold">{chart.title}</p>
      <div className="mt-4 space-y-3">
        {chart.bars.map((b, i) => (
          <div key={b.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{b.label}</span>
              <b>{b.value} {b.unit}</b>
            </div>
            <div className="h-3 overflow-hidden rounded-sm bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(b.value / b.max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Causal({ steps }: { steps: string[] }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <motion.span
          key={s}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.18 }}
          className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-sm"
        >
          {s}
          {i < steps.length - 1 && <ArrowRight className="size-3 text-primary" />}
        </motion.span>
      ))}
    </div>
  )
}

/* ---------- Motor de escenas ---------- */

export function RobinsonStory({ onFinish }: { onFinish?: () => void }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Record<string, string>>({})
  const scene = robinsonScenes[i]!
  const chosen = picked[scene.id]
  const chosenOption = scene.choice?.options.find((o) => o.id === chosen)
  const locked = !!scene.choice && !chosen

  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <div className="mb-5 flex items-center gap-1.5" aria-label={`Escena ${i + 1} de ${robinsonScenes.length}`}>
        {robinsonScenes.map((s, n) => (
          <span key={s.id} className={`h-1 flex-1 rounded-full ${n <= i ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <Stage scene={scene} />

      <AnimatePresence mode="wait">
        <motion.div key={scene.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <h2 className="mt-8 font-serif text-4xl leading-tight">{scene.title}</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{scene.narration}</p>

          <div className="mt-5">
            <Narrator text={scene.narration} tone={scene.visual === 'summary' ? 'didactico' : 'narrativo'} autoKey={scene.id} />
          </div>

          {scene.hotspots && (
            <div className="mt-6 flex flex-wrap gap-2">
              {scene.hotspots.map((h) => (
                <span key={h.label} tabIndex={0} title={h.tip} className="group relative cursor-help rounded-sm border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus-visible:border-primary">
                  <Info className="mr-1 inline size-3 text-primary" />{h.label}
                  <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-64 rounded-md border border-border bg-popover p-3 text-xs leading-5 shadow-lg group-hover:block group-focus:block">{h.tip}</span>
                </span>
              ))}
            </div>
          )}

          {scene.choice && (
            <div className="mt-8">
              <p className="eyebrow">Tu decisión</p>
              <h3 className="mt-2 font-serif text-2xl">{scene.choice.prompt}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {scene.choice.options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setPicked((p) => ({ ...p, [scene.id]: o.id }))}
                    className={`min-h-28 rounded-lg border p-4 text-left transition ${chosen === o.id ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:bg-surface-elevated'}`}
                  >
                    <b className="font-serif text-lg">{o.label}</b>
                    <span className="mt-2 block text-sm text-muted-foreground">{o.detail}</span>
                  </button>
                ))}
              </div>
              {chosenOption && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-6">
                  {chosenOption.feedback}
                </motion.p>
              )}
            </div>
          )}

          {scene.chart && <Bars chart={scene.chart} />}
          {scene.causal && <Causal steps={scene.causal} />}

          {scene.concept && (
            <div className="mt-8 border-l-2 border-primary bg-surface p-6">
              <p className="eyebrow flex items-center gap-2"><Lightbulb className="size-3" /> Concepto descubierto · +10 XP</p>
              <h3 className="mt-2 font-serif text-3xl">{scene.concept.term}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{scene.concept.text}</p>
            </div>
          )}

          {scene.mistake && (
            <p className="mt-5 flex gap-3 rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="size-4 shrink-0 text-primary" />{scene.mistake}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <Button variant="secondary" disabled={i === 0} onClick={() => setI((n) => Math.max(0, n - 1))}>
          <ChevronLeft className="size-4" /> Anterior
        </Button>
        {i < robinsonScenes.length - 1 ? (
          <Button disabled={locked} onClick={() => setI((n) => n + 1)}>
            {locked ? 'Elige una opción para seguir' : 'Siguiente escena'} <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => onFinish?.()}>Ir al examen de la lección <ArrowRight className="size-4" /></Button>
        )}
      </div>
    </section>
  )
}
