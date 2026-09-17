export type Area = { slug: string; name: string; nameEn: string; accent: string; subareas: { slug: string; name: string }[] }

export const areas: Area[] = [
  {
    slug: 'economia',
    name: 'Economía',
    nameEn: 'Economics',
    accent: 'var(--economics)',
    subareas: [
      { slug: 'microeconomia', name: 'Microeconomía' },
      { slug: 'macroeconomia', name: 'Macroeconomía' },
      { slug: 'mercados-financieros', name: 'Mercados financieros' },
      { slug: 'dinero-e-inflacion', name: 'Dinero e inflación' },
      { slug: 'historia-economica', name: 'Historia económica' },
    ],
  },
  {
    slug: 'politica',
    name: 'Política',
    nameEn: 'Politics',
    accent: 'var(--primary)',
    subareas: [
      { slug: 'filosofia-politica', name: 'Filosofía política' },
      { slug: 'instituciones', name: 'Instituciones y Estado' },
      { slug: 'sistemas-electorales', name: 'Sistemas electorales' },
      { slug: 'geopolitica', name: 'Geopolítica' },
      { slug: 'derecho-constitucional', name: 'Derecho constitucional' },
    ],
  },
  {
    slug: 'historia',
    name: 'Historia',
    nameEn: 'History',
    accent: 'var(--history, var(--primary))',
    subareas: [
      { slug: 'antigua', name: 'Mundo antiguo' },
      { slug: 'moderna', name: 'Edad moderna' },
      { slug: 'revoluciones', name: 'Revoluciones' },
      { slug: 'siglo-xx', name: 'Siglo XX' },
      { slug: 'historia-de-las-ideas', name: 'Historia de las ideas' },
    ],
  },
]

export const levelLabels = ['Principiante', 'Curioso', 'Intermedio', 'Avanzado', 'Experto']
