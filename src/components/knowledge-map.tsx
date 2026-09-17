import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Network,
  X,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { concepts, categories, type Concept } from '@/data/content'
import { Button } from './ui/button'

// Category styling config
const CATEGORY_COLORS: Record<string, { label: string; accent: string; bg: string; border: string; glow: string; text: string }> = {
  economics: {
    label: 'Economía',
    accent: 'var(--primary)',
    bg: 'rgba(217, 163, 62, 0.15)',
    border: 'rgba(217, 163, 62, 0.5)',
    glow: 'rgba(217, 163, 62, 0.3)',
    text: 'text-primary'
  },
  finance: {
    label: 'Finanzas',
    accent: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.5)',
    glow: 'rgba(16, 185, 129, 0.3)',
    text: 'text-emerald-400'
  },
  government: {
    label: 'Gobierno',
    accent: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.5)',
    glow: 'rgba(59, 130, 246, 0.3)',
    text: 'text-blue-400'
  },
  history: {
    label: 'Historia',
    accent: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.5)',
    glow: 'rgba(168, 85, 247, 0.3)',
    text: 'text-purple-400'
  },
  technology: {
    label: 'Tecnología',
    accent: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.5)',
    glow: 'rgba(6, 182, 212, 0.3)',
    text: 'text-cyan-400'
  },
  science: {
    label: 'Ciencia',
    accent: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.15)',
    border: 'rgba(20, 184, 166, 0.5)',
    glow: 'rgba(20, 184, 166, 0.3)',
    text: 'text-teal-400'
  },
  'critical-thinking': {
    label: 'Pensamiento Crítico',
    accent: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.5)',
    glow: 'rgba(244, 63, 94, 0.3)',
    text: 'text-rose-400'
  }
}

const DEFAULT_CATEGORY_COLOR = {
  label: 'General',
  accent: 'var(--primary)',
  bg: 'rgba(217, 163, 62, 0.12)',
  border: 'rgba(217, 163, 62, 0.4)',
  glow: 'rgba(217, 163, 62, 0.25)',
  text: 'text-primary'
}

export function KnowledgeMap() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Concept>(concepts[0] as Concept)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [query, setQuery] = useState('')

  // Pan & Zoom state for interactive map
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const initialPinchDist = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Map concept lookup for fast relations
  const conceptMap = useMemo(() => {
    const map = new Map<string, Concept>()
    for (const c of concepts) map.set(c.slug, c)
    return map
  }, [])

  // Filtered concepts
  const shown = useMemo(() => {
    return concepts.filter((c) => {
      const matchQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())

      if (!matchQuery) return false

      if (filter === 'All') return true
      if (['mastered', 'learning', 'available', 'locked'].includes(filter.toLowerCase())) {
        return c.status === filter.toLowerCase()
      }
      return c.category === filter.toLowerCase()
    })
  }, [filter, query])

  // Compute unique edges based on related concepts
  const edges = useMemo(() => {
    const edgeList: { from: Concept; to: Concept; id: string }[] = []
    const seen = new Set<string>()

    for (const c of concepts) {
      if (!c.related) continue
      for (const relSlug of c.related) {
        const target = conceptMap.get(relSlug)
        if (!target) continue
        const edgeId = [c.slug, relSlug].sort().join('--')
        if (!seen.has(edgeId)) {
          seen.add(edgeId)
          edgeList.push({ from: c, to: target, id: edgeId })
        }
      }
    }
    return edgeList
  }, [conceptMap])

  // Check if a concept is connected to the selected one
  const isConnected = useCallback((slug: string) => {
    if (!selected) return false
    if (selected.slug === slug) return true
    return (selected.related || []).includes(slug) || (conceptMap.get(slug)?.related || []).includes(selected.slug)
  }, [selected, conceptMap])

  // Select node with auto-opening sheet on mobile
  const handleSelectConcept = (c: Concept) => {
    setSelected(c)
    setSheetOpen(true)
  }

  // Reset pan and zoom
  const resetTransform = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a')) return
    isDragging.current = true
    startPos.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    setPan({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y })
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  // Touch drag & pinch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest('button, input, a')) return
      isDragging.current = true
      const touch = e.touches[0]!
      startPos.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y }
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]!
      const touch2 = e.touches[1]!
      initialPinchDist.current = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging.current) {
      const touch = e.touches[0]!
      setPan({ x: touch.clientX - startPos.current.x, y: touch.clientY - startPos.current.y })
    } else if (e.touches.length === 2 && initialPinchDist.current !== null) {
      const touch1 = e.touches[0]!
      const touch2 = e.touches[1]!
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      const factor = dist / initialPinchDist.current
      setZoom((z) => Math.min(2.5, Math.max(0.6, z * factor)))
      initialPinchDist.current = dist
    }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    initialPinchDist.current = null
  }

  // Categories list for tabs & filter
  const filterOptions = [
    { id: 'All', label: 'Todos', count: concepts.length },
    { id: 'economics', label: 'Economía', count: concepts.filter((c) => c.category === 'economics').length },
    { id: 'finance', label: 'Finanzas', count: concepts.filter((c) => c.category === 'finance').length },
    { id: 'government', label: 'Gobierno', count: concepts.filter((c) => c.category === 'government').length },
    { id: 'history', label: 'Historia', count: concepts.filter((c) => c.category === 'history').length },
    { id: 'technology', label: 'Tecnología', count: concepts.filter((c) => c.category === 'technology').length },
    { id: 'critical-thinking', label: 'Pensamiento Crítico', count: concepts.filter((c) => c.category === 'critical-thinking').length },
    { id: 'mastered', label: 'Dominados', count: concepts.filter((c) => c.status === 'mastered').length },
    { id: 'learning', label: 'En progreso', count: concepts.filter((c) => c.status === 'learning').length },
  ]

  // Group concepts by category for the Mobile List view
  const groupedCategories = useMemo(() => {
    const groups: { category: string; config: typeof DEFAULT_CATEGORY_COLOR; items: Concept[] }[] = []
    const cats = ['economics', 'finance', 'government', 'history', 'technology', 'science', 'critical-thinking']
    
    for (const cat of cats) {
      const items = shown.filter((c) => c.category === cat)
      if (items.length > 0) {
        groups.push({
          category: cat,
          config: CATEGORY_COLORS[cat] || DEFAULT_CATEGORY_COLOR,
          items
        })
      }
    }
    return groups
  }, [shown])

  const selectedCategoryConfig = CATEGORY_COLORS[selected?.category] || DEFAULT_CATEGORY_COLOR

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* ── TOP TOOLBAR (Mobile First) ─────────────────────────────────── */}
      <header className="z-30 flex-shrink-0 border-b border-border/80 bg-background/95 backdrop-blur-md px-3 py-2.5 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Search & View Switcher */}
          <div className="flex items-center gap-2 w-full sm:max-w-md">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar concepto (inflación, PIB, deuda)..."
                className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-8 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Borrar búsqueda"
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Constellation vs List */}
            <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vista Mapa / Constelación"
              >
                <Network className="size-3.5" />
                <span className="hidden xs:inline">Constelación</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vista en Lista / Temas"
              >
                <Layers className="size-3.5" />
                <span className="hidden xs:inline">Por Temas</span>
              </button>
            </div>
          </div>

          {/* Quick Counter */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>
              Mostrando <b className="text-foreground font-semibold">{shown.length}</b> de {concepts.length} conceptos
            </span>
          </div>
        </div>

        {/* Horizontal Category Scroll (Mobile Optimized - No wrap) */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {filterOptions.map((opt) => {
            const isSelected = filter === opt.id
            const colorConf = CATEGORY_COLORS[opt.id]
            return (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 border transition ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-gold'
                    : 'border-border/80 bg-surface/80 text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                }`}
              >
                {colorConf && (
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? 'currentColor' : colorConf.accent }}
                  />
                )}
                <span>{opt.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background/60 text-muted-foreground'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* ── MODE 1: INTERACTIVE CONSTELLATION MAP ─────────────────── */}
        {viewMode === 'map' && (
          <div
            ref={containerRef}
            className="relative flex-1 h-full w-full overflow-hidden subtle-grid cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Ambient cluster glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
              <div className="absolute top-[15%] left-[20%] size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/20 blur-3xl" />
              <div className="absolute top-[40%] left-[50%] size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute top-[65%] left-[30%] size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="absolute top-[25%] left-[85%] size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl" />
            </div>

            {/* Transformable Canvas */}
            <div
              className="absolute inset-0 origin-center transition-transform duration-75"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              {/* Virtual map canvas container with explicit dimensions */}
              <div className="relative w-[1100px] h-[860px] mx-auto my-auto top-6 left-6">
                {/* SVG Connections / Edges */}
                <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="edgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {edges.map((edge) => {
                    const isEdgeActive =
                      selected && (edge.from.slug === selected.slug || edge.to.slug === selected.slug)
                    const isAnyDimmed =
                      selected && !isEdgeActive && edge.from.slug !== selected.slug && edge.to.slug !== selected.slug

                    return (
                      <line
                        key={edge.id}
                        x1={`${edge.from.x}%`}
                        y1={`${edge.from.y}%`}
                        x2={`${edge.to.x}%`}
                        y2={`${edge.to.y}%`}
                        stroke={isEdgeActive ? 'url(#edgeGold)' : 'hsl(var(--border))'}
                        strokeWidth={isEdgeActive ? 0.35 : 0.15}
                        strokeDasharray={isEdgeActive ? 'none' : '0.6 0.6'}
                        strokeOpacity={isEdgeActive ? 0.95 : isAnyDimmed ? 0.12 : 0.35}
                        className="transition-all duration-300"
                      />
                    )
                  })}
                </svg>

                {/* Concept Nodes */}
                {shown.map((c) => {
                  const isSelected = selected?.slug === c.slug
                  const isNeighbor = isConnected(c.slug)
                  const isDimmed = selected && !isSelected && !isNeighbor
                  const colorConfig = CATEGORY_COLORS[c.category] || DEFAULT_CATEGORY_COLOR

                  return (
                    <div
                      key={c.slug}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                      style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        opacity: isDimmed ? 0.35 : 1,
                        zIndex: isSelected ? 30 : isNeighbor ? 20 : 10,
                        transform: `translate(-50%, -50%) scale(${isSelected ? 1.15 : isNeighbor ? 1.05 : 1})`,
                      }}
                    >
                      <button
                        onClick={() => handleSelectConcept(c)}
                        className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all shadow-md active:scale-95 ${
                          isSelected
                            ? 'border-primary bg-background ring-2 ring-primary ring-offset-2 ring-offset-background shadow-gold text-foreground'
                            : isNeighbor
                            ? 'border-primary/60 bg-surface/95 text-foreground hover:border-primary'
                            : 'border-border/80 bg-surface/90 text-foreground/90 hover:border-border hover:bg-surface-elevated'
                        }`}
                        style={{
                          borderColor: isSelected ? 'var(--primary)' : isNeighbor ? colorConfig.accent : undefined,
                        }}
                      >
                        {/* Status Icon / Pip */}
                        <span
                          className="flex size-4 items-center justify-center rounded-full text-[10px]"
                          style={{
                            backgroundColor: colorConfig.bg,
                            color: colorConfig.accent,
                          }}
                        >
                          {c.status === 'mastered' ? (
                            <CheckCircle2 className="size-3 text-emerald-400" />
                          ) : c.status === 'learning' ? (
                            <Clock className="size-3 text-amber-400" />
                          ) : c.status === 'locked' ? (
                            <Lock className="size-2.5 text-muted-foreground" />
                          ) : (
                            <span className="size-1.5 rounded-full" style={{ backgroundColor: colorConfig.accent }} />
                          )}
                        </span>

                        {/* Name */}
                        <span className="whitespace-nowrap font-medium tracking-tight">
                          {c.name}
                        </span>

                        {/* Mastery Pill if selected */}
                        {isSelected && (
                          <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                            {c.progress}%
                          </span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Floating Navigation / Zoom Controls */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface/90 p-1.5 backdrop-blur-md shadow-lg">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-lg"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                aria-label="Acercar"
                title="Acercar"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-lg"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                aria-label="Alejar"
                title="Alejar"
              >
                <ZoomOut className="size-4" />
              </Button>
              <div className="h-4 w-px bg-border my-auto" />
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-lg"
                onClick={resetTransform}
                aria-label="Centrar mapa"
                title="Centrar mapa"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>

            {/* Mobile Touch Hint */}
            <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
              <span>Arrastra para navegar · Haz clic para explorar</span>
            </div>
          </div>
        )}

        {/* ── MODE 2: MOBILE LIST / CARDS BY CATEGORY ──────────────── */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 max-w-5xl mx-auto w-full space-y-8 pb-32">
            {groupedCategories.map((group) => (
              <section key={group.category} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: group.config.accent }}
                    />
                    <h2 className="font-serif text-xl sm:text-2xl text-foreground font-semibold">
                      {group.config.label}
                    </h2>
                    <span className="text-xs text-muted-foreground">({group.items.length})</span>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((c) => {
                    const isSelected = selected?.slug === c.slug
                    return (
                      <div
                        key={c.slug}
                        onClick={() => handleSelectConcept(c)}
                        className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all cursor-pointer hover:border-primary/70 hover:bg-surface-elevated ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-gold ring-1 ring-primary'
                            : 'border-border/80 bg-surface/70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                              {c.name}
                            </h3>
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                backgroundColor: group.config.bg,
                                color: group.config.accent,
                              }}
                            >
                              {c.status === 'mastered' ? 'Dominado' : c.status === 'learning' ? 'En progreso' : c.status === 'locked' ? 'Bloqueado' : 'Disponible'}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {c.description}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                          <span className="text-muted-foreground">Progreso: {c.progress}%</span>
                          <span className="text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Ver detalles <ChevronRight className="size-3" />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ── DESKTOP SIDEBAR PANEL (lg+ screens) ────────────────────── */}
        <aside className="hidden lg:flex w-84 flex-col border-l border-border/80 bg-surface/90 backdrop-blur-md p-6 overflow-y-auto">
          {selected ? (
            <div className="flex flex-col h-full justify-between space-y-6">
              <div className="space-y-5">
                {/* Category & Status */}
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: selectedCategoryConfig.bg,
                      color: selectedCategoryConfig.accent,
                    }}
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: selectedCategoryConfig.accent }} />
                    {selectedCategoryConfig.label}
                  </span>

                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {selected.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h1 className="font-serif text-3xl font-normal leading-tight text-foreground">
                    {selected.name}
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>
                </div>

                {/* Mastery Meter */}
                <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Nivel de dominio</span>
                    <b className="text-foreground font-semibold">{selected.progress}%</b>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${selected.progress}%`,
                        backgroundColor: selectedCategoryConfig.accent,
                      }}
                    />
                  </div>
                </div>

                {/* Related Concepts */}
                {selected.related && selected.related.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      Conceptos conectados ({selected.related.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.related.map((relSlug) => {
                        const relConcept = conceptMap.get(relSlug)
                        if (!relConcept) return null
                        return (
                          <button
                            key={relSlug}
                            onClick={() => setSelected(relConcept)}
                            className="rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs text-foreground transition hover:border-primary hover:bg-surface-elevated"
                          >
                            {relConcept.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-border/80 space-y-2">
                <Button className="w-full" asChild>
                  <Link to="/concept/$slug" params={{ slug: selected.slug }}>
                    <BookOpen className="mr-2 size-4" />
                    Explorar concepto
                    <ArrowRight className="ml-auto size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              Selecciona un concepto del mapa para ver sus detalles.
            </div>
          )}
        </aside>
      </div>

      {/* ── MOBILE DETAIL BOTTOM SHEET / DRAWER ────────────────────────── */}
      {sheetOpen && selected && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs -z-10"
            onClick={() => setSheetOpen(false)}
          />

          {/* Drawer content card */}
          <div className="relative max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-5 shadow-2xl space-y-4">
            {/* Pull handle & close */}
            <div className="flex items-center justify-between pb-1">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-border" />
              <button
                onClick={() => setSheetOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground"
                aria-label="Cerrar detalles"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Category & Status */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: selectedCategoryConfig.bg,
                  color: selectedCategoryConfig.accent,
                }}
              >
                <span className="size-1.5 rounded-full" style={{ backgroundColor: selectedCategoryConfig.accent }} />
                {selectedCategoryConfig.label}
              </span>

              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {selected.status} · {selected.progress}%
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {selected.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {selected.description}
              </p>
            </div>

            {/* Related concepts */}
            {selected.related && selected.related.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Conceptos conectados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selected.related.map((relSlug) => {
                    const relConcept = conceptMap.get(relSlug)
                    if (!relConcept) return null
                    return (
                      <button
                        key={relSlug}
                        onClick={() => setSelected(relConcept)}
                        className="rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-xs text-foreground active:scale-95"
                      >
                        {relConcept.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="pt-2">
              <Button className="w-full h-11 text-sm font-semibold" asChild>
                <Link to="/concept/$slug" params={{ slug: selected.slug }}>
                  <BookOpen className="mr-2 size-4" />
                  Explorar concepto completo
                  <ArrowRight className="ml-auto size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
