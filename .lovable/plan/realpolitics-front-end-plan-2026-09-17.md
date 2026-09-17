# REALPOLITICS Front-End Plan

## Goal
Build a polished, responsive, front-end-only REALPOLITICS prototype that feels like a living map of knowledge rather than a traditional learning portal. It will use realistic educational demo data, working interactions, and local persistence; no backend, real authentication, payments, or content-management persistence will be added yet.

## 1. Product foundation and visual system
- Replace the blank starter screen with a complete TanStack Start application.
- Establish the supplied dark editorial identity: near-black navy surfaces, restrained antique gold, electric blue, and subtle category accents.
- Pair an authoritative editorial serif with a modern sans-serif, using a narrow reading column for lessons and light reading mode where appropriate.
- Create reusable tokens for color, typography, spacing, radii, shadows, motion, focus states, and responsive behavior.
- Build the REALPOLITICS wordmark with a restrained compass/knowledge-node symbol.
- Create shared desktop navigation, compact mobile header, mobile bottom navigation, search command, language switcher, theme controls, progress indicators, badges, buttons, and modal patterns.

## 2. Front-end data and state architecture
- Define typed models for categories, concepts, relations, courses, lessons, lesson blocks, quizzes, paths, events, achievements, challenges, users, sources, bookmarks, and translations.
- Add realistic mock content at the brief’s minimum scale: 30+ concepts, 12+ lessons, 5 courses, 4+ paths, 15 events, 10 achievements, and 8 daily questions.
- Create a browser-safe local data service so a future backend can replace it without rewriting page components.
- Persist Alex Morgan’s language, theme, lesson progress, XP, quiz attempts, achievements, saved content, streak, and concept mastery locally after hydration.
- Provide natural English and Spanish interface copy; demo educational content remains primarily English unless a Spanish version is supplied.

## 3. Public and personalized experience
- `/`: cinematic public introduction with “Understand the world,” one primary learning action, one Knowledge Map action, and an animated interconnected-concepts scene.
- `/home`: focused personalized dashboard for Alex Morgan with Continue Learning, Knowledge Score, Daily Challenge, Knowledge of the Day, streak, and clear next recommendations.
- `/explore` and `/category/$slug`: editorial category discovery and a rich Economics category example.
- `/learn`, `/paths`, and `/path/$slug`: learning hub, curated paths, and a vertical unlock journey.
- `/course/$slug`: Economics Foundations overview with its ten-lesson progression.
- `/essential-1000`, `/review`, `/challenges`, `/library`, `/profile`, `/profile/achievements`, `/profile/knowledge`, `/profile/stats`, `/glossary`, `/settings`, and `/search`: complete, populated prototype views with useful empty states where relevant.
- `/login`, `/signup`, and `/onboarding`: elegant front-end demo flows; they will not imply real account creation.

## 4. Flagship Robinson Crusoe lesson
- Build `/lesson/$slug` as a reusable block-driven lesson experience, with Robinson Crusoe as the fully realized demo.
- Generate a cohesive set of original, premium editorial island illustrations for the major story scenes rather than shipping generic placeholders.
- Implement the pedagogical sequence: story → question → interaction → concept → explanation → example → quiz → next connection.
- Include the 10-hour constrained allocation exercise, fishing-versus-tool decision, productivity comparison, capital, saving/investment, Friday’s arrival, specialization, and an animated trade simulation.
- Add reading progress, save action, focus/light reading mode, definitions, sources, and the five-question Knowledge Check.
- Calculate results, award XP once, unlock “Island Economist,” support review of mistakes, and persist completion.
- Transition completion into the Knowledge Map so the relevant concepts illuminate and Comparative Advantage becomes the visible next locked idea.

## 5. Flagship exploration tools
- `/knowledge-map`: interactive constellation with category/status filters, search/focus, zoom controls, selectable nodes, relationship lines, mastery states, and a responsive detail panel. Mobile receives a simplified touch-friendly clustered view.
- `/timeline` and `/timeline/$eventSlug`: horizontal historical exploration with working subject/region filters and event details.
- `/concept/$slug`, `/people/$slug`, and `/institutions/$slug`: reusable educational detail templates showing overview, simple/deep explanation, sources, review status, related concepts, and evidence labels.
- Global search opens with Ctrl/Cmd+K, supports keyboard navigation, recent searches, filtering, and links to real included routes.

## 6. Gamification and interaction quality
- Implement sophisticated progress rings, XP changes, level display, mastery states, streak calendar, daily/weekly challenges, and collectible achievements without casino-like effects.
- Add a skippable, reduced-motion-aware achievement overlay lasting about two seconds.
- Ensure every visible action either works, navigates somewhere meaningful, or is explicitly marked “Coming soon.”
- Keep motion restrained: subtle node illumination, progress fills, timeline movement, and selective surface lift.

## 7. Administration prototype
- `/admin`: distinct but visually related administration shell and overview.
- Add working front-end navigation for content, lessons, courses, concepts, graph, quizzes, scenarios, timeline, sources, translations, users, and analytics.
- `/admin/lessons/new`: functional mock lesson editor with metadata, objectives, block insertion/reordering, quiz configuration, sources, translation status, preview, and local draft persistence.
- Advanced publishing, uploads, collaborative review, permissions, and analytics remain clearly labeled prototype states until backend work begins.

## 8. Route quality, accessibility, and validation
- Give every content route unique title, description, Open Graph title/description, `og:type`, and Twitter card metadata.
- Use semantic URLs and real route files for every navigation target; no dead links or hash-based substitutes for major screens.
- Ensure visible keyboard focus, 44px touch targets, labeled controls, usable tab order, meaningful alt text, strong contrast, and reduced-motion behavior.
- Validate the main flows and every requested route at mobile, tablet, and desktop sizes, checking overflow, reading width, map usability, dialogs, quiz behavior, persistence, and navigation.
- Run the available lint/build checks and browser-based interaction checks before completion.

## Technical notes
- Keep TanStack Start, React 19, and Tailwind CSS v4.
- Use semantic design tokens in the global stylesheet and the existing component conventions.
- Use Recharts only where charts add comprehension; use an efficient custom SVG/canvas-style subset for the demo Knowledge Map rather than loading an enormous graph.
- Keep all data local and mock-driven in this phase. No Lovable Cloud activation is needed until authentication, shared persistence, uploads, or production administration are requested.
- Large future-only systems from the brief will receive scalable types, reusable UI patterns, and honest prototype states—not fabricated backend behavior.
