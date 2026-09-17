import { createFileRoute } from '@tanstack/react-router'
import { AdminLessons } from '@/components/admin-content'

export const Route = createFileRoute('/admin/lessons')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Lecciones — Admin REALPOLITICS' },
      { name: 'description', content: 'Crea, edita y publica lecciones en REALPOLITICS.' },
      { property: 'og:title', content: 'Lecciones — Admin REALPOLITICS' },
      { property: 'og:description', content: 'Crea, edita y publica lecciones.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: AdminLessons,
})
