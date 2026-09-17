# REALPOLITICS

**Understand the world. Think for yourself.**

REALPOLITICS es una plataforma educativa premium para aprender cómo funciona el mundo: economía, historia, gobierno, finanzas, geopolítica, ciencia, tecnología, derecho, filosofía, psicología, pensamiento crítico y habilidades para la vida.

No es un portal de noticias políticas ni un LMS escolar: es una combinación de plataforma de aprendizaje premium, enciclopedia interactiva, mapa de conocimiento tipo RPG, academia cívica y atlas histórico interactivo.

## Características

- **Home y dashboard personalizado** — continúa tu aprendizaje, racha diaria, XP, reto de conocimiento diario.
- **Explorar por categorías** — 12 áreas de conocimiento con subcategorías y niveles de progreso.
- **Knowledge Map** — mapa interactivo de conceptos conectados que se ilumina a medida que aprendes.
- **Timeline histórico** — línea de tiempo interactiva de eventos e ideas.
- **Lecciones inmersivas** — como *Robinson Crusoe y el nacimiento del pensamiento económico*: escenas animadas, decisiones interactivas, coste de oportunidad, especialización, comercio, quizzes y logros.
- **Tutor IA** — asistente integrado para preguntas reales de economía, historia y política.
- **Biblioteca** — artículos, conceptos y las 1000 Ideas Esenciales.
- **Challenges** — retos y quizzes con XP y logros.
- **Bilingüe** — interfaz en inglés y español.
- **Cuentas y perfiles** — registro con correo o Google, niveles de conocimiento por área, roles de estudiante y administrador.
- **Panel de administración** — gestión de usuarios y roles, creación y publicación de cursos y lecciones propias.

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19 + Vite
- Tailwind CSS v4
- Supabase (autenticación, base de datos, RLS)
- TypeScript estricto

## Desarrollo local

Requisitos: Node.js (vía [nvm](https://github.com/nvm-sh/nvm)) y Bun.

```sh
git clone <url-de-este-repositorio>
cd know-world-map
bun install
bun run dev
```

La app corre en `http://localhost:8080`.

### Scripts

```sh
bun run dev      # servidor de desarrollo
bun run build    # build de producción
```

## Estructura

```text
src/
  routes/        # rutas de la app (TanStack Router)
  components/    # componentes reutilizables (shell, escenas, tutor IA, admin)
  features/      # autenticación y lógica de dominio
  data/          # contenido demo y escenas de lecciones
  lib/           # funciones de servidor (IA, admin)
  integrations/  # clientes generados de Supabase
supabase/        # migraciones de base de datos
public/          # assets estáticos (favicon, etc.)
```

---

# REALPOLITICS

## Understand the world.

## Think for yourself.
