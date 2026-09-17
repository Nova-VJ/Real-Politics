import { createFileRoute } from '@tanstack/react-router'
import { AdminLessons } from '@/components/admin-content'

export const Route = createFileRoute('/admin/lessons/new')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Nueva lección — Admin REALPOLITICS' },
      { name: 'description', content: 'Crea una lección nueva para tus cursos de REALPOLITICS.' },
      { property: 'og:title', content: 'Nueva lección — Admin REALPOLITICS' },
      { property: 'og:description', content: 'Crea una lección nueva para tus cursos.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: AdminLessons,
})
