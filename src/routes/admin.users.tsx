import { createFileRoute } from '@tanstack/react-router'
import { AdminUsers } from '@/components/admin-users'

export const Route = createFileRoute('/admin/users')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Usuarios — Admin REALPOLITICS' },
      { name: 'description', content: 'Gestiona usuarios y permisos de administrador en REALPOLITICS.' },
      { property: 'og:title', content: 'Usuarios — Admin REALPOLITICS' },
      { property: 'og:description', content: 'Gestiona usuarios y permisos de administrador.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: AdminUsers,
})
