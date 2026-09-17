import { createFileRoute } from '@tanstack/react-router'
import { AdminCourses } from '@/components/admin-content'

export const Route = createFileRoute('/admin/courses')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Cursos — Admin REALPOLITICS' },
      { name: 'description', content: 'Crea y publica tus propios cursos en REALPOLITICS.' },
      { property: 'og:title', content: 'Cursos — Admin REALPOLITICS' },
      { property: 'og:description', content: 'Crea y publica tus propios cursos.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: AdminCourses,
})
