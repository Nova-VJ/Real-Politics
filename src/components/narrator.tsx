import { useCallback, useEffect, useRef, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Loader2, Pause, Play, Volume2 } from 'lucide-react'
import { narrate } from '@/lib/ai.functions'
import { Button } from './ui/button'

export type VoiceId = 'femenina' | 'masculina' | 'epica'
export type ToneId = 'narrativo' | 'didactico' | 'epico'

const cache = new Map<string, string>()

export function Narrator({ text, tone = 'narrativo', autoKey }: { text: string; tone?: ToneId; autoKey?: string }) {
  const speak = useServerFn(narrate)
  const [voice, setVoice] = useState<VoiceId>('femenina')
  const [speed, setSpeed] = useState(1)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const a = audioRef.current
    return () => { a?.pause() }
  }, [autoKey])

  useEffect(() => { setPlaying(false); audioRef.current?.pause() }, [text])

  const play = useCallback(async () => {
    if (playing) { audioRef.current?.pause(); setPlaying(false); return }
    setError(null)
    const key = `${voice}|${tone}|${text}`
    try {
      let src = cache.get(key)
      if (!src) {
        setLoading(true)
        const res = await speak({ data: { text, voice, tone, speed } })
        src = `data:${res.mime};base64,${res.audio}`
        cache.set(key, src)
      }
      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      if (audio.src !== src) audio.src = src
      audio.playbackRate = speed
      audio.onended = () => setPlaying(false)
      await audio.play()
      setPlaying(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo reproducir la narración')
    } finally {
      setLoading(false)
    }
  }, [playing, speak, speed, text, tone, voice])

  return (
    <div className="rounded-lg border border-border bg-surface/70 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={() => void play()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {loading ? 'Preparando voz…' : playing ? 'Pausar narración' : 'Escuchar narración'}
        </Button>
        <Volume2 className="size-4 text-muted-foreground" />
        <select
          aria-label="Voz"
          value={voice}
          onChange={(e) => { setVoice(e.target.value as VoiceId); setPlaying(false); audioRef.current?.pause() }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="femenina">Voz femenina</option>
          <option value="masculina">Voz masculina</option>
          <option value="epica">Voz grave / épica</option>
        </select>
        <select
          aria-label="Velocidad"
          value={speed}
          onChange={(e) => { const v = Number(e.target.value); setSpeed(v); if (audioRef.current) audioRef.current.playbackRate = v }}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value={0.9}>0.9x</option>
          <option value={1}>1x</option>
          <option value={1.15}>1.15x</option>
        </select>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  )
}
