export type Hotspot = { label: string; tip: string }
export type Choice = { id: string; label: string; detail: string; feedback: string }
export type Scene = {
  id: string
  kicker: string
  title: string
  narration: string
  visual: 'beach' | 'choice' | 'spring' | 'fishing' | 'tools' | 'friday' | 'trade' | 'summary'
  concept?: { term: string; text: string }
  chart?: { title: string; bars: { label: string; value: number; max: number; unit: string }[] }
  hotspots?: Hotspot[]
  choice?: { prompt: string; options: Choice[] }
  causal?: string[]
  mistake?: string
}

export const robinsonScenes: Scene[] = [
  {
    id: 'llegada',
    kicker: 'Escena 1 · Apertura',
    title: 'Robinson llega a la isla',
    narration:
      'Robinson lleva dos días sin beber agua. El mar lo deja en una playa desierta, sin dinero, sin tiendas, sin gobierno. Y aun así, el primer problema económico de la historia ya está ahí, esperándole en la arena.',
    visual: 'beach',
    hotspots: [
      { label: 'Sol', tip: 'El tiempo de luz es limitado: solo hay 10 horas útiles al día.' },
      { label: 'Arena', tip: 'Abundante y sin valor: lo abundante rara vez es escaso.' },
      { label: 'Mar', tip: 'Fuente de alimento, pero exige tiempo y herramientas.' },
    ],
  },
  {
    id: 'dilema',
    kicker: 'Escena 2 · El dilema',
    title: 'Solo puede cargar una cosa: agua u oro',
    narration:
      'Entre los restos del naufragio encuentra dos cosas: un cofre con oro y una cantimplora con agua. Está agotado. Solo puede cargar una. ¿Qué eliges tú?',
    visual: 'choice',
    choice: {
      prompt: '¿Qué debería llevarse Robinson?',
      options: [
        { id: 'agua', label: 'El agua', detail: 'Cubre una necesidad inmediata', feedback: 'Exacto. En esta situación el agua vale más que el oro, aunque en un mercado el oro cueste miles de veces más.' },
        { id: 'oro', label: 'El oro', detail: 'Vale mucho dinero', feedback: 'El oro solo vale si hay alguien con quien intercambiarlo. En la isla no hay mercado: su valor de uso aquí es casi cero.' },
        { id: 'depende', label: 'Depende', detail: 'Depende del contexto', feedback: 'Muy buena respuesta: el valor no está en el objeto, está en la situación y en lo que esa unidad concreta te aporta.' },
      ],
    },
    concept: { term: 'Valor subjetivo', text: 'El valor no es una propiedad del objeto: nace de la utilidad que una persona concreta espera obtener de él en una situación concreta.' },
    mistake: 'Error típico: confundir precio con valor. El precio es lo que el mercado pide; el valor es lo que esa unidad significa para ti ahora.',
  },
  {
    id: 'manantial',
    kicker: 'Escena 3 · Revelación',
    title: 'Robinson encuentra un manantial',
    narration:
      'Al día siguiente descubre un manantial de agua dulce. El agua sigue siendo igual de necesaria para vivir, pero cada vaso adicional ya no le salva la vida. Su valor relativo se desploma, y el oro vuelve a llamarle la atención.',
    visual: 'spring',
    concept: { term: 'Utilidad marginal decreciente', text: 'Cada unidad adicional de un bien satisface una necesidad menos urgente, así que aporta menos valor que la anterior.' },
    chart: {
      title: 'Valor del siguiente vaso de agua',
      bars: [
        { label: 'Vaso 1 (sed extrema)', value: 100, max: 100, unit: '' },
        { label: 'Vaso 2', value: 60, max: 100, unit: '' },
        { label: 'Vaso 3', value: 30, max: 100, unit: '' },
        { label: 'Vaso 4 (lavar ropa)', value: 10, max: 100, unit: '' },
      ],
    },
  },
  {
    id: 'escasez',
    kicker: 'Escena 4 · Escasez',
    title: 'Diez horas de luz, cuatro necesidades',
    narration:
      'Aunque sepa qué valora más, Robinson no puede hacerlo todo. Pescar, recoger cocos, construir refugio y fabricar herramientas compiten por las mismas diez horas de luz. Ahí nace la escasez.',
    visual: 'fishing',
    concept: { term: 'Escasez', text: 'Los recursos son limitados frente a unos deseos que siempre son mayores. Por eso elegir no es opcional.' },
    hotspots: [
      { label: 'Pesca', tip: 'Comida hoy, pero consume horas de luz.' },
      { label: 'Refugio', tip: 'Seguridad futura a costa de comida presente.' },
      { label: 'Herramientas', tip: 'Cero output hoy, más output mañana.' },
    ],
  },
  {
    id: 'coste',
    kicker: 'Escena 5 · Coste de oportunidad',
    title: 'Pescar hoy o fabricar una lanza',
    narration:
      'Si dedica tres horas a fabricar una lanza mejor, hoy no come pescado. Los seis peces que no captura no desaparecen del problema: son exactamente el coste de su decisión.',
    visual: 'tools',
    choice: {
      prompt: '¿Qué hace Robinson con sus próximas 3 horas?',
      options: [
        { id: 'pescar', label: 'Pescar 3 horas', detail: '6 peces hoy', feedback: 'Decisión razonable si tiene hambre o riesgo alto. Su coste: la lanza que no construye y los peces futuros que no capturará.' },
        { id: 'lanza', label: 'Fabricar la lanza', detail: '0 peces hoy · 12 mañana', feedback: 'Está invirtiendo: sacrifica consumo presente para aumentar su capacidad productiva futura.' },
      ],
    },
    concept: { term: 'Coste de oportunidad', text: 'El coste de una decisión es el valor de la mejor alternativa a la que renuncias, no el dinero que pagas.' },
    causal: ['Menos consumo hoy', 'Tiempo liberado', 'Herramienta mejor', 'Más peces por hora', 'Más tiempo libre mañana'],
  },
  {
    id: 'capital',
    kicker: 'Escena 6 · Capital',
    title: 'La herramienta cambia lo que una hora puede producir',
    narration:
      'Con las manos capturaba dos peces por hora. Con una lanza básica, cuatro. Con una lanza mejorada, seis. La herramienta no es dinero: es capital, y multiplica lo que su tiempo produce.',
    visual: 'tools',
    chart: {
      title: 'Productividad por hora',
      bars: [
        { label: 'Manos', value: 2, max: 6, unit: 'peces/h' },
        { label: 'Lanza básica', value: 4, max: 6, unit: 'peces/h' },
        { label: 'Lanza mejorada', value: 6, max: 6, unit: 'peces/h' },
      ],
    },
    concept: { term: 'Capital', text: 'Capital son los bienes producidos que sirven para producir otros bienes. El dinero solo es una forma de reclamarlo.' },
  },
  {
    id: 'ahorro',
    kicker: 'Escena 7 · Ahorro e inversión',
    title: '¿Comer ocho peces hoy o conservar dos?',
    narration:
      'Para construir la lanza necesita tiempo, y para tener tiempo necesita comida guardada. Ahorrar no es avaricia: es lo que hace posible invertir. Cuánto ahorra depende de cuánto valora el presente frente al futuro.',
    visual: 'fishing',
    concept: { term: 'Preferencia temporal', text: 'Es la intensidad con la que preferimos disfrutar ahora en lugar de después. Cuanto más alta, menos se ahorra e invierte.' },
  },
  {
    id: 'viernes',
    kicker: 'Escena 8 · Llega Viernes',
    title: 'Dos personas, dos talentos distintos',
    narration:
      'Viernes aparece en la isla. Robinson pesca mejor; Viernes recoge cocos mucho mejor. Si cada uno hace de todo, producen poco. Si cada uno se centra en lo suyo, la isla entera produce más.',
    visual: 'friday',
    chart: {
      title: 'Producción por hora',
      bars: [
        { label: 'Robinson · peces', value: 6, max: 8, unit: '' },
        { label: 'Robinson · cocos', value: 3, max: 8, unit: '' },
        { label: 'Viernes · peces', value: 3, max: 8, unit: '' },
        { label: 'Viernes · cocos', value: 8, max: 8, unit: '' },
      ],
    },
    concept: { term: 'Especialización', text: 'Concentrar el esfuerzo donde uno es relativamente más productivo aumenta la producción total del grupo.' },
  },
  {
    id: 'intercambio',
    kicker: 'Escena 9 · El primer mercado',
    title: 'Tres peces por cinco cocos',
    narration:
      'Intercambian. Ninguno pierde: cada uno entrega algo que valora menos a cambio de algo que valora más. Ese es el motor silencioso de toda economía, desde una isla hasta un mercado global.',
    visual: 'trade',
    concept: { term: 'Intercambio voluntario', text: 'En un intercambio libre ambas partes esperan ganar; si no, no lo harían.' },
    mistake: 'Error típico: creer que en todo intercambio alguien gana y alguien pierde.',
  },
  {
    id: 'sintesis',
    kicker: 'Escena 10 · Síntesis',
    title: 'La economía empieza en una elección',
    narration:
      'Sin dinero, sin bancos y sin Estado ya han aparecido el valor, la escasez, el coste de oportunidad, el capital, el ahorro, la especialización y el mercado. Todo lo demás son capas construidas encima. Pero cuando aparece un tercer náufrago y hay que decidir de quién es la playa, nace algo nuevo: las instituciones.',
    visual: 'summary',
    causal: ['Recursos limitados', 'Escasez', 'Elección', 'Coste de oportunidad', 'Capital', 'Ahorro', 'Especialización', 'Intercambio', 'Instituciones'],
  },
]
