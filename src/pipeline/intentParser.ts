import type { IntentJSON } from '../types/pipeline'
import { callLLM, extractJSON } from '../lib/llm'

const PRODUCT_TYPES = new Set([
  'dashboard',
  'landing',
  'onboarding',
  'settings',
  'admin',
  'feed',
  'ecommerce',
  'documentation',
  'portal',
  'mobile-app',
  'form',
  'tool',
  'portfolio',
])
const DENSITIES = new Set(['compact', 'comfortable', 'spacious'])
const SCALES = new Set(['desktop', 'mobile', 'both'])

const SYSTEM_PROMPT = `You are a semantic parser for a UI design system.

Your ONLY job is to extract structured meaning from a natural language product description.
You are NOT a designer. You do NOT make design decisions.
You output JSON that describes what the product IS and WHO uses it.

RULES:
- Return ONLY valid JSON. No explanation, no markdown, no code fences.
- Every field is required. If uncertain, make a reasonable inference from context.
- Do not invent features not implied by the prompt.
- "informationDensity" is determined by: how many data points the primary user must see simultaneously. A doctor monitoring a queue = compact. A consumer reading an article = spacious.
- "emotionalTone" is 2-3 adjectives describing how the UI should FEEL, not look.
- "coreTasks" are the 2-4 primary actions the user performs. Verb phrases only.

OUTPUT SCHEMA:
{
  "productType": "dashboard" | "landing" | "onboarding" | "settings" | "admin" | "feed" | "ecommerce" | "documentation" | "portal" | "mobile-app" | "form" | "tool" | "portfolio",
  "domain": string,
  "primaryUser": string,
  "coreTasks": string[],
  "informationDensity": "compact" | "comfortable" | "spacious",
  "realTimeRequirement": boolean,
  "emotionalTone": string,
  "scale": "desktop" | "mobile" | "both"
}

EXAMPLES:

Input: "A workflow dashboard for doctors managing patient queues"
Output:
{
  "productType": "dashboard",
  "domain": "healthcare",
  "primaryUser": "doctor",
  "coreTasks": ["monitor patient queue", "view patient status", "triage by urgency"],
  "informationDensity": "compact",
  "realTimeRequirement": true,
  "emotionalTone": "calm, clinical, authoritative",
  "scale": "desktop"
}

Input: "Landing page for a new meditation app"
Output:
{
  "productType": "landing",
  "domain": "wellness",
  "primaryUser": "consumer",
  "coreTasks": ["understand product value", "sign up for trial"],
  "informationDensity": "spacious",
  "realTimeRequirement": false,
  "emotionalTone": "calming, warm, trustworthy",
  "scale": "both"
}`

function parseIntentPayload(text: string): IntentJSON {
  const cleanJson = extractJSON(text)
  const parsed = JSON.parse(cleanJson) as Partial<IntentJSON>

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Intent payload is not an object')
  }

  if (!PRODUCT_TYPES.has(String(parsed.productType))) {
    throw new Error('Invalid productType')
  }

  if (!DENSITIES.has(String(parsed.informationDensity))) {
    throw new Error('Invalid informationDensity')
  }

  if (!SCALES.has(String(parsed.scale))) {
    throw new Error('Invalid scale')
  }

  if (!Array.isArray(parsed.coreTasks) || parsed.coreTasks.length === 0 || parsed.coreTasks.some(task => typeof task !== 'string')) {
    throw new Error('Invalid coreTasks')
  }

  if (typeof parsed.domain !== 'string' || typeof parsed.primaryUser !== 'string' || typeof parsed.emotionalTone !== 'string') {
    throw new Error('Invalid string fields in intent payload')
  }

  if (typeof parsed.realTimeRequirement !== 'boolean') {
    throw new Error('Invalid realTimeRequirement')
  }

  return parsed as IntentJSON
}

export async function parseIntent(prompt: string): Promise<IntentJSON> {
  const strictInput = `Return ONLY valid JSON. No explanation.\n\nINPUT:\n${prompt}`
  const firstText = await callLLM(SYSTEM_PROMPT, strictInput)

  try {
    return parseIntentPayload(firstText)
  } catch {
    const retryPrompt = `Your previous output was invalid for strict JSON parsing. Return ONLY valid JSON matching the schema.\n\nOriginal input:\n${prompt}`
    const retryText = await callLLM(SYSTEM_PROMPT, retryPrompt)

    try {
      return parseIntentPayload(retryText)
    } catch {
      throw new Error(`Intent parser returned invalid JSON after retry: ${retryText}`)
    }
  }
}
