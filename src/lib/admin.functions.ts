import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

async function assertAdmin(supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> }, userId: string) {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
  if (data !== true) throw new Error('Necesitas perfil de administrador para hacer esto.')
}

export type AdminUser = { id: string; email: string; display_name: string | null; created_at: string; roles: string[] }

/** Lista todos los usuarios con sus roles (solo administradores). */
export const listUsers = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUser[]> => {
    await assertAdmin(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) throw new Error(error.message)
    const ids = list.users.map((u) => u.id)
    const [{ data: roles }, { data: profiles }] = await Promise.all([
      supabaseAdmin.from('user_roles').select('user_id,role').in('user_id', ids),
      supabaseAdmin.from('profiles').select('id,display_name').in('id', ids),
    ])
    return list.users.map((u) => ({
      id: u.id,
      email: u.email ?? '—',
      created_at: u.created_at,
      display_name: (profiles ?? []).find((p) => p.id === u.id)?.display_name ?? null,
      roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role as string),
    }))
  })

const RoleInput = z.object({ userId: z.string().uuid(), role: z.enum(['admin', 'student']), enabled: z.boolean() })

/** Concede o retira un rol a un usuario (solo administradores). */
export const setUserRole = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RoleInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    if (data.enabled) {
      const { error } = await supabaseAdmin.from('user_roles').upsert({ user_id: data.userId, role: data.role }, { onConflict: 'user_id,role' })
      if (error) throw new Error(error.message)
    } else {
      const { error } = await supabaseAdmin.from('user_roles').delete().eq('user_id', data.userId).eq('role', data.role)
      if (error) throw new Error(error.message)
    }
    return { ok: true }
  })

const CreateUserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(120).optional(),
  admin: z.boolean().default(false),
})

/** Crea un usuario nuevo, opcionalmente con rol de administrador. */
export const createUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateUserInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.displayName ?? data.email.split('@')[0] },
    })
    if (error) throw new Error(error.message)
    if (data.admin && created.user)
      await supabaseAdmin.from('user_roles').upsert({ user_id: created.user.id, role: 'admin' }, { onConflict: 'user_id,role' })
    return { id: created.user?.id ?? '' }
  })
