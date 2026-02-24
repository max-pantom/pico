/**
 * Node-compatible LLM client for Electron main process.
 * Uses .env: VITE_OLLAMA_HOST, VITE_OLLAMA_MODEL, VITE_OLLAMA_API_KEY.
 * Falls back to OpenAI (API key from secureStore) if Ollama fails.
 */

import { getAuth } from './secureStore'

const OLLAMA_URL = process.env.VITE_OLLAMA_HOST || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.VITE_OLLAMA_MODEL || 'llama3.2'
const OLLAMA_API_KEY = process.env.VITE_OLLAMA_API_KEY

export async function callLLMNode(system: string, user: string): Promise<string> {
  const auth = getAuth()
  if (auth?.mode === 'apiKey' && auth.apiKey) {
    try {
      return await callOpenAI(auth.apiKey, system, user)
    } catch (err) {
      console.warn('OpenAI failed, trying Ollama:', err)
    }
  }
  return callOllama(system, user)
}

async function callOllama(system: string, user: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (OLLAMA_API_KEY) headers.Authorization = `Bearer ${OLLAMA_API_KEY}`
  const base = OLLAMA_URL.replace(/\/$/, '')
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: false,
    }),
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { message?: { content?: string } }
  return data.message?.content ?? ''
}

async function callOpenAI(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

export function extractJSON(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (match) return match[1].trim()
  const start = trimmed.indexOf('{')
  if (start >= 0) {
    let depth = 0
    let inString = false
    let escape = false
    let quote = ''
    for (let i = start; i < trimmed.length; i++) {
      const c = trimmed[i]
      if (escape) {
        escape = false
        continue
      }
      if (c === '\\' && inString) {
        escape = true
        continue
      }
      if ((c === '"' || c === "'") && !inString) {
        inString = true
        quote = c
        continue
      }
      if (c === quote && inString) {
        inString = false
        continue
      }
      if (inString) continue
      if (c === '{') depth++
      if (c === '}') {
        depth--
        if (depth === 0) return trimmed.slice(start, i + 1)
      }
    }
  }
  return trimmed
}
