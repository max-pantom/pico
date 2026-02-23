import { callLLM, extractJSON } from '../lib/llm'
import type { IntentJSON, LayoutNode, RuntimeDesignTokens, SceneBlueprint, SceneStrategy } from '../types/pipeline'
import type { AutoLayout, DesignDocument, DesignLayer, LayerRole, LayerType } from '../design/frameModel'
import { buildFirstScreen } from './surfaceConfig'
import { SURFACE_RENDER } from '../renderer/surfaceRender'
import type { ScreenContent } from './surfaceConfig'
import { resolveArchetype } from './productArchetypes'
import type { ProductArchetype } from './productArchetypes'
import { pickDivergentSeeds, pickReplacementSeed, formatSeedForPrompt } from './designWorlds'
import type { CreativeSeed } from './designWorlds'
import {
    pickStrategyForDirection,
    type CompositionStrategy,
    COMPOSITION_STRATEGIES,
} from './compositionStrategies'
import { sceneDefinitions, suggestStrategy } from './sceneStrategies'

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
    blueprint: SceneBlueprint
    tokens: ExplorationTokens
    screen: ScreenContent
    screenLayout: LayoutNode
    designDocument?: DesignDocument
}

type CompositionFamily =
    | 'editorial-asymmetry'
    | 'strict-grid'
    | 'immersive-fullbleed'
    | 'utility-shell'
    | 'focal-content'
    | 'split-dominant'
    | 'dense-panels'

type CreativeRisk = 'safe' | 'balanced' | 'wild'

type DensityLevel = 'compact' | 'comfortable' | 'spacious'
type AlignmentMode = 'left' | 'center' | 'asymmetric'
type SpatialRhythm = 'regular' | 'irregular' | 'breathing' | 'dense'

interface DirectionBrief {
    concept: string
    audienceFrame: string
    brandStance: string
    visualTension: string
    compositionFamily: CompositionFamily
    compositionStrategy: CompositionStrategy
    hierarchyThesis: string
    focalElement: string
    risk: CreativeRisk
    density: DensityLevel
    alignment: AlignmentMode
    spatialRhythm: SpatialRhythm
}

interface ReferenceSignals {
    labels: string[]
    principles: string[]
}

function buildLayerPrompt(
    intent: IntentJSON,
    brief: DirectionBrief,
    seed: CreativeSeed,
    blueprint: SceneBlueprint,
): string {
    const { w, h } = SURFACE_RENDER[intent.surface]

    return `You are a designer placing exactly 6 layers in a frame. No more, no fewer.
Frame: ${w} × ${h}px.

PRIORITY ORDER (highest to lowest):
1. USER BRIEF — subject matter is non-negotiable. What the user asked for MUST appear.
2. SCENE STRATEGY — how to compose the screen.
3. CREATIVE SEED — visual personality (colors, typography, spacing).

The seed gives you visual style. The brief gives you subject matter.
The seed NEVER overrides the brief's subject. A BSOD brief with a warm seed =
warm palette applied to BSOD content (error codes, monospace). NOT: abandon BSOD and make a cozy paper interface.

USER BRIEF (authority): ${intent.domain} — ${intent.emotionalTone}. Tasks: ${intent.coreTasks.join(', ')}.

SCENE: ${blueprint.dominantElement} dominates (~${blueprint.dominantCoverage}%). Secondary: ${blueprint.secondaryElements.join(', ')}.
Focal: ${brief.focalElement}. Hierarchy: ${brief.hierarchyThesis}.
${blueprint.avoidGrids ? 'Avoid equal-card grids. Use asymmetry.' : ''}

CREATIVE SEED (visual style only):
${seed.directive}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXACTLY 6 LAYERS (required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layer 1: background — always. x=0, y=0, width="fill", height="fill", fill="#hex".
Layer 2: dominant-visual — main visual element (shape, gradient, or image placeholder).
Layer 3: headline — primary text. Use frame with autoLayout and one text child.
Layer 4: supporting-text — secondary text or supporting element.
Layer 5: control — CTA button or interactive element.

Layer 6: ambient — one atmospheric detail (decorative shape, line, glow, subtle pattern).

A great designer makes six layers feel like twenty. Restraint is the design.

Keep each layer to at most 8 properties. Use "fill" or "hug" for width/height when appropriate.
Text must live inside a frame with autoLayout. Never free-floating text with x,y.

OUTPUT (valid JSON only):
{
  "title": "2-3 word direction name",
  "philosophy": "one sentence design thesis",
  "layers": [
    { "id": "bg", "role": "background", "type": "shape", "x": 0, "y": 0, "width": "fill", "height": "fill", "fill": "#hex", "zIndex": 0 },
    { "id": "dom", "role": "dominant-visual", "type": "shape", "x": 0, "y": 0, "width": ${w}, "height": ${Math.round(h * 0.6)}, "fill": "#hex", "zIndex": 1 },
    { "id": "hl", "role": "headline", "type": "frame", "x": 48, "y": 120, "width": 600, "height": "hug", "zIndex": 2, "autoLayout": { "direction": "vertical", "gap": 8, "padding": 0, "alignment": "start" }, "children": [{ "type": "text", "content": "Headline", "fontSize": 48, "fontWeight": 700, "width": "fill", "height": "hug", "zIndex": 0 }] },
    { "id": "sub", "role": "supporting-text", "type": "frame", "x": 48, "y": 220, "width": 500, "height": "hug", "zIndex": 3, "autoLayout": { "direction": "vertical", "gap": 4, "padding": 0, "alignment": "start" }, "children": [{ "type": "text", "content": "Subtext", "fontSize": 16, "fontWeight": 400, "width": "fill", "height": "hug", "zIndex": 0 }] },
    { "id": "cta", "role": "control", "type": "shape", "x": 48, "y": 320, "width": 160, "height": 48, "fill": "#hex", "radius": 8, "content": "Get Started", "zIndex": 4 },
    { "id": "amb", "role": "ambient", "type": "shape", "x": 0, "y": 0, "width": 200, "height": 200, "opacity": 0.15, "fill": "#hex", "zIndex": 5 }
  ]
}

Replace placeholder values with domain-specific content. All content must be realistic.`
}

const VALID_LAYER_ROLES = new Set<LayerRole>([
    'background', 'dominant-visual', 'headline', 'supporting-text', 'control', 'navigation', 'ambient',
])

function buildFallbackLayers(tokens: RuntimeDesignTokens, frameW: number, frameH: number): DesignLayer[] {
    const centerY = Math.round(frameH / 2) - 24
    return [
        {
            id: 'fallback-bg',
            name: 'background',
            role: 'background',
            type: 'shape',
            x: 0,
            y: 0,
            width: 'fill',
            height: 'fill',
            zIndex: 0,
            fill: tokens.colors.background,
        },
        {
            id: 'fallback-msg',
            name: 'headline',
            role: 'headline',
            type: 'text',
            x: 60,
            y: Math.max(48, centerY),
            width: frameW - 120,
            height: 'hug',
            zIndex: 1,
            content: 'Generation incomplete',
            fontSize: 32,
            fontWeight: 700,
            color: tokens.colors.text,
        },
    ]
}
const VALID_LAYER_TYPES = new Set<LayerType>(['frame', 'text', 'shape', 'image', 'group'])

function parseAutoLayout(v: unknown): AutoLayout | undefined {
    if (!v || typeof v !== 'object') return undefined
    const o = v as Record<string, unknown>
    const dir = o.direction === 'horizontal' || o.direction === 'vertical' ? o.direction : 'vertical'
    const gap = Number.isFinite(Number(o.gap)) ? Number(o.gap) : 16
    let padding: AutoLayout['padding'] = 24
    if (Number.isFinite(Number(o.padding))) {
        padding = Number(o.padding)
    } else if (o.padding && typeof o.padding === 'object') {
        const p = o.padding as Record<string, unknown>
        padding = {
            top: Number.isFinite(Number(p.top)) ? Number(p.top) : 24,
            right: Number.isFinite(Number(p.right)) ? Number(p.right) : 24,
            bottom: Number.isFinite(Number(p.bottom)) ? Number(p.bottom) : 24,
            left: Number.isFinite(Number(p.left)) ? Number(p.left) : 24,
        }
    }
    const alignment = ['start', 'center', 'end', 'space-between', 'space-around'].includes(String(o.alignment))
        ? (o.alignment as AutoLayout['alignment'])
        : 'start'
    const wrap = Boolean(o.wrap)
    return { direction: dir, gap, padding, alignment, wrap }
}

function parseLayerItem(
    o: Record<string, unknown>,
    index: number,
    z: { value: number },
    parentId?: string,
    isChildOfAutoLayout?: boolean,
): DesignLayer | null {
    const role = VALID_LAYER_ROLES.has(o.role as LayerRole) ? (o.role as LayerRole) : 'ambient'
    const type = VALID_LAYER_TYPES.has(o.type as LayerType) ? (o.type as LayerType) : 'shape'
    const width = o.width === 'fill' || o.width === 'hug' ? o.width : (Number.isFinite(Number(o.width)) ? Number(o.width) : 200)
    const height = o.height === 'fill' || o.height === 'hug' ? o.height : (Number.isFinite(Number(o.height)) ? Number(o.height) : 40)
    const zIndex = Number.isFinite(Number(o.zIndex)) ? Number(o.zIndex) : z.value++

    const layer: DesignLayer = {
        id: typeof o.id === 'string' ? o.id : `${parentId ?? 'layer'}-${index}`,
        name: typeof o.name === 'string' ? o.name : role,
        role,
        type,
        width,
        height,
        zIndex,
    }

    if (!isChildOfAutoLayout) {
        layer.x = Number.isFinite(Number(o.x)) ? Number(o.x) : 0
        layer.y = Number.isFinite(Number(o.y)) ? Number(o.y) : 0
    }

    const autoLayout = parseAutoLayout(o.autoLayout)
    if (autoLayout) layer.autoLayout = autoLayout

    if (typeof o.fill === 'string') layer.fill = o.fill
    if (o.gradient && typeof o.gradient === 'object') {
        const g = o.gradient as Record<string, unknown>
        layer.gradient = {
            from: typeof g.from === 'string' ? g.from : '#000',
            to: typeof g.to === 'string' ? g.to : '#000',
            via: typeof g.via === 'string' ? g.via : undefined,
        }
    }
    if (Number.isFinite(Number(o.opacity))) layer.opacity = Number(o.opacity)
    if (Number.isFinite(Number(o.radius))) layer.radius = Number(o.radius)
    if (typeof o.content === 'string') layer.content = o.content
    if (Number.isFinite(Number(o.fontSize))) layer.fontSize = Number(o.fontSize)
    if (Number.isFinite(Number(o.fontWeight))) layer.fontWeight = Number(o.fontWeight)
    if (typeof o.color === 'string') layer.color = o.color
    if (Number.isFinite(Number(o.rotation))) layer.rotation = Number(o.rotation)
    if (Number.isFinite(Number(o.blur))) layer.blur = Number(o.blur)

    if (Array.isArray(o.children) && o.children.length > 0 && layer.autoLayout) {
        const childZ = { value: zIndex + 1 }
        layer.children = o.children
            .map((c, i) => c && typeof c === 'object' ? parseLayerItem(c as Record<string, unknown>, i, childZ, layer.id, true) : null)
            .filter((c): c is DesignLayer => c != null)
    }

    return layer
}

interface LayerBox {
    x: number
    y: number
    width: number
    height: number
}

const NON_OVERLAP_ROLES = new Set<LayerRole>(['headline', 'supporting-text', 'control', 'navigation'])

function intersects(a: LayerBox, b: LayerBox): boolean {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y)
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

function estimateTextHeight(content: string, fontSize: number, maxWidth: number): number {
    const charsPerLine = Math.max(8, Math.floor(maxWidth / Math.max(6, fontSize * 0.55)))
    const lines = Math.max(1, Math.ceil(content.length / charsPerLine))
    return Math.ceil(lines * (fontSize * 1.2))
}

function estimateLayerBox(layer: DesignLayer, frameW: number, frameH: number, margin: number): LayerBox {
    const x = clamp(layer.x ?? margin, margin, Math.max(margin, frameW - margin))
    const y = clamp(layer.y ?? margin, margin, Math.max(margin, frameH - margin))

    const width = (() => {
        if (layer.width === 'fill') return Math.max(120, frameW - (margin * 2))
        if (typeof layer.width === 'number') return clamp(layer.width, 40, frameW - margin)
        if (layer.type === 'text') {
            const fontSize = clamp(layer.fontSize ?? 28, 12, 110)
            const rough = (layer.content?.length ?? 24) * (fontSize * 0.55)
            return clamp(rough, 140, frameW - (margin * 2))
        }
        return clamp(Math.round(frameW * 0.45), 180, frameW - (margin * 2))
    })()

    const height = (() => {
        if (layer.height === 'fill') return Math.max(120, frameH - (margin * 2))
        if (typeof layer.height === 'number') return clamp(layer.height, 24, frameH - margin)
        if (layer.type === 'text') {
            const fontSize = clamp(layer.fontSize ?? 28, 12, 110)
            return clamp(estimateTextHeight(layer.content ?? '', fontSize, width), 24, frameH - margin)
        }
        if (layer.autoLayout) {
            const childCount = layer.children?.length ?? 1
            return clamp(80 + (childCount * 54), 80, frameH - margin)
        }
        return 96
    })()

    return {
        x: clamp(x, margin, Math.max(margin, frameW - width - margin)),
        y: clamp(y, margin, Math.max(margin, frameH - height - margin)),
        width,
        height,
    }
}

function sanitizeLayer(layer: DesignLayer, frameW: number, frameH: number, isChild = false): DesignLayer {
    const next: DesignLayer = { ...layer }

    if (typeof next.fontSize === 'number') {
        next.fontSize = clamp(next.fontSize, 10, 124)
    }

    if (isChild) {
        delete next.x
        delete next.y
    } else {
        const margin = 24
        if (typeof next.x === 'number') next.x = clamp(next.x, 0, Math.max(0, frameW - 24))
        if (typeof next.y === 'number') next.y = clamp(next.y, 0, Math.max(0, frameH - 24))

        if (typeof next.width === 'number') {
            const maxW = Math.max(48, frameW - ((next.x ?? 0) + margin))
            next.width = clamp(next.width, 40, maxW)
        }

        if (typeof next.height === 'number') {
            const maxH = Math.max(40, frameH - ((next.y ?? 0) + margin))
            next.height = clamp(next.height, 24, maxH)
        }
    }

    if (next.autoLayout && next.children?.length) {
        next.children = next.children.map(child => sanitizeLayer(child, frameW, frameH, true))
    }

    return next
}

function deconflictTopLevelContent(layers: DesignLayer[], frameW: number, frameH: number): DesignLayer[] {
    const margin = 24
    const gap = 14
    const placed: LayerBox[] = []

    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex)

    return sorted.map(layer => {
        const next = sanitizeLayer(layer, frameW, frameH, false)
        if (!NON_OVERLAP_ROLES.has(next.role)) return next

        const box = estimateLayerBox(next, frameW, frameH, margin)
        let targetY = box.y

        let iterations = 0
        while (iterations < 12) {
            const candidate: LayerBox = { ...box, y: targetY }
            const collision = placed.find(existing => intersects(candidate, existing))
            if (!collision) break
            targetY = collision.y + collision.height + gap
            iterations += 1
        }

        const finalY = clamp(targetY, margin, Math.max(margin, frameH - box.height - margin))
        next.x = box.x
        next.y = finalY

        placed.push({ ...box, y: finalY })

        return next
    })
}

function normalizeDesignLayers(layers: DesignLayer[], frameW: number, frameH: number): DesignLayer[] {
    const withBounds = layers.map(layer => sanitizeLayer(layer, frameW, frameH, false))
    return deconflictTopLevelContent(withBounds, frameW, frameH)
}

const MAX_LAYERS = 6

function parseDesignLayers(
    raw: string,
    _blueprint: SceneBlueprint,
    frameW: number,
    frameH: number,
): DesignLayer[] | null {
    try {
        const parsed = JSON.parse(extractJSON(raw)) as { layers?: unknown[] }
        if (!Array.isArray(parsed.layers) || parsed.layers.length === 0) return null

        const layers: DesignLayer[] = []
        const z = { value: 0 }
        const limit = Math.min(parsed.layers.length, MAX_LAYERS)

        for (let i = 0; i < limit; i++) {
            const item = parsed.layers[i]
            if (!item || typeof item !== 'object') continue
            const layer = parseLayerItem(item as Record<string, unknown>, i, z, undefined, false)
            if (layer) layers.push(layer)
        }

        return layers.length > 0 ? normalizeDesignLayers(layers, frameW, frameH) : null
    } catch {
        return null
    }
}

function buildDesignDocument(
    name: string,
    layers: DesignLayer[],
    runtimeTokens: RuntimeDesignTokens,
    frameW: number,
    frameH: number,
): DesignDocument {
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex)
    return {
        name,
        frame: {
            id: 'frame-main',
            name: 'main',
            type: 'screen',
            width: frameW,
            height: frameH,
            background: runtimeTokens.colors.background,
            layers: sorted,
        },
        tokens: runtimeTokens,
    }
}

function flattenLayers(layers: DesignLayer[]): DesignLayer[] {
    const out: DesignLayer[] = []
    for (const l of layers) {
        out.push(l)
        if (l.children?.length) out.push(...flattenLayers(l.children))
    }
    return out
}

function deriveScreenFromLayers(layers: DesignLayer[]): ScreenContent {
    const flat = flattenLayers(layers)
    const headline = flat.find(l => l.role === 'headline' && l.content)?.content ?? 'Product'
    const subtext = flat.find(l => l.role === 'supporting-text' && l.content)?.content ?? ''
    const cta = flat.find(l => l.role === 'control')?.content ?? 'Get Started'
    const navLabels = flat.filter(l => l.role === 'navigation').map(l => l.content).filter(Boolean) as string[]
    return {
        headline,
        subheadline: subtext,
        ctaPrimary: cta,
        ctaSecondary: null,
        navItems: navLabels.length > 0 ? navLabels : ['Overview', 'Details', 'Settings'],
        metrics: [],
        listItems: [],
        featureLabels: [],
        backgroundTreatment: 'solid',
    }
}

function layerFingerprint(doc: DesignDocument): string {
    const parts = doc.frame.layers.map(l => `${l.role}:${l.type}:${l.x ?? 0}:${l.y ?? 0}`)
    return parts.join('|')
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

const PLACEHOLDER_PATTERN = /\b(item\s*\d+|feature\s*[a-z]|lorem|placeholder|n\/a|todo)\b/i
const COMPOSITIONS: CompositionFamily[] = [
    'editorial-asymmetry',
    'strict-grid',
    'immersive-fullbleed',
    'utility-shell',
    'focal-content',
    'split-dominant',
    'dense-panels',
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
    if (count === 2 && index === 1) return 'split-dominant'
    return index % 2 === 0 ? 'strict-grid' : 'focal-content'
}

function fallbackBrief(
    intent: IntentJSON,
    seed: CreativeSeed,
    risk: CreativeRisk,
    composition: CompositionFamily,
    strategy: CompositionStrategy,
): DirectionBrief {
    const density: DensityLevel = risk === 'wild' ? 'spacious' : risk === 'safe' ? 'compact' : 'comfortable'
    const alignment: AlignmentMode = composition === 'editorial-asymmetry' ? 'asymmetric' : composition === 'strict-grid' ? 'left' : 'center'
    const spatialRhythm: SpatialRhythm = risk === 'wild' ? 'irregular' : risk === 'safe' ? 'regular' : 'breathing'
    return {
        concept: `${intent.domain} designed as ${seed.name}`,
        audienceFrame: intent.primaryUser,
        brandStance: `${seed.family} aesthetic`,
        visualTension: seed.directive.slice(0, 80),
        compositionFamily: composition,
        compositionStrategy: strategy,
        hierarchyThesis: `Lead with ${intent.coreTasks[0] ?? 'primary action'} and support with clear secondary blocks`,
        focalElement: intent.coreTasks[0] ?? 'primary hero region',
        risk,
        density,
        alignment,
        spatialRhythm,
    }
}

const VALID_DENSITY = new Set<DensityLevel>(['compact', 'comfortable', 'spacious'])
const VALID_ALIGNMENT = new Set<AlignmentMode>(['left', 'center', 'asymmetric'])
const VALID_RHYTHM = new Set<SpatialRhythm>(['regular', 'irregular', 'breathing', 'dense'])
const VALID_STRATEGIES = new Set<CompositionStrategy>([
    'statement-first', 'product-first', 'story-first',
    'atmosphere-first', 'tool-first', 'proof-first',
])

function parseBrief(raw: string, fallback: DirectionBrief): DirectionBrief {
    const parsed = JSON.parse(extractJSON(raw)) as Partial<DirectionBrief>
    const composition = COMPOSITIONS.includes(parsed.compositionFamily as CompositionFamily)
        ? parsed.compositionFamily as CompositionFamily
        : fallback.compositionFamily
    const risk: CreativeRisk = parsed.risk === 'safe' || parsed.risk === 'balanced' || parsed.risk === 'wild'
        ? parsed.risk
        : fallback.risk
    const density = VALID_DENSITY.has(parsed.density as DensityLevel) ? parsed.density as DensityLevel : fallback.density
    const alignment = VALID_ALIGNMENT.has(parsed.alignment as AlignmentMode) ? parsed.alignment as AlignmentMode : fallback.alignment
    const spatialRhythm = VALID_RHYTHM.has(parsed.spatialRhythm as SpatialRhythm) ? parsed.spatialRhythm as SpatialRhythm : fallback.spatialRhythm
    const compositionStrategy = VALID_STRATEGIES.has(parsed.compositionStrategy as CompositionStrategy)
        ? parsed.compositionStrategy as CompositionStrategy
        : fallback.compositionStrategy

    return {
        concept: safeString(parsed.concept, fallback.concept),
        audienceFrame: safeString(parsed.audienceFrame, fallback.audienceFrame),
        brandStance: safeString(parsed.brandStance, fallback.brandStance),
        visualTension: safeString(parsed.visualTension, fallback.visualTension),
        compositionFamily: composition,
        compositionStrategy,
        hierarchyThesis: safeString(parsed.hierarchyThesis, fallback.hierarchyThesis),
        focalElement: safeString(parsed.focalElement, fallback.focalElement),
        risk,
        density,
        alignment,
        spatialRhythm,
    }
}

const VALID_INTERACTION_LAYERS = new Set<SceneBlueprint['interactionLayer']>(['inline', 'overlay', 'sidebar', 'bottom'])
const VALID_SCENE_STRATEGIES = new Set<SceneStrategy>(Object.keys(sceneDefinitions) as SceneStrategy[])

function parseSceneBlueprint(raw: string): SceneBlueprint {
    const parsed = JSON.parse(extractJSON(raw)) as Partial<SceneBlueprint>
    const problems: string[] = []

    if (!VALID_SCENE_STRATEGIES.has(parsed.strategy as SceneStrategy)) {
        problems.push('strategy must be one of the allowed SceneStrategy values')
    }
    if (typeof parsed.dominantElement !== 'string' || parsed.dominantElement.trim().length === 0) {
        problems.push('dominantElement must be a non-empty string')
    }

    const coverage = Number(parsed.dominantCoverage)
    if (!Number.isFinite(coverage) || coverage < 70 || coverage > 85) {
        problems.push('dominantCoverage must be a number between 70 and 85')
    }

    const secondaryElements = Array.isArray(parsed.secondaryElements)
        ? parsed.secondaryElements.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        : []
    if (secondaryElements.length === 0) {
        problems.push('secondaryElements must include at least one label')
    }

    if (!VALID_INTERACTION_LAYERS.has(parsed.interactionLayer as SceneBlueprint['interactionLayer'])) {
        problems.push('interactionLayer must be one of inline | overlay | sidebar | bottom')
    }
    if (typeof parsed.avoidGrids !== 'boolean') {
        problems.push('avoidGrids must be a boolean')
    }

    if (problems.length > 0) {
        throw new Error(`Malformed SceneBlueprint JSON: ${problems.join('; ')}`)
    }

    return {
        strategy: parsed.strategy as SceneStrategy,
        dominantElement: parsed.dominantElement!.trim(),
        dominantCoverage: Math.round(coverage),
        secondaryElements,
        interactionLayer: parsed.interactionLayer as SceneBlueprint['interactionLayer'],
        avoidGrids: parsed.avoidGrids as boolean,
    }
}

async function generateSceneBlueprint(
    intent: IntentJSON,
    seed: CreativeSeed,
    brief: DirectionBrief,
): Promise<SceneBlueprint> {
    const suggested = suggestStrategy(intent.surface, seed.name)
    const schemaString = `{
  "strategy": "immersive-surface" | "object-focus" | "interface-first" | "cinematic-hero" | "editorial-canvas" | "control-dominant",
  "dominantElement": "string",
  "dominantCoverage": 70-85,
  "secondaryElements": ["string", "string", "string"],
  "interactionLayer": "inline" | "overlay" | "sidebar" | "bottom",
  "avoidGrids": true | false
}`

    const systemPrompt = `You are Pico's scene strategist.
Commit to a single scene strategy before hero generation.
Output ONLY valid JSON with no markdown and no commentary.

Allowed strategies and guidance:
${JSON.stringify(sceneDefinitions, null, 2)}

Blueprint schema (must match exactly):
${schemaString}

Rules:
- Choose exactly one strategy.
- dominantCoverage must be an integer between 70 and 85.
- secondaryElements should list 2-4 concrete subordinate elements.
- If strategy suggests asymmetry or narrative framing, set avoidGrids to true.
- Keep the blueprint coherent with product intent and creative directive.`

    const userMessage = `Intent:
${JSON.stringify(intent, null, 2)}

Seed:
${JSON.stringify(seed, null, 2)}

Direction brief:
${JSON.stringify({
    concept: brief.concept,
    hierarchyThesis: brief.hierarchyThesis,
    focalElement: brief.focalElement,
    compositionFamily: brief.compositionFamily,
    compositionStrategy: brief.compositionStrategy,
}, null, 2)}

Suggested strategy: ${suggested}

Return ONLY the SceneBlueprint JSON object.`

    try {
        const raw = await callLLM(systemPrompt, userMessage)
        return parseSceneBlueprint(raw)
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        const retryPrompt = `${systemPrompt}\n\nPrevious output failed validation: ${reason}`
        const retryMessage = `${userMessage}\n\nReturn only JSON that strictly matches the schema.`
        const retryRaw = await callLLM(retryPrompt, retryMessage)
        return parseSceneBlueprint(retryRaw)
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
    const forcedStrategy = pickStrategyForDirection(index, count as 1 | 2 | 4)
    const fallback = fallbackBrief(intent, seed, inferredRisk, forcedComposition, forcedStrategy)
    const prompt = `You are Pico's creative director. Build a concise direction brief.

PRIORITY: User brief (subject matter) is non-negotiable. The seed gives visual personality.
Your brief must serve the user's subject. A BSOD 404 brief = error-screen concept, not a generic landing page.

You decide DESIGN DECISIONS first: hierarchy, focal point, density, alignment, spatial rhythm.
You do NOT decide colors or tokens — those emerge later from the design universe.

COMPOSITION STRATEGY: Each direction must choose a different composition strategy.
The strategy determines hierarchy and layout BEFORE styling decisions.
Strategy answers: "What is the FIRST IMPRESSION of this product?"

Return ONLY valid JSON.

Schema:
{
  "concept": string,
  "audienceFrame": string,
  "brandStance": string,
  "visualTension": string,
  "compositionFamily": "editorial-asymmetry" | "strict-grid" | "immersive-fullbleed" | "utility-shell" | "focal-content" | "split-dominant" | "dense-panels",
  "compositionStrategy": "statement-first" | "product-first" | "story-first" | "atmosphere-first" | "tool-first" | "proof-first",
  "hierarchyThesis": string,
  "focalElement": string,
  "risk": "safe" | "balanced" | "wild",
  "density": "compact" | "comfortable" | "spacious",
  "alignment": "left" | "center" | "asymmetric",
  "spatialRhythm": "regular" | "irregular" | "breathing" | "dense"
}

Rules:
- Creative directors change hierarchy, focal point, density, alignment, spatial rhythm — NOT colors first.
- Composition must be distinct from generic hero + 3 cards + CTA patterns.
- compositionStrategy determines what dominates: statement-first = giant typography; product-first = product UI; proof-first = stats lead; etc.
- Prefer strong decisions over safe averages. Large typography, asymmetry, whitespace exaggeration are allowed.
- Keep it product-believable for archetype modules.
`

    const userMessage = `Intent:
${JSON.stringify(intent, null, 2)}

Archetype:
${JSON.stringify({ layout: archetype.layout, requiredModules: archetype.requiredModules }, null, 2)}

Seed:
${JSON.stringify(seed, null, 2)}

Reference principles:
${references.principles.join(' | ') || 'none'}

Required values (must match exactly):
- compositionFamily: ${forcedComposition}
- compositionStrategy: ${forcedStrategy}
- risk: ${inferredRisk}
- density, alignment, spatialRhythm: choose based on composition, strategy, and risk
`

    try {
        const raw = await callLLM(prompt, userMessage)
        return parseBrief(raw, fallback)
    } catch {
        return fallback
    }
}

function applyStrategyToTokens(tokens: ExplorationTokens, strategy: CompositionStrategy): ExplorationTokens {
    const rules = COMPOSITION_STRATEGIES[strategy]
    const baseHeading = parsePx(tokens.typography.headingSize)
    const basePadding = parsePx(tokens.spacing.heroPadding)
    const scaleMap = { small: 0.75, medium: 1, large: 1.25, huge: 1.6 } as const
    const mult = scaleMap[rules.headingScale] ?? 1
    const wsMult = rules.whitespaceMultiplier
    return {
        ...tokens,
        typography: {
            ...tokens.typography,
            headingSize: toPx(Math.round(baseHeading * mult), 48),
        },
        spacing: {
            heroPadding: toPx(Math.round(basePadding * wsMult), 48),
            headlineMargin: toPx(Math.round(parsePx(tokens.spacing.headlineMargin) * wsMult), 16),
        },
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

async function generateTokens(
    intent: IntentJSON,
    seed: CreativeSeed,
    archetype: ProductArchetype,
    brief: DirectionBrief,
): Promise<ExplorationTokens> {
    const seedBlock = formatSeedForPrompt(seed)
    const systemPrompt = `You are Pico's token generator. Tokens are the PHYSICS of a design universe.

PRIORITY: User brief (subject) > Seed (visual style).
The seed gives visual personality. The brief gives subject matter.
Tokens must serve the brief's subject. A BSOD brief gets BSOD-appropriate tokens (blue, monospace) even with a warm seed — apply the seed's warmth as accent, not replacement.

${seedBlock}

Rules:
- Output ONLY valid JSON with a "tokens" object.
- Subject from brief is non-negotiable. Style from seed.
- Colors, typography, spacing must embody the seed directive WHILE fitting the brief's subject.
- Respect PROHIBITED rules in the seed.
- The result must feel coherent with: ${brief.concept}
- Density ${brief.density}, alignment ${brief.alignment}, rhythm ${brief.spatialRhythm} inform spacing.`

    const userMessage = `Intent: ${JSON.stringify(intent, null, 2)}
Archetype: ${archetype.description}
Brief: ${JSON.stringify({ concept: brief.concept, brandStance: brief.brandStance, visualTension: brief.visualTension }, null, 2)}

Return ONLY: { "tokens": { "colors": {...}, "typography": {...}, "spacing": {...}, "radius": {...}, "shadow": "..." } }`

    try {
        const raw = await callLLM(systemPrompt, userMessage)
        const parsed = JSON.parse(extractJSON(raw)) as { tokens?: ExplorationTokens }
        if (parsed.tokens && typeof parsed.tokens === 'object') {
            const t = parsed.tokens
            const safe: ExplorationTokens = {
                colors: {
                    background: safeString(t.colors?.background, '#0b1020'),
                    surface: safeString(t.colors?.surface, '#121a2f'),
                    primary: safeString(t.colors?.primary, '#2563eb'),
                    accent: safeString(t.colors?.accent, '#7c3aed'),
                    text: safeString(t.colors?.text, '#f8fafc'),
                    muted: safeString(t.colors?.muted, '#94a3b8'),
                    border: safeString(t.colors?.border, '#334155'),
                },
                typography: {
                    fontFamily: ['systemSans', 'systemSerif', 'systemMono'].includes(String(t.typography?.fontFamily))
                        ? t.typography!.fontFamily as ExplorationTokens['typography']['fontFamily']
                        : 'systemSans',
                    headingSize: safeString(t.typography?.headingSize, '48px'),
                    headingWeight: safeString(t.typography?.headingWeight, '800'),
                    headingTracking: safeString(t.typography?.headingTracking, '-0.02em'),
                    bodySize: safeString(t.typography?.bodySize, '16px'),
                },
                spacing: {
                    heroPadding: safeString(t.spacing?.heroPadding, '48px'),
                    headlineMargin: safeString(t.spacing?.headlineMargin, '16px'),
                },
                radius: {
                    button: safeString(t.radius?.button, '999px'),
                    card: safeString(t.radius?.card, '20px'),
                },
                shadow: ['none', 'soft', 'lift', 'heavy', 'glow'].includes(String(t.shadow))
                    ? t.shadow as ExplorationTokens['shadow']
                    : 'lift',
            }
            const withRisk = applyRiskToTokens(safe, brief.risk)
            return applyStrategyToTokens(withRisk, brief.compositionStrategy)
        }
    } catch { /* fall through */ }
    const withRisk = applyRiskToTokens(FALLBACK_EXPLORATION_TOKENS, brief.risk)
    return applyStrategyToTokens(withRisk, brief.compositionStrategy)
}

function buildDirectedFirstScreen(
    intent: IntentJSON,
    screen: ScreenContent,
    brand: string,
    brief: DirectionBrief,
): LayoutNode {
    const heroLayout = brief.compositionFamily === 'immersive-fullbleed'
        ? 'fullbleed'
        : brief.alignment === 'asymmetric' || brief.compositionFamily === 'editorial-asymmetry'
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
        case 'focal-content':
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
        case 'split-dominant':
            return {
                component: 'Shell',
                children: [
                    {
                        component: 'MainContent',
                        children: [
                            {
                                component: 'Card',
                                props: { title: screen.headline || brand },
                                children: [
                                    {
                                        component: 'Header',
                                        props: { title: screen.headline || brand, subtitle: screen.subheadline },
                                    },
                                    {
                                        component: 'KPIRow',
                                        props: { items: screen.metrics.slice(0, 3) },
                                    },
                                ],
                            },
                            {
                                component: 'ListPanel',
                                children: screen.navItems.slice(0, 5).map((item, i) => ({
                                    component: 'NavItem' as const,
                                    props: { label: item, active: i === 0 },
                                })),
                            },
                            {
                                component: 'DetailPanel',
                                children: [
                                    {
                                        component: 'ActivityFeed',
                                        props: { title: 'Recent', events: screen.listItems.slice(0, 4) },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }
        case 'dense-panels':
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
                                component: 'DenseGrid',
                                children: [
                                    {
                                        component: 'StatBlock',
                                        props: { title: screen.metrics[0]?.label ?? 'Metric', value: screen.metrics[0]?.value ?? '—' },
                                    },
                                    {
                                        component: 'StatBlock',
                                        props: { title: screen.metrics[1]?.label ?? 'Metric', value: screen.metrics[1]?.value ?? '—' },
                                    },
                                    {
                                        component: 'StatBlock',
                                        props: { title: screen.metrics[2]?.label ?? 'Metric', value: screen.metrics[2]?.value ?? '—' },
                                    },
                                    {
                                        component: 'StatBlock',
                                        props: { title: screen.metrics[3]?.label ?? 'Metric', value: screen.metrics[3]?.value ?? '—' },
                                    },
                                ],
                            },
                            {
                                component: 'DataTable',
                                props: {
                                    title: brief.focalElement,
                                    columns: screen.metrics.slice(0, 3).map(m => m.label),
                                    rows: [screen.metrics.slice(0, 3).map(m => m.value)],
                                },
                            },
                            {
                                component: 'ActivityFeed',
                                props: { title: 'Activity', events: screen.listItems.slice(0, 4) },
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
    strictBriefAnchor?: string,
): Promise<Exploration> {
    const brief = await generateDirectionBrief(intent, archetype, seed, references, index, count)
    if (forcedComposition) brief.compositionFamily = forcedComposition

    const blueprint = await generateSceneBlueprint(intent, seed, brief)
    const tokens = await generateTokens(intent, seed, archetype, brief)
    const runtimeTokens = explorationToRuntimeTokens(tokens)
    const { w: frameW, h: frameH } = SURFACE_RENDER[intent.surface]

    const layerPrompt = buildLayerPrompt(intent, brief, seed, blueprint)
    const seedBlock = formatSeedForPrompt(seed)
    const strictBlock = strictBriefAnchor
        ? `\nSTRICT RETRY: Previous output was off-brief. The user asked for: "${strictBriefAnchor}". Your output MUST be about this subject. No alternative interpretations.\n\n`
        : ''
    const userMessage = `Return ONLY valid JSON. No commentary. No "tokens" field.
${strictBlock}PRIORITY: Product intent (subject) overrides seed. The seed gives style; the intent gives subject.
If the intent says "404 BSOD error page", the output MUST be BSOD content (error codes, monospace) — styled by the seed, not replaced by it.

${seedBlock}

Director brief:
${JSON.stringify(brief, null, 2)}

Scene blueprint:
${JSON.stringify(blueprint, null, 2)}

Product intent (authority for subject matter):
${JSON.stringify(intent, null, 2)}`
    const raw = await callLLM(layerPrompt, userMessage)

    const fallbackScr = fallbackScreen(intent)
    let layers = parseDesignLayers(raw, blueprint, frameW, frameH)
    if (!layers || layers.length === 0) {
        layers = buildFallbackLayers(runtimeTokens, frameW, frameH)
    }

    const title = (() => {
        try {
            const p = JSON.parse(extractJSON(raw)) as { title?: string }
            return typeof p.title === 'string' && p.title.trim() ? p.title.trim() : seed.name
        } catch {
            return seed.name
        }
    })()
    const philosophy = (() => {
        try {
            const p = JSON.parse(extractJSON(raw)) as { philosophy?: string }
            return typeof p.philosophy === 'string' && p.philosophy.trim() ? p.philosophy.trim() : seed.directive
        } catch {
            return seed.directive
        }
    })()

    const screen = deriveScreenFromLayers(layers)
    const hits = countModuleHits(screen, archetype)
    const finalScreen = hits >= MIN_MODULE_HITS ? screen : fallbackScr
    const designDocument = buildDesignDocument(title, layers, runtimeTokens, frameW, frameH)
    const screenLayout = buildDirectedFirstScreen(intent, finalScreen, intent.domain, brief)

    return {
        id: randomId(),
        title,
        philosophy,
        seed,
        blueprint,
        tokens,
        screen: finalScreen,
        screenLayout,
        designDocument,
    }
}

function briefDescription(intent: IntentJSON, sourcePrompt: string): string {
    return sourcePrompt.trim() || `${intent.domain} — ${intent.emotionalTone}. ${intent.coreTasks.join(', ')}`
}

async function validateConceptOnBrief(
    title: string,
    philosophy: string,
    intent: IntentJSON,
    sourcePrompt: string,
): Promise<boolean> {
    const brief = briefDescription(intent, sourcePrompt)
    const system = `You are a creative director checking if a design direction is on-brief.
A different visual style is fine. A completely different subject is not.
Answer YES or NO only. No explanation.`
    const user = `Brief: ${brief}

Direction title: ${title}
Direction philosophy: ${philosophy}

Is this direction conceptually related to the brief?`
    try {
        const raw = await callLLM(system, user)
        return raw.trim().toUpperCase().startsWith('YES')
    } catch {
        return true
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

function explorationFingerprint(e: Exploration): string {
    if (e.designDocument) return layerFingerprint(e.designDocument)
    return layoutFingerprint(e.screenLayout)
}

function validateDivergence(explorations: Exploration[]): boolean {
    if (explorations.length <= 1) return true

    const families = new Set(explorations.map(e => e.seed.family))
    const minDistinctFamilies = explorations.length >= 4 ? 3 : 2
    if (families.size < minDistinctFamilies) return false

    const bgs = explorations.map(e => hexBrightness(e.tokens.colors.background))
    const fonts = new Set(explorations.map(e => e.tokens.typography.fontFamily))

    const bgRange = Math.max(...bgs) - Math.min(...bgs)
    const hasFontVariety = fonts.size >= 2
    const fingerprints = new Set(explorations.map(explorationFingerprint))
    const hasDistinctStructures = fingerprints.size === explorations.length

    return bgRange > 30 && hasFontVariety && hasDistinctStructures
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
    _usedSeeds: CreativeSeed[],
    references: ReferenceSignals,
    count: 1 | 2 | 4,
): Promise<Exploration[]> {
    if (validateDivergence(explorations) || explorations.length <= 1) return explorations

    const usedFamilies = new Set(explorations.map(e => e.seed.family))
    const replacementSeed = pickReplacementSeed(usedFamilies)
    const usedLayoutFingerprints = new Set(explorations.map(e => layoutFingerprint(e.screenLayout)))
    const forcedComposition = COMPOSITIONS.find(c => {
        const brief = fallbackBrief(intent, replacementSeed, 'wild', c, 'statement-first')
        const synthetic = buildDirectedFirstScreen(intent, explorations[0]!.screen, intent.domain, brief)
        return !usedLayoutFingerprints.has(layoutFingerprint(synthetic))
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
    _usedSeeds: CreativeSeed[],
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

    const usedFamilies = new Set(explorations.map(e => e.seed.family))
    const replacementSeed = pickReplacementSeed(usedFamilies)
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

    const offBriefIndices: number[] = []
    await Promise.all(
        explorations.map(async (exp, i) => {
            const onBrief = await validateConceptOnBrief(
                exp.title,
                exp.philosophy,
                intent,
                sourcePrompt,
            )
            if (!onBrief) offBriefIndices.push(i)
        }),
    )
    if (offBriefIndices.length > 0) {
        const anchor = briefDescription(intent, sourcePrompt)
        const next = [...explorations]
        for (const i of offBriefIndices) {
            const exp = explorations[i]!
            const replacement = await generateOneExploration(
                intent,
                exp.seed,
                archetype,
                references,
                i,
                count,
                undefined,
                anchor,
            )
            next[i] = replacement
            onProgress?.(replacement)
        }
        explorations = next
    }

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
