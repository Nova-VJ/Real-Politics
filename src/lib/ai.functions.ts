import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const GATEWAY = 'https://ai.gateway.lovable.dev/v1'
const OPENAI = 'https://api.openai.com/v1'

/** Usa la clave propia de OpenAI si está configurada; si no, la pasarela de Lovable. */
function aiProvider() {
  const openaiKey = process.env['OPENAI_API_KEY']
  if (openaiKey) {
    return {
      own: true as const,
      base: OPENAI,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      chatModel: 'gpt-4.1',
      ttsModel: 'gpt-4o-mini-tts',
    }
  }
  const key = process.env['LOVABLE_API_KEY']
  if (!key) throw new Error('Falta la clave de IA')
  return {
    own: false as const,
    base: GATEWAY,
    headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': key, 'X-Lovable-AIG-SDK': 'fetch' },
    chatModel: 'openai/gpt-6-astra',
    ttsModel: 'google/gemini-3.1-flash-tts-preview',
  }
}

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
    const p = aiProvider()
    const speed = data.speed < 0.95 ? 'un poco más lento de lo normal' : data.speed > 1.05 ? 'algo más ágil de lo normal' : 'a ritmo natural'
    const prompt = `${toneMap[data.tone]} Habla en español neutro, ${speed}, respetando las pausas de la puntuación.\n\n${data.text}`
    const openaiVoice: Record<string, string> = { femenina: 'shimmer', masculina: 'onyx', epica: 'ballad' }
    const res = await fetch(`${p.base}/audio/speech`, {
      method: 'POST',
      headers: p.headers,
      body: JSON.stringify(
        p.own
          ? {
              model: p.ttsModel,
              voice: openaiVoice[data.voice] ?? 'shimmer',
              input: data.text,
              instructions: `${toneMap[data.tone]} Español neutro, ${speed}.`,
              response_format: 'mp3',
              speed: data.speed,
            }
          : {
              model: p.ttsModel,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceMap[data.voice] ?? 'Kore' } } },
              },
            },
      ),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(res.status === 429 ? 'La narración está saturada, inténtalo en unos segundos.' : res.status === 402 ? 'Se agotaron los créditos de IA de la app.' : `No se pudo generar la voz (${res.status}): ${body.slice(0, 180)}`)
    }
    const buf = new Uint8Array(await res.arrayBuffer())
    let binary = ''
    for (let i = 0; i < buf.length; i += 8192) binary += String.fromCharCode(...buf.subarray(i, i + 8192))
    return { audio: btoa(binary), mime: p.own ? 'audio/mpeg' : 'audio/wav' }
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
    const p = aiProvider()
    const system = `Eres el tutor de REALPOLITICS, una plataforma para entender economía, política e historia.
Responde en español, en menos de 180 palabras, con tono cercano y didáctico.
Estructura: idea principal, un ejemplo concreto, y una frase de "error típico" cuando aplique.
Nunca inventes datos ni cifras; si no lo sabes, dilo.${data.context ? `\nContexto de la lección actual: ${data.context}` : ''}`
    const res = await fetch(`${p.base}/responses`, {
      method: 'POST',
      headers: p.headers,
      body: JSON.stringify({
        model: p.chatModel,
        stream: true,
        store: false,
        ...(p.own ? {} : { reasoning: { effort: 'low', summary: 'auto' } }),
        instructions: system,
        input: [
          ...(data.history ?? []).map((m) => ({
            role: m.role,
            content: [{ type: m.role === 'assistant' ? 'output_text' : 'input_text', text: m.content }],
          })),
          { role: 'user', content: [{ type: 'input_text', text: data.question }] },
        ],
      }),
    })
    if (!res.ok || !res.body) {
      const body = await res.text()
      throw new Error(res.status === 429 ? 'Demasiadas preguntas seguidas, espera unos segundos.' : res.status === 402 ? 'Se agotaron los créditos de IA de la app.' : `El tutor no está disponible (${res.status}): ${body.slice(0, 180)}`)
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let answer = ''
    let reasoning = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const evt = JSON.parse(payload) as { type?: string; delta?: string }
          if (evt.type === 'response.output_text.delta' && evt.delta) answer += evt.delta
          else if (evt.type === 'response.reasoning_summary_text.delta' && evt.delta) reasoning += evt.delta
        } catch {
          /* ignora fragmentos incompletos */
        }
      }
    }
    return { answer: answer.trim() || reasoning.trim() || 'No he podido responder esta vez.' }
  })
