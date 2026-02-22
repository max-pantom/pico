import { callLLM, extractJSON } from '../lib/llm'
import type { IntentJSON, LayoutNode, RuntimeDesignTokens } from '../types/pipeline'
import { buildFirstScreen, getSurfaceDefinition } from './surfaceConfig'
import type { ScreenContent } from './surfaceConfig'
import { resolveArchetype, formatArchetypeForPrompt } from './productArchetypes'
import type { ProductArchetype } from './productArchetypes'
import { SEED_LIBRARY, pickDivergentSeeds, formatSeedForPrompt } from './designWorlds'
import type { CreativeSeed } from './designWorlds'

export type { CreativeSeed } from './designWorlds'

export interface ExplorationTokens {
    colors: {
        background: string
        surface: string
        primary: string
        accent: string
        text: string
        muted: string
        border: string
    }
    typography: {
        fontFamily: 'systemSans' | 'systemSerif' | 'systemMono'
        headingSize: string
        headingWeight: string
        headingTracking: string
        bodySize: string
    }
    spacing: {
        heroPadding: string
        headlineMargin: string
    }
    radius: {
        button: string
        card: string
    }
    shadow: 'none' | 'soft' | 'lift' | 'heavy' | 'glow'
}

export interface Exploration {
    id: string
    title: string
    philosophy: string
    seed: CreativeSeed
    tokens: ExplorationTokens
    screen: ScreenContent
    screenLayout: LayoutNode
}

type CompositionFamily =
    | 'editorial-asymmetry'
    | 'strict-grid'
    | 'immersive-fullbleed'
    | 'utility-shell'

type CreativeRisk = 'safe' | 'balanced' | 'wild'

interface DirectionBrief {
    concept: string
    audienceFrame: string
    brandStance: string
    visualTension: string
    compositionFamily: CompositionFamily
    hierarchyThesis: string
    focalElement: string
    risk: CreativeRisk
}

interface ReferenceSignals {
    labels: string[]
    principles: string[]
}

function buildSystemPrompt(
    intent: IntentJSON,
    archetype: ProductArchetype,
    brief: DirectionBrief,
): string {
    const surfaceDef = getSurfaceDefinition(intent.surface)

    return `You are Pico, an AI creative director for interface design.
You are NOT a coding assistant. You are a product designer.
You design for ANY type of digital interface — not just websites.

You are designing the FIRST REAL SCREEN of a product — a ${surfaceDef.label}.
${surfaceDef.explorationPrompt}

${formatArchetypeForPrompt(archetype)}

DESIGN PHILOSOPHY:
- Interpret the request as a PRODUCT CATEGORY, not a feature.
- Construct the interface users EXPECT when opening this type of app for the first time.
- Never output a single isolated control. Always output a complete believable screen.
- The result must look like a shippable product screenshot, not a wireframe or stub.
- This direction must follow this composition family: ${brief.compositionFamily}.
- Risk level is ${brief.risk}. Safe = stable hierarchy. Balanced = controlled contrast. Wild = aggressive contrast and spatial rhythm.
- Prioritize one dominant focal element: ${brief.focalElement}.
- Hierarchy thesis: ${brief.hierarchyThesis}.

The first view is: ${surfaceDef.firstViewLabel}.

Output ONLY valid JSON matching this schema:

{
  "title": "2-3 word direction name",
  "philosophy": "one sentence design thesis",
  "tokens": {
    "colors": {
      "background": "#hex",
      "surface": "#hex",
      "primary": "#hex",
      "accent": "#hex",
      "text": "#hex",
      "muted": "#hex",
      "border": "#hex"
    },
    "typography": {
      "fontFamily": "systemSans | systemSerif | systemMono",
      "headingSize": "Npx",
      "headingWeight": "100-900",
      "headingTracking": "Nem",
      "bodySize": "Npx"
    },
    "spacing": {
      "heroPadding": "Npx",
      "headlineMargin": "Npx"
    },
    "radius": {
      "button": "Npx",
      "card": "Npx"
    },
    "shadow": "none | soft | lift | heavy | glow"
  },
  "screen": {
    "headline": "primary heading or title for this screen",
    "subheadline": "supporting description or subtitle",
    "ctaPrimary": "primary action button label",
    "ctaSecondary": "secondary action label or null",
    "navItems": ["nav item 1", "nav item 2", "nav item 3", "nav item 4"],
    "metrics": [
      { "label": "metric name", "value": "metric value" },
      { "label": "metric name", "value": "metric value" },
      { "label": "metric name", "value": "metric value" }
    ],
    "listItems": [
      "realistic list item with context|timestamp",
      "another realistic list item|timestamp",
      "third list item|timestamp"
    ],
    "featureLabels": ["feature or section 1", "feature or section 2", "feature or section 3"],
    "backgroundTreatment": "solid | gradient | mesh"
  }
}

CONTENT RULES:
- "headline" is the primary text on screen. For dashboards it is the page title. For games it is the title or status. For marketing it is the hero headline.
- "navItems" are sidebar or top nav labels (max 6).
- "metrics" are KPI-style stats with realistic domain-specific values. Include 3-4.
- "listItems" are feed items, recent activity, or recent entries. Include a pipe-separated timestamp. Include 3-5.
- "featureLabels" are feature names, tab labels, or action categories (3-4).
- ALL content must be realistic and domain-specific. No placeholders like "Item 1" or "Feature A".
- ALL values must be believable. Stats should have real-looking numbers, not "N/A".
- The screen must contain enough content to represent ALL required modules from the archetype.`
}

const FALLBACK_EXPLORATION_TOKENS: ExplorationTokens = {
    colors: {
        background: '#0b1020',
        surface: '#121a2f',
        primary: '#2563eb',
        accent: '#7c3aed',
        text: '#f8fafc',
        muted: '#94a3b8',
        border: '#334155',
    },
    typography: {
        fontFamily: 'systemSans',
        headingSize: '48px',
        headingWeight: '800',
        headingTracking: '-0.02em',
        bodySize: '16px',
    },
    spacing: {
        heroPadding: '48px',
        headlineMargin: '16px',
    },
    radius: {
        button: '999px',
        card: '20px',
    },
    shadow: 'lift',
}

function randomId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return `exp-${Math.random().toString(36).slice(2, 10)}`
}

function parsePx(input: string): number {
    const n = Number.parseInt(input, 10)
    return Number.isFinite(n) ? n : 0
}

function toPx(input: number, fallback: number): string {
    return `${Math.max(input || fallback, 8)}px`
}

function safeString(val: unknown, fallback: string): string {
    return typeof val === 'string' && val.trim().length > 0 ? val : fallback
}

function safeStringArray(val: unknown, fallback: string[]): string[] {
    if (!Array.isArray(val)) return fallback
    const strings = val.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    return strings.length > 0 ? strings : fallback
}

function safeMetrics(val: unknown): ScreenContent['metrics'] {
    if (!Array.isArray(val)) return []
    return val
        .filter((v): v is { label: string; value: string } =>
            v && typeof v === 'object' && typeof v.label === 'string' && typeof v.value === 'string')
        .slice(0, 4)
}

const VALID_TREATMENTS = new Set(['solid', 'gradient', 'mesh'])
const PLACEHOLDER_PATTERN = /\b(item\s*\d+|feature\s*[a-z]|lorem|placeholder|n\/a|todo)\b/i
const COMPOSITIONS: CompositionFamily[] = [
    'editorial-asymmetry',
    'strict-grid',
    'immersive-fullbleed',
    'utility-shell',
]

const REFERENCE_LIBRARY: Array<{
    label: string
    keywords: string[]
    principles: string[]
}> = [
    {
        label: 'Linear',
        keywords: ['linear'],
        principles: ['dense utility shell', 'subtle contrast', 'crisp hierarchy'],
    },
    {
        label: 'Stripe',
        keywords: ['stripe'],
        principles: ['editorial hero scale', 'tight typography rhythm', 'high product confidence'],
    },
    {
        label: 'Apple',
        keywords: ['apple'],
        principles: ['calm premium spacing', 'single dominant focal point', 'minimal chrome'],
    },
    {
        label: 'Notion',
        keywords: ['notion'],
        principles: ['quiet utility layout', 'neutral palette', 'content-first hierarchy'],
    },
    {
        label: 'Duolingo',
        keywords: ['duolingo'],
        principles: ['playful cadence', 'high feedback clarity', 'rounded energetic visuals'],
    },
]

function parseScreen(raw: unknown, intent: IntentJSON): ScreenContent {
    const s = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
    const fallbackTasks = intent.coreTasks.slice(0, 4)

    return {
        headline: safeString(s.headline, intent.domain),
        subheadline: safeString(s.subheadline, `Built for ${intent.primaryUser}`),
        ctaPrimary: safeString(s.ctaPrimary, 'Get Started'),
        ctaSecondary: typeof s.ctaSecondary === 'string' ? s.ctaSecondary : null,
        navItems: safeStringArray(s.navItems, ['Overview', 'Details', 'Settings']),
        metrics: safeMetrics(s.metrics),
        listItems: safeStringArray(s.listItems, []),
        featureLabels: safeStringArray(s.featureLabels, fallbackTasks),
        backgroundTreatment: VALID_TREATMENTS.has(String(s.backgroundTreatment))
            ? s.backgroundTreatment as ScreenContent['backgroundTreatment']
            : 'solid',
    }
}

function countModuleHits(screen: ScreenContent, archetype: ProductArchetype): number {
    const blob = [
        screen.headline,
        screen.subheadline,
        screen.ctaPrimary,
        screen.ctaSecondary ?? '',
        ...screen.navItems,
        ...screen.metrics.map(m => `${m.label} ${m.value}`),
        ...screen.listItems,
        ...screen.featureLabels,
    ].join(' ').toLowerCase()

    return archetype.requiredModules.filter(mod => {
        const words = mod.split('-')
        return words.some(w => blob.includes(w))
    }).length
}

const MIN_MODULE_HITS = 3

function extractReferenceSignals(sourcePrompt: string, intent: IntentJSON): ReferenceSignals {
    const text = [sourcePrompt, intent.domain, intent.emotionalTone, ...intent.coreTasks]
        .join(' ')
        .toLowerCase()
    const labels = new Set<string>()
    const principles = new Set<string>()

    for (const ref of REFERENCE_LIBRARY) {
        if (ref.keywords.some(keyword => text.includes(keyword))) {
            labels.add(ref.label)
            for (const principle of ref.principles) principles.add(principle)
        }
    }

    return {
        labels: Array.from(labels),
        principles: Array.from(principles),
    }
}

function inferRisk(seed: CreativeSeed, sourcePrompt: string, index: number): CreativeRisk {
    const text = `${seed.directive} ${sourcePrompt}`.toLowerCase()
    if (
        text.includes('wild') ||
        text.includes('bold') ||
        text.includes('experimental') ||
        text.includes('brutalist')
    ) return 'wild'
    if (text.includes('minimal') || text.includes('calm') || text.includes('restrained')) return 'safe'
    return index % 2 === 0 ? 'balanced' : 'wild'
}

function pickComposition(index: number, count: number, risk: CreativeRisk): CompositionFamily {
    if (count >= 4) return COMPOSITIONS[index % COMPOSITIONS.length]!
    if (risk === 'wild') return index % 2 === 0 ? 'editorial-asymmetry' : 'immersive-fullbleed'
    if (risk === 'safe') return 'utility-shell'
    return index % 2 === 0 ? 'strict-grid' : 'editorial-asymmetry'
}

function fallbackBrief(
    intent: IntentJSON,
    seed: CreativeSeed,
    risk: CreativeRisk,
    composition: CompositionFamily,
): DirectionBrief {
    return {
        concept: `${intent.domain} designed as ${seed.name}`,
        audienceFrame: intent.primaryUser,
        brandStance: `${seed.family} aesthetic`,
        visualTension: seed.directive.slice(0, 80),
        compositionFamily: composition,
        hierarchyThesis: `Lead with ${intent.coreTasks[0] ?? 'primary action'} and support with clear secondary blocks`,
        focalElement: intent.coreTasks[0] ?? 'primary hero region',
        risk,
    }
}

function parseBrief(raw: string, fallback: DirectionBrief): DirectionBrief {
    const parsed = JSON.parse(extractJSON(raw)) as Partial<DirectionBrief>
    const composition = COMPOSITIONS.includes(parsed.compositionFamily as CompositionFamily)
        ? parsed.compositionFamily as CompositionFamily
        : fallback.compositionFamily
    const risk: CreativeRisk = parsed.risk === 'safe' || parsed.risk === 'balanced' || parsed.risk === 'wild'
        ? parsed.risk
        : fallback.risk

    return {
        concept: safeString(parsed.concept, fallback.concept),
        audienceFrame: safeString(parsed.audienceFrame, fallback.audienceFrame),
        brandStance: safeString(parsed.brandStance, fallback.brandStance),
        visualTension: safeString(parsed.visualTension, fallback.visualTension),
        compositionFamily: composition,
        hierarchyThesis: safeString(parsed.hierarchyThesis, fallback.hierarchyThesis),
        focalElement: safeString(parsed.focalElement, fallback.focalElement),
        risk,
    }
}

async function generateDirectionBrief(
    intent: IntentJSON,
    archetype: ProductArchetype,
    seed: CreativeSeed,
    references: ReferenceSignals,
    index: number,
    count: number,
): Promise<DirectionBrief> {
    const inferredRisk = inferRisk(seed, `${intent.emotionalTone} ${references.principles.join(' ')}`, index)
    const forcedComposition = pickComposition(index, count, inferredRisk)
    const fallback = fallbackBrief(intent, seed, inferredRisk, forcedComposition)
    const prompt = `You are Pico's creative director. Build a concise direction brief.
Return ONLY valid JSON.

Schema:
{
  "concept": string,
  "audienceFrame": string,
  "brandStance": string,
  "visualTension": string,
  "compositionFamily": "editorial-asymmetry" | "strict-grid" | "immersive-fullbleed" | "utility-shell",
  "hierarchyThesis": string,
  "focalElement": string,
  "risk": "safe" | "balanced" | "wild"
}

Rules:
- Composition must be distinct from generic shell-first layouts.
- Wild risk means bold asymmetry or full-bleed emphasis.
- Keep it product-believable for archetype modules.
- Do not describe code, only design intent.
`

    const userMessage = `Intent:
${JSON.stringify(intent, null, 2)}

Archetype:
${JSON.stringify({ layout: archetype.layout, requiredModules: archetype.requiredModules }, null, 2)}

Seed:
${JSON.stringify(seed, null, 2)}

Reference principles:
${references.principles.join(' | ') || 'none'}

Required seed values:
- compositionFamily: ${forcedComposition}
- risk: ${inferredRisk}
`

    try {
        const raw = await callLLM(prompt, userMessage)
        return parseBrief(raw, fallback)
    } catch {
        return fallback
    }
}

function applyRiskToTokens(tokens: ExplorationTokens, risk: CreativeRisk): ExplorationTokens {
    const next: ExplorationTokens = {
        ...tokens,
        typography: { ...tokens.typography },
        spacing: { ...tokens.spacing },
        radius: { ...tokens.radius },
    }
    if (risk === 'wild') {
        next.typography.headingSize = toPx(parsePx(tokens.typography.headingSize) + 10, 56)
        next.spacing.heroPadding = toPx(parsePx(tokens.spacing.heroPadding) + 12, 56)
        if (next.shadow === 'none' || next.shadow === 'soft') next.shadow = 'heavy'
    } else if (risk === 'safe') {
        next.typography.headingSize = toPx(parsePx(tokens.typography.headingSize) - 6, 38)
        next.spacing.heroPadding = toPx(parsePx(tokens.spacing.heroPadding) - 8, 32)
        if (next.shadow === 'heavy') next.shadow = 'soft'
    }
    return next
}

function buildDirectedFirstScreen(
    intent: IntentJSON,
    screen: ScreenContent,
    brand: string,
    brief: DirectionBrief,
): LayoutNode {
    const heroLayout = brief.compositionFamily === 'immersive-fullbleed'
        ? 'fullbleed'
        : brief.compositionFamily === 'editorial-asymmetry'
            ? 'left-aligned'
            : 'centered'

    switch (brief.compositionFamily) {
        case 'editorial-asymmetry':
            return {
                component: 'Shell',
                children: [
                    {
                        component: 'TopNav',
                        props: {
                            title: brand,
                            links: screen.navItems.slice(0, 4),
                            ctaLabel: screen.ctaPrimary,
                        },
                    },
                    {
                        component: 'MainContent',
                        children: [
                            {
                                component: 'HeroSection',
                                props: {
                                    headline: screen.headline,
                                    subheadline: screen.subheadline,
                                    ctaPrimary: screen.ctaPrimary,
                                    ctaSecondary: screen.ctaSecondary,
                                    backgroundTreatment: screen.backgroundTreatment,
                                    layout: heroLayout,
                                },
                            },
                            {
                                component: 'WorkGrid',
                                props: {
                                    title: brief.focalElement,
                                    projects: screen.featureLabels.slice(0, 4),
                                },
                            },
                            {
                                component: 'FeatureGrid',
                                props: {
                                    title: brief.concept,
                                    features: screen.featureLabels.slice(0, 4),
                                },
                            },
                        ],
                    },
                ],
            }
        case 'strict-grid':
            return {
                component: 'Shell',
                children: [
                    {
                        component: 'Sidebar',
                        children: screen.navItems.slice(0, 6).map((item, i) => ({
                            component: 'NavItem' as const,
                            props: { label: item, active: i === 0 },
                        })),
                    },
                    {
                        component: 'MainContent',
                        children: [
                            {
                                component: 'Header',
                                props: {
                                    title: screen.headline || brand,
                                    subtitle: brief.hierarchyThesis,
                                },
                            },
                            {
                                component: 'KPIRow',
                                props: { items: screen.metrics.slice(0, 4) },
                            },
                            {
                                component: 'DataTable',
                                props: {
                                    title: 'Core Data',
                                    columns: screen.metrics.slice(0, 3).map(m => m.label),
                                    rows: [screen.metrics.slice(0, 3).map(m => m.value)],
                                },
                            },
                            {
                                component: 'ActivityFeed',
                                props: { title: 'Recent', events: screen.listItems.slice(0, 4) },
                            },
                        ],
                    },
                ],
            }
        case 'immersive-fullbleed':
            return {
                component: 'MainContent',
                children: [
                    {
                        component: 'HeroSection',
                        props: {
                            headline: screen.headline || brand,
                            subheadline: screen.subheadline,
                            ctaPrimary: screen.ctaPrimary,
                            ctaSecondary: screen.ctaSecondary,
                            backgroundTreatment: 'mesh',
                            layout: 'fullbleed',
                        },
                    },
                    {
                        component: 'KPIRow',
                        props: { items: screen.metrics.slice(0, 4) },
                    },
                    {
                        component: 'Tabs',
                        props: { tabs: screen.featureLabels.slice(0, 5) },
                    },
                    {
                        component: 'WorkGrid',
                        props: {
                            title: intent.domain,
                            projects: screen.featureLabels.slice(0, 6),
                        },
                    },
                ],
            }
        case 'utility-shell':
            return {
                component: 'Shell',
                children: [
                    {
                        component: 'Sidebar',
                        children: screen.navItems.slice(0, 6).map((item, i) => ({
                            component: 'NavItem' as const,
                            props: { label: item, active: i === 0 },
                        })),
                    },
                    {
                        component: 'MainContent',
                        children: [
                            {
                                component: 'Header',
                                props: {
                                    title: screen.headline || brand,
                                    subtitle: screen.subheadline,
                                },
                            },
                            {
                                component: 'Tabs',
                                props: { tabs: screen.featureLabels.slice(0, 5) },
                            },
                            {
                                component: 'Card',
                                props: { title: brief.focalElement },
                                children: [
                                    {
                                        component: 'ChartBlock',
                                        props: { type: 'area', title: '' },
                                    },
                                ],
                            },
                            {
                                component: 'ActivityFeed',
                                props: { title: 'Updates', events: screen.listItems.slice(0, 4) },
                            },
                        ],
                    },
                ],
            }
        default:
            return buildFirstScreen(intent.surface, screen, brand)
    }
}

function layoutFingerprint(node: LayoutNode): string {
    const childFingerprints = (node.children ?? []).map(layoutFingerprint).join(',')
    return `${node.component}(${node.children?.length ?? 0})[${childFingerprints}]`
}

function parseExploration(
    raw: string,
    seed: CreativeSeed,
    intent: IntentJSON,
    archetype: ProductArchetype,
    brief: DirectionBrief,
): Exploration {
    const parsed = JSON.parse(extractJSON(raw)) as Record<string, unknown>

    const safeTokens = parsed.tokens && typeof parsed.tokens === 'object'
        ? parsed.tokens as ExplorationTokens
        : FALLBACK_EXPLORATION_TOKENS

    const screen = parseScreen(parsed.screen, intent)

    const hits = countModuleHits(screen, archetype)
    const finalScreen = hits >= MIN_MODULE_HITS
        ? screen
        : fallbackScreen(intent)

    const screenLayout = buildDirectedFirstScreen(intent, finalScreen, intent.domain, brief)

    return {
        id: randomId(),
        title: safeString(parsed.title, seed.name),
        philosophy: safeString(parsed.philosophy, seed.directive),
        seed,
        tokens: applyRiskToTokens(safeTokens, brief.risk),
        screen: finalScreen,
        screenLayout,
    }
}

function fallbackScreen(intent: IntentJSON): ScreenContent {
    return {
        headline: intent.domain,
        subheadline: `A ${intent.emotionalTone} experience for ${intent.primaryUser}`,
        ctaPrimary: 'Get Started',
        ctaSecondary: null,
        navItems: ['Overview', 'Details', 'Settings', 'Help'],
        metrics: intent.coreTasks.slice(0, 3).map(task => ({ label: task, value: '—' })),
        listItems: [],
        featureLabels: intent.coreTasks.slice(0, 4),
        backgroundTreatment: 'solid',
    }
}

async function generateOneExploration(
    intent: IntentJSON,
    seed: CreativeSeed,
    archetype: ProductArchetype,
    references: ReferenceSignals,
    index: number,
    count: number,
    forcedComposition?: CompositionFamily,
): Promise<Exploration> {
    const brief = await generateDirectionBrief(intent, archetype, seed, references, index, count)
    if (forcedComposition) brief.compositionFamily = forcedComposition
    const systemPrompt = buildSystemPrompt(intent, archetype, brief)
    const seedBlock = formatSeedForPrompt(seed)
    const userMessage = `Return ONLY valid JSON. No commentary.

${seedBlock}

Director brief:
${JSON.stringify(brief, null, 2)}

References:
- labels: ${references.labels.join(', ') || 'none'}
- principles: ${references.principles.join(' | ') || 'none'}

Product intent:
${JSON.stringify(intent, null, 2)}`
    const raw = await callLLM(systemPrompt, userMessage)

    try {
        return parseExploration(raw, seed, intent, archetype, brief)
    } catch {
        const retryMessage = `Your previous response was not valid JSON. You MUST return ONLY the JSON object matching the schema. No explanation.

${seedBlock}

Director brief:
${JSON.stringify(brief, null, 2)}

Product intent:
${JSON.stringify(intent, null, 2)}`
        const retryRaw = await callLLM(systemPrompt, retryMessage)

        try {
            return parseExploration(retryRaw, seed, intent, archetype, brief)
        } catch {
            const screen = fallbackScreen(intent)
            return {
                id: randomId(),
                title: seed.name,
                philosophy: seed.directive,
                seed,
                tokens: applyRiskToTokens(FALLBACK_EXPLORATION_TOKENS, brief.risk),
                screen,
                screenLayout: buildDirectedFirstScreen(intent, screen, intent.domain, brief),
            }
        }
    }
}

function hexBrightness(hex: string): number {
    const clean = hex.replace('#', '')
    if (clean.length < 6) return 128
    const r = parseInt(clean.slice(0, 2), 16)
    const g = parseInt(clean.slice(2, 4), 16)
    const b = parseInt(clean.slice(4, 6), 16)
    return 0.299 * r + 0.587 * g + 0.114 * b
}

function validateDivergence(explorations: Exploration[]): boolean {
    if (explorations.length <= 1) return true

    const bgs = explorations.map(e => hexBrightness(e.tokens.colors.background))
    const fonts = new Set(explorations.map(e => e.tokens.typography.fontFamily))
    const shadows = new Set(explorations.map(e => e.tokens.shadow))

    const bgRange = Math.max(...bgs) - Math.min(...bgs)
    const hasFontVariety = fonts.size >= 2
    const hasShadowVariety = shadows.size >= 2
    const fingerprints = new Set(explorations.map(e => layoutFingerprint(e.screenLayout)))
    const hasDistinctStructures = fingerprints.size === explorations.length

    return bgRange > 30 && hasFontVariety && hasShadowVariety && hasDistinctStructures
}

interface CriticScore {
    realism: number
    hierarchy: number
    moduleCoverage: number
    distinction: number
    total: number
}

function scoreExploration(
    exploration: Exploration,
    archetype: ProductArchetype,
    all: Exploration[],
): CriticScore {
    const screen = exploration.screen
    const textBlob = [
        screen.headline,
        screen.subheadline,
        screen.ctaPrimary,
        ...(screen.navItems ?? []),
        ...(screen.featureLabels ?? []),
        ...(screen.listItems ?? []),
    ].join(' ')
    const placeholderPenalty = PLACEHOLDER_PATTERN.test(textBlob) ? 30 : 0
    const realism = Math.max(0, 100 - placeholderPenalty)
    const hierarchy = Math.min(100, 30 + (screen.headline.length > 16 ? 20 : 0) + (screen.metrics.length * 12) + (screen.featureLabels.length * 8))
    const moduleCoverage = Math.min(100, Math.round((countModuleHits(screen, archetype) / Math.max(archetype.requiredModules.length, 1)) * 100))

    const fingerprint = layoutFingerprint(exploration.screenLayout)
    const duplicates = all.filter(e => layoutFingerprint(e.screenLayout) === fingerprint).length - 1
    const distinction = Math.max(0, 100 - duplicates * 40)

    const total = Math.round((realism * 0.25) + (hierarchy * 0.25) + (moduleCoverage * 0.3) + (distinction * 0.2))

    return { realism, hierarchy, moduleCoverage, distinction, total }
}

async function regenerateForDivergence(
    explorations: Exploration[],
    intent: IntentJSON,
    archetype: ProductArchetype,
    usedSeeds: CreativeSeed[],
    references: ReferenceSignals,
    count: 1 | 2 | 4,
): Promise<Exploration[]> {
    if (validateDivergence(explorations) || explorations.length <= 1) return explorations

    const replacementSeed = SEED_LIBRARY.find(s => !usedSeeds.some(active => active.name === s.name)) ?? usedSeeds[0]!
    const usedFingerprints = new Set(explorations.map(e => layoutFingerprint(e.screenLayout)))
    const forcedComposition = COMPOSITIONS.find(c => {
        const synthetic = buildDirectedFirstScreen(intent, explorations[0]!.screen, intent.domain, fallbackBrief(intent, replacementSeed, 'wild', c))
        return !usedFingerprints.has(layoutFingerprint(synthetic))
    })

    const replacement = await generateOneExploration(
        intent,
        replacementSeed,
        archetype,
        references,
        explorations.length - 1,
        count,
        forcedComposition,
    )
    const next = [...explorations]
    next[next.length - 1] = replacement
    return next
}

async function criticRefine(
    explorations: Exploration[],
    intent: IntentJSON,
    archetype: ProductArchetype,
    usedSeeds: CreativeSeed[],
    references: ReferenceSignals,
    count: 1 | 2 | 4,
): Promise<Exploration[]> {
    if (explorations.length === 0) return explorations
    const scores = explorations.map(exp => scoreExploration(exp, archetype, explorations))
    let lowestIndex = 0
    for (let i = 1; i < scores.length; i++) {
        if (scores[i]!.total < scores[lowestIndex]!.total) lowestIndex = i
    }
    if (scores[lowestIndex]!.total >= 72) return explorations

    const replacementSeed = SEED_LIBRARY.find(s => !usedSeeds.some(active => active.name === s.name)) ?? usedSeeds[lowestIndex]!
    const replacement = await generateOneExploration(
        intent,
        replacementSeed,
        archetype,
        references,
        lowestIndex,
        count,
    )
    const next = [...explorations]
    next[lowestIndex] = replacement
    return next
}

export async function generateExplorations(
    intent: IntentJSON,
    count: 1 | 2 | 4,
    sourcePrompt = '',
    onProgress?: (exploration: Exploration) => void,
): Promise<Exploration[]> {
    const archetype = resolveArchetype(intent)
    const seeds = pickDivergentSeeds(count)
    const references = extractReferenceSignals(sourcePrompt, intent)

    const settled: Exploration[] = []
    await Promise.all(
        seeds.map(async (seed, index) => {
            const exploration = await generateOneExploration(intent, seed, archetype, references, index, count)
            settled.push(exploration)
            onProgress?.(exploration)
        }),
    )

    let explorations = settled
    explorations = await regenerateForDivergence(explorations, intent, archetype, seeds, references, count)
    explorations = await criticRefine(explorations, intent, archetype, seeds, references, count)
    explorations = await regenerateForDivergence(explorations, intent, archetype, seeds, references, count)

    return explorations
}

function shadowValue(input: ExplorationTokens['shadow']): string {
    switch (input) {
        case 'none': return 'none'
        case 'soft': return '0 2px 10px rgba(2, 6, 23, 0.12)'
        case 'lift': return '0 8px 24px rgba(2, 6, 23, 0.18)'
        case 'heavy': return '0 20px 48px rgba(2, 6, 23, 0.28)'
        case 'glow': return '0 0 30px rgba(59, 130, 246, 0.28)'
        default: return '0 8px 24px rgba(2, 6, 23, 0.18)'
    }
}

const fontFamilyMap = {
    systemSans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    systemSerif: 'Iowan Old Style, Georgia, serif',
    systemMono: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

export function explorationToRuntimeTokens(tokens: ExplorationTokens): RuntimeDesignTokens {
    const mappedFont = fontFamilyMap[tokens.typography.fontFamily] || fontFamilyMap.systemSans
    const isDark = tokens.colors.background.startsWith('#0') || tokens.colors.background.startsWith('#1')

    return {
        colors: {
            background: tokens.colors.background,
            surface: tokens.colors.surface,
            surfaceAlt: isDark ? '#27272a' : '#f4f4f5',
            primary: tokens.colors.primary,
            accent: tokens.colors.accent,
            text: tokens.colors.text,
            muted: tokens.colors.muted,
            border: tokens.colors.border,
            onPrimary: isDark ? '#ffffff' : tokens.colors.background,
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            gradientFrom: tokens.colors.primary,
            gradientVia: tokens.colors.accent,
            gradientTo: '#ec4899',
            chart1: tokens.colors.primary,
            chart2: tokens.colors.accent,
            chart3: '#06b6d4',
            chart4: '#22c55e',
            chart5: '#f59e0b',
        },
        typography: {
            fontFamily: mappedFont,
            displayFamily: mappedFont,
            monoFamily: fontFamilyMap.systemMono,
            baseSize: tokens.typography.bodySize,
            displaySize: '48px',
            headingSize: tokens.typography.headingSize,
            bodySize: tokens.typography.bodySize,
            headingWeight: tokens.typography.headingWeight,
            headingTracking: tokens.typography.headingTracking,
            scaleRatio: '1.25',
        },
        spacing: {
            cardPadding: '20px',
            sectionGap: '28px',
            navItemPadding: '10px 14px',
            heroPadding: tokens.spacing.heroPadding,
            headlineMargin: tokens.spacing.headlineMargin,
        },
        radius: {
            card: tokens.radius.card,
            button: tokens.radius.button,
            input: '10px',
            badge: '999px',
        },
        shadow: {
            card: shadowValue(tokens.shadow),
            elevated: shadowValue(tokens.shadow),
        },
        layout: {
            sidebarWidth: '260px',
            topNavHeight: '64px',
        },
    }
}
