import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/features/auth'
import { areas, levelLabels } from '@/data/areas'
import { Button } from './ui/button'

type LevelRow = { area: string; subarea: string | null; level: number }

export function AccountPanel() {
  const { user, profile, roles, isAdmin, setRole, signOut, loading } = useAuth()
  const [levels, setLevels] = useState<LevelRow[]>([])

  useEffect(() => {
    if (!user) return
    void supabase.from('knowledge_levels').select('area,subarea,level').eq('user_id', user.id).then(({ data }) => setLevels((data ?? []) as LevelRow[]))
  }, [user])

  if (loading) return null

  if (!user)
    return (
      <div className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl">Crea tu cuenta real</h2>
          <p className="mt-2 text-sm text-muted-foreground">Guarda tu progreso, tus niveles por materia y tus logros. Puedes entrar con correo o con Google.</p>
          <div className="mt-4 flex gap-2">
            <Button asChild><Link to="/signup">Crear cuenta</Link></Button>
            <Button variant="secondary" asChild><Link to="/login">Iniciar sesión</Link></Button>
          </div>
        </div>
      </div>
    )

  const levelFor = (area: string, subarea: string) => levels.find((l) => l.area === area && l.subarea === subarea)?.level ?? 0

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="eyebrow">Tu cuenta</p>
        <h2 className="mt-2 font-serif text-3xl">{profile?.display_name ?? user.email}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm"><GraduationCap className="size-4 text-primary" /> Estudiante {roles.includes('student') ? '· activo' : ''}</span>
          <span className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm"><ShieldCheck className={`size-4 ${isAdmin ? 'text-primary' : 'text-muted-foreground'}`} /> Administrador {isAdmin ? '· activo' : '· inactivo'}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void setRole('admin', !isAdmin)}>
            {isAdmin ? 'Quitar perfil de administrador' : 'Activar perfil de administrador'}
          </Button>
          {isAdmin && <Button asChild><Link to="/admin">Abrir panel de administración</Link></Button>}
          <Button variant="ghost" onClick={() => void signOut()}>Cerrar sesión</Button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <h3 className="font-serif text-2xl">Tus niveles de conocimiento</h3>
        {areas.map((a) => (
          <div key={a.slug} className="rounded-lg border border-border bg-surface p-5">
            <b className="font-serif text-xl">{a.name}</b>
            <div className="mt-4 space-y-3">
              {a.subareas.map((s) => {
                const lvl = levelFor(a.slug, s.slug)
                return (
                  <div key={s.slug}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">{s.name}</span>
                      <b>{lvl ? levelLabels[Math.min(lvl - 1, levelLabels.length - 1)] : 'Sin evaluar'}</b>
                    </div>
                    <div className="h-2 rounded-sm bg-muted"><div className="h-full rounded-sm bg-primary" style={{ width: `${(lvl / 5) * 100}%` }} /></div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
