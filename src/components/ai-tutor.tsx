import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Loader2, Send, X } from 'lucide-react'
import { askTutor } from '@/lib/ai.functions'
import tutorAvatar from '@/assets/tutor-avatar.png.asset.json'
import { Button } from './ui/button'

type Msg = { role: 'user' | 'assistant'; content: string }

const starters = ['¿Qué es el coste de oportunidad?', '¿Por qué el oro vale menos en la isla?', 'Explícame la utilidad marginal con un ejemplo']

export function AiTutor({ context }: { context?: string }) {
  const ask = useServerFn(askTutor)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (question: string) => {
    if (!question.trim() || loading) return
    setInput('')
    setError(null)
    const history = messages.slice(-8)
    setMessages((m) => [...m, { role: 'user', content: question }])
    setLoading(true)
    try {
      const res = await ask({ data: { question, context, history } })
      setMessages((m) => [...m, { role: 'assistant', content: res.answer }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'El tutor no está disponible ahora mismo.')
    } finally {
      setLoading(false)
    }
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir tutor de IA"
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full border border-primary/50 bg-popover px-4 py-3 text-sm shadow-lg md:bottom-6"
      >
        <Sparkles className="size-4 text-primary" /> Tutor IA
      </button>
    )

  return (
    <div className="fixed bottom-20 right-4 z-40 flex h-[32rem] w-[min(94vw,24rem)] flex-col rounded-xl border border-border bg-popover shadow-2xl md:bottom-6">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="size-4 text-primary" /> Tutor REALPOLITICS</span>
        <Button variant="ghost" size="icon" aria-label="Cerrar tutor" onClick={() => setOpen(false)}><X className="size-4" /></Button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground">Pregúntame cualquier duda de la lección. Respondo con ejemplos concretos.</p>
            {starters.map((s) => (
              <button key={s} onClick={() => void send(s)} className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-left hover:bg-surface-elevated">{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-lg bg-primary/15 px-3 py-2' : 'max-w-[90%] whitespace-pre-line rounded-lg border border-border bg-surface px-3 py-2 leading-6'}>
            {m.content}
          </div>
        ))}
        {loading && <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Pensando…</p>}
        {error && <p className="text-destructive">{error}</p>}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); void send(input) }}
        className="flex gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          aria-label="Pregunta para el tutor"
          className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <Button size="icon" type="submit" disabled={loading} aria-label="Enviar"><Send className="size-4" /></Button>
      </form>
    </div>
  )
}
