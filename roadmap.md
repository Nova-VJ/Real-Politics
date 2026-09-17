# REALPOLITICS build roadmap

- [x] Foundation: tokens, typography, brand, shared shell, responsive navigation
- [x] Data/state: typed mock content, English/Spanish UI, local persistence
- [x] Core routes: landing, home, explore, paths, course, profile, library
- [x] Flagship lesson: Robinson interactions, quiz, XP, achievement
- [x] Exploration: Knowledge Map, timeline, concepts, global search
- [x] Admin prototype and editor
- [x] Route metadata, accessibility, responsive QA, runtime verification

## Fase 2 (hecha)
- Cuentas reales: correo + Google, roles estudiante/admin, perfiles y niveles por materia
- Narración con voz neuronal (voz, tono, velocidad)
- Historia animada de Robinson en 10 escenas con decisiones, gráficos y conceptos
- Tutor IA flotante en toda la app

## Pendiente
- Animar el resto de lecciones y extender la biblioteca gráfica
- Contenido del panel de administración conectado a la base de datos

## Sprint backend admin (completado)
- Tablas `courses` y `lessons` con RLS: lectura pública de lo publicado, escritura solo admins.
- Panel /admin real: alta de usuarios, roles admin/estudiante, creación y publicación de cursos y lecciones.
- Tutor IA con modelo openai/gpt-6-astra (streaming) y logo propio.
