import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// ── Endpoints ──────────────────────────────────────────────────────────────
const GATEWAY = 'https://ai.gateway.lovable.dev/v1'
const OPENAI   = 'https://api.openai.com/v1'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

// ── Proveedor activo ───────────────────────────────────────────────────────
// Prioridad: GEMINI_API_KEY → OPENAI_API_KEY → LOVABLE_API_KEY
type Provider = 'gemini' | 'openai' | 'lovable'

function activeProvider(): Provider {
  if (process.env['GEMINI_API_KEY'])  return 'gemini'
  if (process.env['OPENAI_API_KEY'])  return 'openai'
  if (process.env['LOVABLE_API_KEY']) return 'lovable'
  throw new Error('No hay clave de IA configurada (GEMINI_API_KEY, OPENAI_API_KEY o LOVABLE_API_KEY)')
}

// ── Mapas de voces / tonos ─────────────────────────────────────────────────
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

// ── TUTOR ──────────────────────────────────────────────────────────────────
const TutorInput = z.object({
  question: z.string().min(1).max(1200),
  context:  z.string().max(2000).optional(),
  history:  z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) })).max(12).optional(),
})

/** Tutor de IA: responde con lenguaje claro y ejemplos. */
export const askTutor = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => TutorInput.parse(input))
  .handler(async ({ data }) => {
    const provider = activeProvider()
    const systemPrompt = `Eres el tutor de REALPOLITICS, una plataforma para entender economía, política e historia.
Responde en español, en menos de 180 palabras, con tono cercano y didáctico.
Estructura: idea principal, un ejemplo concreto, y una frase de "error típico" cuando aplique.
Nunca inventes datos ni cifras; si no lo sabes, dilo.${data.context ? `\nContexto de la lección actual: ${data.context}` : ''}`

    // ── Gemini (gratuito, generoso) ──────────────────────────────────────
    if (provider === 'gemini') {
      const key = process.env['GEMINI_API_KEY']!
      const model = 'gemini-2.0-flash'
      const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${key}`

      const contents = [
        ...(data.history ?? []).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: data.question }] },
      ]

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(
          res.status === 429 ? 'Demasiadas preguntas seguidas, espera unos segundos.' :
          `El tutor no está disponible (${res.status}): ${body.slice(0, 180)}`
        )
      }

      const json = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const answer = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
        ?? 'No he podido responder esta vez.'
      return { answer }
    }

    // ── OpenAI (clave propia) ────────────────────────────────────────────
    if (provider === 'openai') {
      const key = process.env['OPENAI_API_KEY']!
      const res = await fetch(`${OPENAI}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1',
          stream: true,
          store: false,
          instructions: systemPrompt,
          input: [
            ...(data.history ?? []).map((m) => ({
              role: m.role,
              content: [{ type: m.role === 'assistant' ? 'output_text' : 'input_text', text: m.content }],
            })),
            { role: 'user', content: [{ type: 'input_text', text: data.question }] },
          ],
        }),
      })
      return streamOpenAIResponse(res)
    }

    // ── Lovable Gateway (fallback) ───────────────────────────────────────
    {
      const key = process.env['LOVABLE_API_KEY']!
      const res = await fetch(`${GATEWAY}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': key, 'X-Lovable-AIG-SDK': 'fetch' },
        body: JSON.stringify({
          model: 'openai/gpt-6-astra',
          stream: true,
          store: false,
          reasoning: { effort: 'low', summary: 'auto' },
          instructions: systemPrompt,
          input: [
            ...(data.history ?? []).map((m) => ({
              role: m.role,
              content: [{ type: m.role === 'assistant' ? 'output_text' : 'input_text', text: m.content }],
            })),
            { role: 'user', content: [{ type: 'input_text', text: data.question }] },
          ],
        }),
      })
      return streamOpenAIResponse(res)
    }
  })

/** Lee un stream SSE compatible con la Responses API de OpenAI/Lovable. */
async function streamOpenAIResponse(res: Response): Promise<{ answer: string }> {
  if (!res.ok || !res.body) {
    const body = await res.text()
    throw new Error(
      res.status === 429 ? 'Demasiadas preguntas seguidas, espera unos segundos.' :
      res.status === 402 ? 'Se agotaron los créditos de IA de la app.' :
      `El tutor no está disponible (${res.status}): ${body.slice(0, 180)}`
    )
  }
  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = '', answer = '', reasoning = ''
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
        if (evt.type === 'response.output_text.delta' && evt.delta)          answer   += evt.delta
        else if (evt.type === 'response.reasoning_summary_text.delta' && evt.delta) reasoning += evt.delta
      } catch { /* ignora fragmentos incompletos */ }
    }
  }
  return { answer: answer.trim() || reasoning.trim() || 'No he podido responder esta vez.' }
}

// ── NARRACIÓN (TTS) ────────────────────────────────────────────────────────
const NarrateInput = z.object({
  text:  z.string().min(1).max(2200),
  voice: z.enum(['femenina', 'masculina', 'epica']).catch('femenina'),
  tone:  z.enum(['narrativo', 'didactico', 'epico']).catch('didactico'),
  speed: z.number().min(0.8).max(1.3).catch(1),
})

/** Genera narración con voz neuronal (MP3 / WAV en base64). */
export const narrate = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => NarrateInput.parse(input))
  .handler(async ({ data }) => {
    const provider = activeProvider()
    const speed    = data.speed < 0.95 ? 'un poco más lento de lo normal' : data.speed > 1.05 ? 'algo más ágil de lo normal' : 'a ritmo natural'
    const toneInst = toneMap[data.tone]

    // ── Gemini TTS (gratuito) ────────────────────────────────────────────
    if (provider === 'gemini') {
      const key   = process.env['GEMINI_API_KEY']!
      const model = 'gemini-2.5-flash-preview-tts'
      const url   = `${GEMINI_BASE}/models/${model}:generateContent?key=${key}`
      const prompt = `${toneInst} Habla en español neutro, ${speed}, respetando las pausas de la puntuación.\n\n${data.text}`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceMap[data.voice] ?? 'Kore' } },
            },
          },
        }),
      })

      if (!res.ok) {
        // Gemini TTS puede no estar disponible en capa gratuita — fallback a texto
        console.warn(`Gemini TTS falló (${res.status}), narración deshabilitada.`)
        return { audio: '', mime: 'audio/wav' }
      }

      const json = await res.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>
      }
      const inlineData = json.candidates?.[0]?.content?.parts?.[0]?.inlineData
      if (!inlineData?.data) return { audio: '', mime: 'audio/wav' }
      return { audio: inlineData.data, mime: inlineData.mimeType ?? 'audio/wav' }
    }

    // ── OpenAI TTS (clave propia) ────────────────────────────────────────
    if (provider === 'openai') {
      const key = process.env['OPENAI_API_KEY']!
      const openaiVoice: Record<string, string> = { femenina: 'shimmer', masculina: 'onyx', epica: 'ballad' }
      const res = await fetch(`${OPENAI}/audio/speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: openaiVoice[data.voice] ?? 'shimmer',
          input: data.text,
          instructions: `${toneInst} Español neutro, ${speed}.`,
          response_format: 'mp3',
          speed: data.speed,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`No se pudo generar la voz (${res.status}): ${body.slice(0, 180)}`)
      }
      return { audio: await toBase64(res), mime: 'audio/mpeg' }
    }

    // ── Lovable Gateway TTS (fallback) ───────────────────────────────────
    {
      const key   = process.env['LOVABLE_API_KEY']!
      const prompt = `${toneInst} Habla en español neutro, ${speed}, respetando las pausas de la puntuación.\n\n${data.text}`
      const res   = await fetch(`${GATEWAY}/audio/speech`, {
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
        throw new Error(
          res.status === 429 ? 'La narración está saturada, inténtalo en unos segundos.' :
          res.status === 402 ? 'Se agotaron los créditos de IA de la app.' :
          `No se pudo generar la voz (${res.status}): ${body.slice(0, 180)}`
        )
      }
      return { audio: await toBase64(res), mime: 'audio/wav' }
    }
  })

/** Convierte el cuerpo de una Response binaria a base64. */
async function toBase64(res: Response): Promise<string> {
  const buf = new Uint8Array(await res.arrayBuffer())
  let binary = ''
  for (let i = 0; i < buf.length; i += 8192) binary += String.fromCharCode(...buf.subarray(i, i + 8192))
  return btoa(binary)
}
