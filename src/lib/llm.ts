// Swap this file to change providers. Nothing else changes.

import { Ollama } from 'ollama/browser'

// Always use the Vite proxy for browser client to avoid CORS
const client = new Ollama({
    host: window.location.origin,
    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OLLAMA_API_KEY}`,
    },
})

const MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'deepseek-v3.1:671b-cloud'
const FALLBACK_MODEL = 'gpt-oss:20b-cloud'

function formatLLMError(err: unknown): string {
    if (err instanceof Error) {
        const msg = err.message
        if (msg.includes('500') || msg.toLowerCase().includes('internal server error')) {
            return `Ollama API returned 500. Try setting VITE_OLLAMA_MODEL=gpt-oss:20b-cloud in .env (smaller model). Ensure VITE_OLLAMA_API_KEY is valid at ollama.com/settings/keys.`
        }
        if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
            return `Ollama API auth failed. Set VITE_OLLAMA_API_KEY in .env (create key at ollama.com/settings/keys).`
        }
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
            return `Model not found. Set VITE_OLLAMA_MODEL to a valid cloud model (e.g. gpt-oss:20b-cloud).`
        }
        return msg
    }
    return String(err)
}

export async function callLLM(system: string, user: string): Promise<string> {
    const attempt = async (model: string): Promise<string> => {
        const response = await client.chat({
            model,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
        })
        return response.message.content
    }

    try {
        return await attempt(MODEL)
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const is500 = msg.includes('500') || msg.toLowerCase().includes('internal server error')
        if (is500 && MODEL !== FALLBACK_MODEL) {
            try {
                return await attempt(FALLBACK_MODEL)
            } catch (fallbackErr) {
                throw new Error(formatLLMError(fallbackErr))
            }
        }
        throw new Error(formatLLMError(err))
    }
}

function findBalancedJSON(text: string): string | null {
    const starts: number[] = []

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        if (char === '{' || char === '[') {
            starts.push(i)
        }
    }

    for (const start of starts) {
        const stack: string[] = []
        let inString = false
        let escaped = false

        for (let i = start; i < text.length; i++) {
            const char = text[i]

            if (escaped) {
                escaped = false
                continue
            }

            if (char === '\\') {
                escaped = true
                continue
            }

            if (char === '"') {
                inString = !inString
                continue
            }

            if (inString) continue

            if (char === '{' || char === '[') {
                stack.push(char)
                continue
            }

            if (char === '}' || char === ']') {
                const open = stack[stack.length - 1]
                const match = (open === '{' && char === '}') || (open === '[' && char === ']')
                if (!match) break
                stack.pop()

                if (stack.length === 0) {
                    const candidate = text.slice(start, i + 1)
                    try {
                        JSON.parse(candidate)
                        return candidate
                    } catch {
                        break
                    }
                }
            }
        }
    }

    return null
}

export function extractJSON(text: string): string {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (match) {
        return match[1].trim()
    }

    const balanced = findBalancedJSON(text)
    if (balanced) {
        return balanced
    }

    return text
}
