import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { areas } from '@/data/areas'
import { AdminShell } from './admin-shell'
import { Button } from './ui/button'

export type Course = { id: string; slug: string; title: string; description: string | null; area: string; subarea: string | null; level: string; published: boolean }
export type Lesson = { id: string; course_id: string | null; slug: string; title: string; summary: string | null; content: unknown; duration_minutes: number; position: number; published: boolean }

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
const levels = ['principiante', 'intermedio', 'avanzado']

const input = 'h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary'

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', area: 'economia', subarea: '', level: 'principiante' })

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error: e } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (e) setError(e.message)
    setCourses((data ?? []) as Course[])
    setLoading(false)
  }, [])

  useEffect(() => { void reload() }, [reload])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { data: userData } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('courses').insert({
      title: form.title,
      slug: slugify(form.title) || `curso-${Date.now()}`,
      description: form.description || null,
      area: form.area,
      subarea: form.subarea || null,
      level: form.level,
      created_by: userData.user?.id ?? null,
    })
    if (err) return setError(err.message)
    setForm({ title: '', description: '', area: 'economia', subarea: '', level: 'principiante' })
    await reload()
  }

  const togglePublish = async (c: Course) => {
    await supabase.from('courses').update({ published: !c.published }).eq('id', c.id)
    await reload()
  }

  const remove = async (c: Course) => {
    await supabase.from('courses').delete().eq('id', c.id)
    await reload()
  }

  const subareas = areas.find((a) => a.slug === form.area)?.subareas ?? []

  return (
    <AdminShell>
      <p className="eyebrow">Administración</p>
      <h1 className="mt-2 font-serif text-4xl">Cursos</h1>

      <form onSubmit={create} className="mt-8 grid gap-3 rounded-lg border border-border bg-surface p-5 md:grid-cols-2">
        <input required placeholder="Título del curso" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
        <input placeholder="Descripción breve" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
        <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value, subarea: '' })} className={input}>
          {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
        <select value={form.subarea} onChange={(e) => setForm({ ...form, subarea: e.target.value })} className={input}>
          <option value="">Sin subcategoría</option>
          {subareas.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={input}>
          {levels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <Button type="submit"><Plus className="size-4" />Crear curso</Button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>
      ) : (
        <div className="mt-8 divide-y divide-border border-y border-border">
          {courses.map((c) => (
            <div key={c.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
              <div>
                <b>{c.title}</b>
                <p className="text-sm text-muted-foreground">{c.area}{c.subarea ? ` · ${c.subarea}` : ''} · {c.level}</p>
              </div>
              <span className="text-sm text-muted-foreground">{c.published ? 'Publicado' : 'Borrador'}</span>
              <Button size="sm" variant="secondary" onClick={() => void togglePublish(c)}>{c.published ? 'Despublicar' : 'Publicar'}</Button>
              <Button size="sm" variant="ghost" aria-label="Borrar curso" onClick={() => void remove(c)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
          {courses.length === 0 && <p className="py-6 text-muted-foreground">Aún no has creado cursos.</p>}
        </div>
      )}
    </AdminShell>
  )
}

export function AdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', summary: '', courseId: '', duration: 10, body: '' })

  const reload = useCallback(async () => {
    setLoading(true)
    const [l, c] = await Promise.all([
      supabase.from('lessons').select('*').order('position'),
      supabase.from('courses').select('*').order('title'),
    ])
    if (l.error) setError(l.error.message)
    setLessons((l.data ?? []) as Lesson[])
    setCourses((c.data ?? []) as Course[])
    setLoading(false)
  }, [])

  useEffect(() => { void reload() }, [reload])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { data: userData } = await supabase.auth.getUser()
    const blocks = form.body.split(/\n{2,}/).filter(Boolean).map((text) => ({ type: 'text', text }))
    const { error: err } = await supabase.from('lessons').insert({
      title: form.title,
      slug: slugify(form.title) || `leccion-${Date.now()}`,
      summary: form.summary || null,
      course_id: form.courseId || null,
      duration_minutes: form.duration,
      position: lessons.length,
      content: blocks,
      created_by: userData.user?.id ?? null,
    })
    if (err) return setError(err.message)
    setForm({ title: '', summary: '', courseId: '', duration: 10, body: '' })
    await reload()
  }

  const togglePublish = async (l: Lesson) => {
    await supabase.from('lessons').update({ published: !l.published }).eq('id', l.id)
    await reload()
  }

  const remove = async (l: Lesson) => {
    await supabase.from('lessons').delete().eq('id', l.id)
    await reload()
  }

  return (
    <AdminShell>
      <p className="eyebrow">Administración</p>
      <h1 className="mt-2 font-serif text-4xl">Lecciones</h1>

      <form onSubmit={create} className="mt-8 grid gap-3 rounded-lg border border-border bg-surface p-5 md:grid-cols-2">
        <input required placeholder="Título de la lección" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
        <input placeholder="Resumen" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={input} />
        <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={input}>
          <option value="">Sin curso</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input type="number" min={1} max={180} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className={input} aria-label="Duración en minutos" />
        <textarea placeholder="Contenido de la lección. Separa los bloques con una línea en blanco." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="min-h-40 rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary md:col-span-2" />
        <Button type="submit"><Plus className="size-4" />Crear lección</Button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>
      ) : (
        <div className="mt-8 divide-y divide-border border-y border-border">
          {lessons.map((l) => (
            <div key={l.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
              <div>
                <b>{l.title}</b>
                <p className="text-sm text-muted-foreground">{courses.find((c) => c.id === l.course_id)?.title ?? 'Sin curso'} · {l.duration_minutes} min</p>
              </div>
              <span className="text-sm text-muted-foreground">{l.published ? 'Publicada' : 'Borrador'}</span>
              <Button size="sm" variant="secondary" onClick={() => void togglePublish(l)}>{l.published ? 'Despublicar' : 'Publicar'}</Button>
              <Button size="sm" variant="ghost" aria-label="Borrar lección" onClick={() => void remove(l)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
          {lessons.length === 0 && <p className="py-6 text-muted-foreground">Aún no has creado lecciones.</p>}
        </div>
      )}
    </AdminShell>
  )
}
