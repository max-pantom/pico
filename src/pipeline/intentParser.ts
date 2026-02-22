import type { IntentJSON, ProductType } from '../types/pipeline'
import { callLLM, extractJSON } from '../lib/llm'
import { resolveSurface } from './surfaceConfig'

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

const SYSTEM_PROMPT = `You are a semantic parser for a universal interface design system.

Your ONLY job is to extract structured meaning from a natural language product description.
You are NOT a designer. You do NOT make design decisions.
You output JSON that describes what the product IS, WHO uses it, and what KIND of interface it needs.

RULES:
- Return ONLY valid JSON. No explanation, no markdown, no code fences.
- Every field is required. If uncertain, make a reasonable inference from context.
- Do not invent features not implied by the prompt.
- "surface" is the fundamental interface category. Choose based on the product's primary interaction model:
  - "marketing": persuasion-focused — landing pages, portfolios, product sites, storefronts
  - "analytical": data-focused — dashboards, admin panels, monitoring, feeds
  - "mobile": touch-focused — mobile apps, onboarding flows, forms
  - "immersive": atmosphere-focused — games, simulations, portals, spatial experiences
  - "workspace": creation-focused — editors, tools, IDEs, creative software, documentation
- "informationDensity" is determined by: how many data points the primary user must see simultaneously.
- "emotionalTone" is 2-3 adjectives describing how the UI should FEEL, not look.
- "coreTasks" are the 2-4 primary actions the user performs. Verb phrases only.

OUTPUT SCHEMA:
{
  "surface": "marketing" | "analytical" | "mobile" | "immersive" | "workspace",
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

Input: "A crypto trading platform with real-time charts"
Output:
{
  "surface": "analytical",
  "productType": "dashboard",
  "domain": "cryptocurrency",
  "primaryUser": "trader",
  "coreTasks": ["monitor price movements", "execute trades", "analyze portfolio"],
  "informationDensity": "compact",
  "realTimeRequirement": true,
  "emotionalTone": "precise, intense, authoritative",
  "scale": "desktop"
}

Input: "AI startup landing page"
Output:
{
  "surface": "marketing",
  "productType": "landing",
  "domain": "artificial intelligence",
  "primaryUser": "tech decision-maker",
  "coreTasks": ["understand product value", "sign up for trial"],
  "informationDensity": "spacious",
  "realTimeRequirement": false,
  "emotionalTone": "innovative, confident, futuristic",
  "scale": "both"
}

Input: "space strategy game"
Output:
{
  "surface": "immersive",
  "productType": "portal",
  "domain": "space strategy gaming",
  "primaryUser": "gamer",
  "coreTasks": ["manage fleet resources", "explore star systems", "engage in combat"],
  "informationDensity": "comfortable",
  "realTimeRequirement": true,
  "emotionalTone": "epic, tense, atmospheric",
  "scale": "desktop"
}

Input: "mobile journaling app"
Output:
{
  "surface": "mobile",
  "productType": "mobile-app",
  "domain": "personal journaling",
  "primaryUser": "reflective individual",
  "coreTasks": ["write journal entry", "browse past entries", "track mood"],
  "informationDensity": "spacious",
  "realTimeRequirement": false,
  "emotionalTone": "calm, intimate, warm",
  "scale": "mobile"
}

Input: "music production software"
Output:
{
  "surface": "workspace",
  "productType": "tool",
  "domain": "music production",
  "primaryUser": "music producer",
  "coreTasks": ["compose tracks", "mix audio channels", "apply effects"],
  "informationDensity": "compact",
  "realTimeRequirement": true,
  "emotionalTone": "creative, focused, professional",
  "scale": "desktop"
}`

function parseIntentPayload(text: string): IntentJSON {
  const cleanJson = extractJSON(text)
  const parsed = JSON.parse(cleanJson) as Partial<IntentJSON> & { surface?: string }

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

  const surface = resolveSurface(
    parsed.surface,
    parsed.productType as ProductType,
  )

  return { ...parsed, surface } as IntentJSON
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
