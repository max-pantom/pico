import type { IntentJSON, DesignDecisions } from '../types/pipeline'
import { callLLM, extractJSON } from '../lib/llm'

const SYSTEM_PROMPT = `You are a senior product designer making layout and visual decisions for a UI system.

You receive structured intent data and output a complete set of design decisions.
You are NOT generating code. You are NOT generating styles.
You are making DECISIONS that a designer would make before opening Figma.

RETURN ONLY valid JSON. No explanation, no markdown, no code fences.

DESIGN RULES YOU MUST FOLLOW:

LAYOUT STRATEGY:
- "dashboard" + "compact" density → "sidebar-main"
- "landing" or "editorial" → "top-nav-content"
- "tool" with focused task → "split-panel"
- real-time monitoring or operations-heavy dashboards → "dense-grid"
- "canvas" or creative → "canvas"

NAVIGATION POSITION:
- Expert primary user (doctor, engineer, analyst) → "left-rail" (they can learn it)
- Consumer primary user → "top" (immediately scannable)
- Mobile scale → "bottom"
- Single-task tools → "none"

DENSITY:
- "compact" informationDensity intent → "compact"
- "comfortable" → "comfortable"
- "spacious" → "spacious"

VISUAL TONE:
- domain "healthcare" clinical workflows -> "clinical"
- domain "finance" + real-time ops -> "bloomberg"
- domain "saas" dashboards -> "stripe"
- domain "developer" or "devtools" -> "vercel"
- domain "productivity" + writing workflows -> "notion"
- domain "education" for children -> "duolingo"
- domain "gaming" or "entertainment" -> "bold"
- domain "media" or "publishing" -> "editorial"
- dark product tooling -> "linear"
- wellness health tracking for consumers -> "apple-health"

HARD TONE RULES - these override all other rules:
- domain contains "health" AND (primaryUser contains "doctor" OR primaryUser contains "patient") -> visualTone MUST be "clinical"
- domain contains "health" AND primaryUser contains "consumer" -> visualTone MUST be "apple-health"
- domain contains "finance" AND realTimeRequirement is true -> visualTone MUST be "bloomberg"
- domain contains "saas" AND productType is "dashboard" -> visualTone MUST be "stripe"
- domain contains "developer" OR domain contains "devtools" -> visualTone MUST be "vercel"
- domain contains "child" OR domain contains "family" OR domain contains "parent" -> visualTone MUST be "duolingo"
- domain contains "media" OR domain contains "publish" OR domain contains "journal" -> visualTone MUST be "editorial"
- domain contains "gaming" OR domain contains "entertainment" -> visualTone MUST be "bold"
- productType is "tool" AND emotionalTone contains "dark" -> visualTone MUST be "linear"
- default fallback -> "minimal"

TYPOGRAPHY STRATEGY:
- "clinical" or "minimal" tone -> "utilitarian"
- "bloomberg" or "linear" -> "terminal"
- "stripe" or "vercel" -> "display"
- "notion" or "editorial" -> "prose"
- "duolingo" or "apple-health" -> "display"

ACCENT USAGE:
- "clinical": accent is for status signals only (urgent, warning, error). Not for decoration.
- "minimal": accent for primary actions and links only.
- "bold": accent freely — it IS the brand.
- "playful": accent for delight and primary CTAs.
- "editorial": accent for pull quotes and key moments only.

COMPONENT MORPHOLOGY:
- You MUST choose exact enum values for componentMorphology.
- cards: "flat" | "elevated" | "bordered" | "panel"
- tables: "dense" | "striped" | "minimal"
- buttons: "label" | "icon-label" | "pill"
- Use these defaults by visual tone:
  - clinical -> cards:"bordered", tables:"dense", buttons:"label"
  - minimal -> cards:"flat", tables:"minimal", buttons:"label"
  - bold -> cards:"elevated", tables:"striped", buttons:"pill"
  - playful -> cards:"panel", tables:"striped", buttons:"pill"
  - editorial -> cards:"flat", tables:"minimal", buttons:"icon-label"
  - stripe -> cards:"elevated", tables:"minimal", buttons:"label"
  - linear -> cards:"bordered", tables:"dense", buttons:"icon-label"
  - vercel -> cards:"flat", tables:"minimal", buttons:"label"
  - bloomberg -> cards:"bordered", tables:"dense", buttons:"label"
  - notion -> cards:"flat", tables:"minimal", buttons:"label"
  - duolingo -> cards:"panel", tables:"striped", buttons:"pill"
  - apple-health -> cards:"elevated", tables:"minimal", buttons:"pill"

RULES:
1. Return ONLY valid JSON, no markdown formatting.
2. The "layoutStrategy" must be one of: "sidebar-main", "top-nav-content", "split-panel", "dense-grid", "canvas".
3. The "navigationPosition" must be one of: "left-rail", "top", "bottom", "none".
4. The "density" must be one of: "compact", "comfortable", "spacious".
5. The "visualTone" must be one of: "clinical", "minimal", "bold", "playful", "editorial", "stripe", "linear", "vercel", "bloomberg", "notion", "duolingo", "apple-health".
6. Select a specific Tailwind color for "primaryColorFamily" (e.g. "blue-600", "emerald-500", "violet-600", "rose-500").
7. Select a strategy for "typographyStrategy": "utilitarian", "expressive", "editorial", "display", "prose", "terminal".
8. The "componentMorphology" dictates structural diversity. You must choose:
   - "cards": "flat", "elevated", "bordered", or "panel"
   - "tables": "dense", "striped", or "minimal"
   - "buttons": "label", "icon-label", or "pill"
   - "inputs": "underlined", "filled", or "outlined"
9. The "interactionModel" must be one of: "click-to-drill", "inline-expand", "modal", "side-panel".
10. The "hierarchyFlow" is an array of 3-5 string labels that represent the primary navigation items.

EXAMPLE OUTPUT:
{
  "layoutStrategy": "sidebar-main",
  "navigationPosition": "left-rail",
  "density": "comfortable",
  "visualTone": "minimal",
  "primaryColorFamily": "emerald-600",
  "accentUsage": "subtle",
  "typographyStrategy": "utilitarian",
  "componentMorphology": {
    "cards": "elevated",
    "tables": "striped",
    "buttons": "pill",
    "inputs": "outlined"
  },
  "hierarchyFlow": ["Dashboard", "Projects", "Team", "Settings"],
  "interactionModel": "modal"
}
`

export async function reasonDesign(
  intent: IntentJSON,
  critique?: string
): Promise<DesignDecisions> {
  const userContent = critique
    ? `${JSON.stringify(intent, null, 2)}\n\nPrevious output failed quality checks:\n${critique}\nRevise your decisions accordingly.`
    : JSON.stringify(intent, null, 2)

  const text = await callLLM(SYSTEM_PROMPT, userContent)
  const cleanJson = extractJSON(text)

  try {
    return JSON.parse(cleanJson) as DesignDecisions
  } catch {
    throw new Error(`Design reasoner returned invalid JSON: ${text}`)
  }
}
