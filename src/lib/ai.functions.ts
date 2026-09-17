import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const GATEWAY = 'https://ai.gateway.lovable.dev/v1'

const voiceMap: Record<string, string> = {
  femenina: 'Kore',
  masculina: 'Puck',
  epica: 'Charon',
}

const toneMap: Record<string, string> = {
  narrativo: 'Léelo como un narrador de documental: cálido, pausado, con intención dramática suave.',
  didactico: 'Léelo como un buen profesor: claro, cercano, pausas naturales tras cada idea clave.',
  epico: 'Léelo con energía épica contenida, ritmo firme y énfasis en las palabras clave.',
}

const NarrateInput = z.object({
  text: z.string().min(1).max(2200),
  voice: z.enum(['femenina', 'masculina', 'epica']).catch('femenina'),
  tone: z.enum(['narrativo', 'didactico', 'epico']).catch('didactico'),
  speed: z.number().min(0.8).max(1.3).catch(1),
})

/** Genera narración con voz neuronal (WAV base64). */
export const narrate = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => NarrateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env['LOVABLE_API_KEY']
    if (!key) throw new Error('Falta la clave de IA')
    const speed = data.speed < 0.95 ? 'un poco más lento de lo normal' : data.speed > 1.05 ? 'algo más ágil de lo normal' : 'a ritmo natural'
    const prompt = `${toneMap[data.tone]} Habla en español neutro, ${speed}, respetando las pausas de la puntuación.\n\n${data.text}`
    const res = await fetch(`${GATEWAY}/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': key, 'X-Lovable-AIG-SDK': 'fetch' },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-tts-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceMap[data.voice] ?? 'Kore' } } },
        },
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(res.status === 429 ? 'La narración está saturada, inténtalo en unos segundos.' : res.status === 402 ? 'Se agotaron los créditos de IA de la app.' : `No se pudo generar la voz (${res.status}): ${body.slice(0, 180)}`)
    }
    const buf = new Uint8Array(await res.arrayBuffer())
    let binary = ''
    for (let i = 0; i < buf.length; i += 8192) binary += String.fromCharCode(...buf.subarray(i, i + 8192))
    return { audio: btoa(binary), mime: 'audio/wav' }
  })

const TutorInput = z.object({
  question: z.string().min(1).max(1200),
  context: z.string().max(2000).optional(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) })).max(12).optional(),
})

/** Tutor de IA: responde con lenguaje claro y ejemplos. */
export const askTutor = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => TutorInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env['LOVABLE_API_KEY']
    if (!key) throw new Error('Falta la clave de IA')
    const system = `Eres el tutor de REALPOLITICS, una plataforma para entender economía, política e historia.
Responde en español, en menos de 180 palabras, con tono cercano y didáctico.
Estructura: idea principal, un ejemplo concreto, y una frase de "error típico" cuando aplique.
Nunca inventes datos ni cifras; si no lo sabes, dilo.${data.context ? `\nContexto de la lección actual: ${data.context}` : ''}`
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': key, 'X-Lovable-AIG-SDK': 'fetch' },
      body: JSON.stringify({
        model: 'google/gemini-3.8-flash',
        messages: [{ role: 'system', content: system }, ...(data.history ?? []), { role: 'user', content: data.question }],
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(res.status === 429 ? 'Demasiadas preguntas seguidas, espera unos segundos.' : res.status === 402 ? 'Se agotaron los créditos de IA de la app.' : `El tutor no está disponible (${res.status}): ${body.slice(0, 180)}`)
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    return { answer: json.choices?.[0]?.message?.content ?? 'No he podido responder esta vez.' }
  })
