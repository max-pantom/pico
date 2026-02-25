/**
 * Pico service streaming adapter.
 * Critic → Director → Rewriter with streaming events.
 */

import { emit } from './eventBus'
import { callLLMNode, extractJSON } from './llmNode'
import type { IntentJSON } from '../src/types/pipeline'
import type { CriticOutput, DirectorOutput } from '../src/types/picoLoop'
import { resolveArchetype, formatArchetypeForPrompt } from '../src/pipeline/productArchetypes'
import { pickDivergentSeeds, formatSeedForPrompt, SEED_LIBRARY } from '../src/pipeline/designWorlds'
import { resolveSurface } from '../src/pipeline/surfaceConfig'
import type { ProductType } from '../src/types/pipeline'

const PICO_SYSTEM = `You are Pico, a senior product designer performing a design review.

You are NOT generating a new product. You are improving an existing interface.
You perform a deliberate design audit pass — like a senior designer reviewing a PR.
You never redesign from scratch. You only improve hierarchy, clarity, accessibility, spacing, emphasis, and interaction quality.

CRITICAL: Output ONLY valid JSON. No explanation, no "Here is the JSON", no markdown fences, no text before or after. Start your response with { and end with }.`

const CRITIC_LAWS = `Spacing must be 8pt scale (4, 8, 12, 16, 24, 32, 48, 64)
No center-stack for apps unless archetype requires (e.g. landing hero)
Primary action must be clear
Mobile touch targets 44px minimum
Contrast AA (WCAG AA for normal text)
Focus rings visible
Archetype first view must read instantly

HARD RULE: If the code has only one button and no dominant surface for camera archetype, archetype_fit score <= 25 and verdict = revise.`

const SEED_CONSTRAINTS = `Avoid card grids unless dashboard archetype.
Use a dominant element.
Keep spacing on 8pt scale (4, 8, 12, 16, 24, 32, 48, 64).
Maintain AA contrast.`

const INTENT_PROMPT = `Extract structured intent. Output ONLY valid JSON, no other text. Start with { and end with }.
{"surface":"marketing|analytical|mobile|immersive|workspace","productType":"dashboard|landing|tool|portfolio|mobile-app|...","domain":"string","primaryUser":"string","coreTasks":["string"],"informationDensity":"compact|comfortable|spacious","realTimeRequirement":boolean,"emotionalTone":"string","scale":"desktop|mobile|both"}`

function parseJSON<T>(raw: string, stage: string): T {
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`${stage} returned invalid JSON: ${msg}. Raw (first 200 chars): ${raw.slice(0, 200)}`)
  }
}

async function parseIntentNode(prompt: string): Promise<IntentJSON> {
  const text = await callLLMNode(INTENT_PROMPT, `Input: ${prompt}`)
  const raw = extractJSON(text)
  const parsed = parseJSON<Partial<IntentJSON> & { surface?: string }>(raw, 'intent')
  const surface = resolveSurface(parsed.surface, (parsed.productType as ProductType) ?? 'landing')
  return {
    surface: surface ?? 'marketing',
    productType: (parsed.productType as IntentJSON['productType']) ?? 'landing',
    domain: parsed.domain ?? 'general',
    primaryUser: parsed.primaryUser ?? 'user',
    coreTasks: Array.isArray(parsed.coreTasks) ? parsed.coreTasks : ['browse', 'interact'],
    informationDensity: (parsed.informationDensity as IntentJSON['informationDensity']) ?? 'comfortable',
    realTimeRequirement: Boolean(parsed.realTimeRequirement),
    emotionalTone: parsed.emotionalTone ?? 'clean, modern',
    scale: (parsed.scale as IntentJSON['scale']) ?? 'both',
  }
}

function buildCriticUserInput(
  intent: IntentJSON,
  archetype: string,
  seedDirective: string,
  code: string,
  instruction?: string
): string {
  const userFocus = instruction?.trim()
    ? `\n\nUSER FOCUS (prioritize these requests):\n${instruction.trim()}\n`
    : ''
  const intentSummary = JSON.stringify({
    surface: intent.surface,
    productType: intent.productType,
    domain: intent.domain,
    primaryUser: intent.primaryUser,
    coreTasks: intent.coreTasks,
  }, null, 2)
  return `CRITIC LAWS:\n${CRITIC_LAWS}\n\nINTENT SUMMARY:\n${intentSummary}\n\nARCHETYPE:\n${archetype}\n\nSEED DIRECTIVE:\n${seedDirective}${userFocus}\n\n${SEED_CONSTRAINTS}\n\nCODE TO EVALUATE:\n\`\`\`tsx\n${code}\n\`\`\`\n\nReturn ONLY valid JSON: {"score":{"overall":0,"hierarchy":0,"composition":0,"rhythm":0,"interaction":0,"accessibility":0,"archetype_fit":0},"verdict":"pass|revise","top_problems":[{"id":"P1","category":"...","severity":"critical|high|medium|low","evidence":"...","fix_intent":"..."}],"missing_elements":[{"id":"M1","why":"...","minimal_addition":"..."}],"non_negotiables":["..."]}`
}

function buildDirectorUserInput(critic: CriticOutput, instruction?: string): string {
  const userFocus = instruction?.trim()
    ? `\n\nUSER FOCUS (prioritize in patch plan):\n${instruction.trim()}\n\n`
    : ''
  return `CRITIC FINDINGS:\n${JSON.stringify(critic)}${userFocus}\n\nReturn ONLY valid JSON: {"patch_plan":[{"id":"A1","priority":1,"action":"rewrite|add|remove|restructure","target":"component|section|layout|styles","instruction":"...","acceptance":["..."]}],"layout_decision":{"pattern":"immersive|split|sidebar|topnav|sheet|stack","dominant_zone":"...","primary_action_placement":"..."},"accessibility_fixes":["..."]}`
}

function buildRewriterUserInput(code: string, patchPlan: DirectorOutput, nonNegotiables: string[]): string {
  return `You are improving an existing interface. You are NOT generating a new product.

ORIGINAL CODE:\n\`\`\`tsx\n${code}\n\`\`\`\n\nPATCH PLAN:\n${JSON.stringify(patchPlan)}\n\nNON-NEGOTIABLES:\n${nonNegotiables.map((n) => `- ${n}`).join('\n')}\n\nReturn ONLY the updated code. No markdown fences. Preserve functionality. Do not change product intent. Do not add unrelated features.`
}

export interface PicoStreamingResult {
  improvedCode: string
  critic1: CriticOutput
  critic2: CriticOutput | null
  archetype: string
  seedFamily: string
  codexInstruction: string
}

function buildCodexInstruction(
  patchPlan: DirectorOutput,
  critic: CriticOutput,
  instruction?: string,
): string {
  const requested = instruction?.trim() ? `User request:\n- ${instruction.trim()}\n\n` : ''
  const planLines = (patchPlan.patch_plan ?? [])
    .sort((a, b) => a.priority - b.priority)
    .map((a) => `- [${a.priority}] ${a.target}: ${a.instruction}`)
    .join('\n')
  const a11yLines = (patchPlan.accessibility_fixes ?? []).map((f) => `- ${f}`).join('\n')
  const guardrails = (critic.non_negotiables ?? []).map((n) => `- ${n}`).join('\n')

  return [
    'Apply the following design changes directly in the existing project files.',
    'Do not start a new app. Update current files in place and keep app behavior intact.',
    'Prefer editing src/App.tsx and nearby UI files only unless required.',
    '',
    requested,
    'Patch plan:',
    planLines || '- No patch actions listed; improve hierarchy, spacing, and clarity based on critic findings.',
    '',
    'Accessibility fixes:',
    a11yLines || '- Keep AA contrast and visible focus indicators.',
    '',
    'Non-negotiables:',
    guardrails || '- Preserve existing product intent.',
    '',
    'After edits, print the final updated TSX code block for the primary UI file.',
  ].join('\n')
}

export async function runPicoStreaming(
  runId: string,
  baselineCode: string,
  prompt: string,
  cancelRef: { cancelled: boolean },
  seedpack?: string,
  instruction?: string
): Promise<PicoStreamingResult> {
  emit(runId, { source: 'pico', kind: 'status', stage: 'critic', message: 'Analyzing interface…' })

  emit(runId, { source: 'pico', kind: 'status', stage: 'critic', message: 'Parsing intent...' })
  const intent = await parseIntentNode(prompt)
  const archetype = resolveArchetype(intent)
  const archetypeStr = formatArchetypeForPrompt(archetype)
  const seed = seedpack
    ? SEED_LIBRARY.find((s) => s.name === seedpack) ?? pickDivergentSeeds(1)[0]!
    : pickDivergentSeeds(1)[0]!
  const seedDirective = formatSeedForPrompt(seed)

  emit(runId, { source: 'pico', kind: 'status', stage: 'critic', message: 'Critic evaluating...' })
  const criticUser = buildCriticUserInput(intent, archetypeStr, seedDirective, baselineCode, instruction)
  const criticText = await callLLMNode(PICO_SYSTEM, criticUser)
  if (cancelRef.cancelled) {
    return {
      improvedCode: baselineCode,
      critic1: {} as CriticOutput,
      critic2: null,
      archetype: archetypeStr,
      seedFamily: seed.family,
      codexInstruction: '',
    }
  }
  const critic1 = parseJSON<CriticOutput>(extractJSON(criticText), 'critic')
  emit(runId, { source: 'pico', kind: 'code', stage: 'critic', message: 'Critic complete', meta: { score: critic1.score } })

  if (critic1.top_problems?.length) {
    const problems = critic1.top_problems.map((p) => `• ${p.fix_intent || p.evidence}`).join('\n')
    emit(runId, { source: 'pico', kind: 'status', stage: 'critic', message: `Problems detected:\n${problems}` })
  }

  if (critic1.verdict === 'pass') {
    emit(runId, { source: 'pico', kind: 'status', stage: 'done', message: 'Critic passed, no rewrite needed' })
    return {
      improvedCode: baselineCode,
      critic1,
      critic2: null,
      archetype: archetypeStr,
      seedFamily: seed.family,
      codexInstruction: 'No major changes required. Keep current implementation and only polish minor spacing/contrast issues.',
    }
  }

  emit(runId, { source: 'pico', kind: 'status', stage: 'direct', message: 'Director planning fixes...' })
  const directorText = await callLLMNode(PICO_SYSTEM, buildDirectorUserInput(critic1, instruction))
  if (cancelRef.cancelled) {
    return {
      improvedCode: baselineCode,
      critic1,
      critic2: null,
      archetype: archetypeStr,
      seedFamily: seed.family,
      codexInstruction: '',
    }
  }
  const patchPlan = parseJSON<DirectorOutput>(extractJSON(directorText), 'director')
  if (patchPlan.patch_plan?.length) {
    const fixes = patchPlan.patch_plan.map((a) => `✓ ${a.instruction?.slice(0, 60) || a.action}`).join('\n')
    emit(runId, { source: 'pico', kind: 'status', stage: 'direct', message: `Applying improvements:\n${fixes}` })
  }

  emit(runId, { source: 'pico', kind: 'status', stage: 'rewrite', message: 'Rebuilding layout…' })
  const rewriterUser = buildRewriterUserInput(baselineCode, patchPlan, critic1.non_negotiables ?? [])
  const improvedText = await callLLMNode(PICO_SYSTEM, rewriterUser)
  if (cancelRef.cancelled) {
    return {
      improvedCode: baselineCode,
      critic1,
      critic2: null,
      archetype: archetypeStr,
      seedFamily: seed.family,
      codexInstruction: '',
    }
  }
  const improvedCode = improvedText.replace(/^```(?:tsx|ts|jsx|js)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
  emit(runId, { source: 'pico', kind: 'code', stage: 'rewrite', message: 'Rewrite complete', meta: { length: improvedCode.length } })

  emit(runId, { source: 'pico', kind: 'status', stage: 'critic', message: 'Verifying improvements…' })
  const critic2Text = await callLLMNode(PICO_SYSTEM, buildCriticUserInput(intent, archetypeStr, seedDirective, improvedCode, instruction))
  if (cancelRef.cancelled) {
    return {
      improvedCode,
      critic1,
      critic2: null,
      archetype: archetypeStr,
      seedFamily: seed.family,
      codexInstruction: '',
    }
  }
  const critic2 = parseJSON<CriticOutput>(extractJSON(critic2Text), 'critic')
  emit(runId, { source: 'pico', kind: 'status', stage: 'done', message: 'Done.' })

  const codexInstruction = buildCodexInstruction(patchPlan, critic1, instruction)

  return {
    improvedCode,
    critic1,
    critic2,
    archetype: archetypeStr,
    seedFamily: seed.family,
    codexInstruction,
  }
}
