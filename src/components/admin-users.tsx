import { useCallback, useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react'
import { createUser, listUsers, setUserRole, type AdminUser } from '@/lib/admin.functions'
import { AdminShell } from './admin-shell'
import { Button } from './ui/button'

export function AdminUsers() {
  const list = useServerFn(listUsers)
  const setRole = useServerFn(setUserRole)
  const create = useServerFn(createUser)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '', displayName: '', admin: true })
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await list({ data: undefined }))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }, [list])

  useEffect(() => { void reload() }, [reload])

  const toggleAdmin = async (u: AdminUser) => {
    await setRole({ data: { userId: u.id, role: 'admin', enabled: !u.roles.includes('admin') } })
    await reload()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await create({ data: { email: form.email, password: form.password, displayName: form.displayName || undefined, admin: form.admin } })
      setForm({ email: '', password: '', displayName: '', admin: true })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell>
      <p className="eyebrow">Administración</p>
      <h1 className="mt-2 font-serif text-4xl">Usuarios</h1>

      <form onSubmit={submit} className="mt-8 grid gap-3 rounded-lg border border-border bg-surface p-5 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input required type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        <input required type="password" minLength={8} placeholder="Contraseña (mín. 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        <input placeholder="Nombre visible" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
        <Button type="submit" disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}Crear</Button>
        <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-4">
          <input type="checkbox" checked={form.admin} onChange={(e) => setForm({ ...form, admin: e.target.checked })} /> Crear con rol de administrador
        </label>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {loading ? (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando usuarios…</p>
      ) : (
        <div className="mt-8 divide-y divide-border border-y border-border">
          {users.map((u) => (
            <div key={u.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div>
                <b>{u.display_name ?? u.email}</b>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className={`size-4 ${u.roles.includes('admin') ? 'text-primary' : 'text-muted-foreground'}`} />
                {u.roles.includes('admin') ? 'Administrador' : 'Estudiante'}
              </span>
              <Button size="sm" variant="secondary" onClick={() => void toggleAdmin(u)}>
                {u.roles.includes('admin') ? 'Quitar admin' : 'Hacer admin'}
              </Button>
            </div>
          ))}
          {users.length === 0 && <p className="py-6 text-muted-foreground">Todavía no hay usuarios.</p>}
        </div>
      )}
    </AdminShell>
  )
}
