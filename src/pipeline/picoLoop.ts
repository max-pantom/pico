/**
 * Pico Opinion Loop
 *
 * 1. Codex (or fallback) generates baseline UI
 * 2. Pico critic scores it against laws
 * 3. Pico director chooses concrete fixes
 * 4. Pico rewriter applies fixes to code
 * 5. Pico re-critic checks quality gate
 * 6. Output left/right compare
 */

import { callLLM, extractJSON } from '../lib/llm'
import { parseIntent } from './intentParser'
import { resolveArchetype, formatArchetypeForPrompt } from './productArchetypes'
import { pickDivergentSeeds, formatSeedForPrompt } from './designWorlds'
import { runPipeline } from './pipeline'
import type { IntentJSON } from '../types/pipeline'
import type { CreativeSeed } from './designWorlds'
import type {
    CriticOutput,
    DirectorOutput,
    PicoLoopResult,
} from '../types/picoLoop'

const PICO_SYSTEM = `You are Pico, a senior product designer and design critic. Your job is to upgrade UI outputs from coding agents. You do not invent new product requirements. You keep the user intent. You enforce design laws: hierarchy, composition, rhythm, interaction, accessibility, archetype fitness. You speak in structured JSON only when asked.

You must never output apologies or commentary. Only outputs requested by the schema.`

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

export type GetBaselineFn = (prompt: string, intent: IntentJSON, seed: CreativeSeed) => Promise<string>

/** Fallback: use legacy pipeline when Codex is not available */
export async function getBaselineFromPipeline(
    prompt: string,
    _intent: IntentJSON,
    _seed: CreativeSeed
): Promise<string> {
    const output = await runPipeline(prompt, undefined, { useDesignCritic: false })
    return output.reactSourceCode ?? ''
}

/** Run Codex via IPC when in Electron */
export async function getBaselineFromCodex(
    prompt: string,
    _intent: IntentJSON,
    _seed: CreativeSeed
): Promise<string> {
    const api = typeof window !== 'undefined' ? window.pico : undefined
    if (!api?.codex?.run) {
        throw new Error('Codex not available. Run in Electron or use pipeline fallback.')
    }
    const workspacePath = (await api.workspace?.getSelectedPath?.()) ?? ''
    return api.codex.run(prompt, workspacePath)
}

function buildCriticUserInput(
    intent: IntentJSON,
    archetype: string,
    seedDirective: string,
    code: string
): string {
    const intentSummary = JSON.stringify({
        surface: intent.surface,
        productType: intent.productType,
        domain: intent.domain,
        primaryUser: intent.primaryUser,
        coreTasks: intent.coreTasks,
    }, null, 2)

    return `CRITIC LAWS:
${CRITIC_LAWS}

INTENT SUMMARY:
${intentSummary}

ARCHETYPE:
${archetype}

SEED DIRECTIVE:
${seedDirective}

${SEED_CONSTRAINTS}

CODE TO EVALUATE:
\`\`\`tsx
${code}
\`\`\`

Return ONLY valid JSON matching this schema:
{
  "score": { "overall": 0, "hierarchy": 0, "composition": 0, "rhythm": 0, "interaction": 0, "accessibility": 0, "archetype_fit": 0 },
  "verdict": "pass|revise",
  "top_problems": [{ "id": "P1", "category": "hierarchy|composition|rhythm|interaction|accessibility|archetype_fit", "severity": "critical|high|medium|low", "evidence": "string", "fix_intent": "string" }],
  "missing_elements": [{ "id": "M1", "why": "string", "minimal_addition": "string" }],
  "non_negotiables": ["string"]
}

Scores 0-100. verdict "pass" when overall >= 70 and no critical problems.`
}

function buildDirectorUserInput(critic: CriticOutput): string {
    return `CRITIC FINDINGS:
${JSON.stringify(critic, null, 2)}

DIRECTOR LAYOUT CONSTRAINT: If screenType is app and layout is centered stack, replace with archetype-appropriate pattern:
- Camera: immersive viewfinder
- Music: now playing immersive or library list
- Dashboard: overview with left nav or top filters
- Messaging: split list or full thread

Return ONLY valid JSON:
{
  "patch_plan": [{ "id": "A1", "priority": 1, "action": "rewrite|add|remove|restructure", "target": "component|section|layout|styles", "instruction": "string", "acceptance": ["string"] }],
  "layout_decision": { "pattern": "immersive|split|sidebar|topnav|sheet|stack", "dominant_zone": "string", "primary_action_placement": "string" },
  "accessibility_fixes": ["string"]
}`
}

function buildRewriterUserInput(
    code: string,
    patchPlan: DirectorOutput,
    nonNegotiables: string[]
): string {
    return `ORIGINAL CODE:
\`\`\`tsx
${code}
\`\`\`

PATCH PLAN:
${JSON.stringify(patchPlan, null, 2)}

NON-NEGOTIABLES:
${nonNegotiables.map((n) => `- ${n}`).join('\n')}

STRICT: Return ONLY the updated code. No markdown fences, no explanation. Preserve functionality. Use existing component patterns.`
}

async function runCritic(
    intent: IntentJSON,
    archetype: string,
    seedDirective: string,
    code: string
): Promise<CriticOutput> {
    const user = buildCriticUserInput(intent, archetype, seedDirective, code)
    const text = await callLLM(PICO_SYSTEM, user)
    const raw = extractJSON(text)
    const parsed = JSON.parse(raw) as CriticOutput
    if (!parsed.score || !parsed.verdict) {
        throw new Error(`Critic returned invalid JSON: ${raw}`)
    }
    return parsed
}

async function runDirector(critic: CriticOutput): Promise<DirectorOutput> {
    const user = buildDirectorUserInput(critic)
    const text = await callLLM(PICO_SYSTEM, user)
    const raw = extractJSON(text)
    const parsed = JSON.parse(raw) as DirectorOutput
    if (!parsed.patch_plan || !parsed.layout_decision) {
        throw new Error(`Director returned invalid JSON: ${raw}`)
    }
    return parsed
}

async function runRewriter(
    code: string,
    patchPlan: DirectorOutput,
    nonNegotiables: string[]
): Promise<string> {
    const user = buildRewriterUserInput(code, patchPlan, nonNegotiables)
    const text = await callLLM(PICO_SYSTEM, user)
    // Strip markdown code fences if present
    const stripped = text.replace(/^```(?:tsx|ts|jsx|js)?\s*\n?/, '').replace(/\n?```\s*$/, '')
    return stripped.trim()
}

export interface PicoLoopOptions {
    getBaseline: GetBaselineFn
    seed?: CreativeSeed
    maxRewrites?: number
}

export async function runPicoLoop(
    prompt: string,
    onProgress?: (stage: string) => void,
    options?: PicoLoopOptions
): Promise<PicoLoopResult> {
    const { getBaseline, seed, maxRewrites = 1 } = options ?? { getBaseline: getBaselineFromPipeline }

    onProgress?.('parsing')
    const intent = await parseIntent(prompt)
    const archetype = resolveArchetype(intent)
    const archetypeStr = formatArchetypeForPrompt(archetype)
    const chosenSeed = seed ?? pickDivergentSeeds(1)[0]!
    const seedDirective = formatSeedForPrompt(chosenSeed)

    onProgress?.('generating')
    const baselineCode = await getBaseline(prompt, intent, chosenSeed)
    if (!baselineCode.trim()) {
        throw new Error('Baseline generation produced empty code')
    }

    onProgress?.('critiquing')
    const critic1 = await runCritic(intent, archetypeStr, seedDirective, baselineCode)

    if (critic1.verdict === 'pass') {
        return {
            baselineCode,
            improvedCode: baselineCode,
            critic1,
            critic2: null,
            patchPlan: null,
            seedFamily: chosenSeed.family,
            verdict: 'pass',
        }
    }

    let improvedCode = baselineCode
    let directorOutput: DirectorOutput | null = null
    let critic2: CriticOutput | null = null

    for (let i = 0; i < maxRewrites; i++) {
        onProgress?.(`directing (${i + 1}/${maxRewrites})`)
        directorOutput = await runDirector(critic1)

        onProgress?.(`rewriting (${i + 1}/${maxRewrites})`)
        improvedCode = await runRewriter(
            improvedCode,
            directorOutput,
            critic1.non_negotiables ?? []
        )

        onProgress?.('re-critiquing')
        critic2 = await runCritic(intent, archetypeStr, seedDirective, improvedCode)

        if (critic2.verdict === 'pass') break
    }

    return {
        baselineCode,
        improvedCode,
        critic1,
        critic2,
        patchPlan: directorOutput,
        seedFamily: chosenSeed.family,
        verdict: critic2?.verdict ?? 'revise',
    }
}
