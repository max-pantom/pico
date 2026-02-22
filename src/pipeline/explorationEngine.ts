import { callLLM, extractJSON } from '../lib/llm'
import type { IntentJSON, LayoutNode, RuntimeDesignTokens } from '../types/pipeline'

export interface CreativeSeed {
    name: string
    directive: string
}

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
    heroLayout: LayoutNode
}

const CREATIVE_SEEDS: CreativeSeed[] = [
    {
        name: 'stark-editorial',
        directive: 'Maximum contrast with aggressive whitespace, manifesto-like hero, typography first.',
    },
    {
        name: 'warm-organic',
        directive: 'Warm and tactile with human softness, inviting and crafted feel, generous rhythm.',
    },
    {
        name: 'dark-expressive',
        directive: 'Near-black canvas, oversized type, saturated accent, memorable poster-like impact.',
    },
    {
        name: 'minimal-system',
        directive: 'Strict utility-first precision, subtle borders, no decorative noise, system clarity.',
    },
    {
        name: 'glass-futuristic',
        directive: 'Translucent layers over gradients, premium depth, spatial and futuristic tone.',
    },
    {
        name: 'brutalist-raw',
        directive: 'Raw composition, unconventional scale, high contrast, intentionally anti-safe.',
    },
    {
        name: 'playful-bold',
        directive: 'High-energy joyful palette, rounded forms, vibrant accents, approachable confidence.',
    },
    {
        name: 'luxury-restrained',
        directive: 'Refined restraint, sparse accent usage, elevated typography, deliberate quiet confidence.',
    },
]

const EXPLORATION_SYSTEM_PROMPT = `You are Pico, an AI creative director.
You are designing ONLY the hero section in a bold, differentiated way.
Output ONLY valid JSON.

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
      "headingWeight": "100|200|300|400|500|600|700|800|900",
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
  "hero": {
    "layout": "centered | left-aligned | split | fullbleed",
    "headline": "headline",
    "subheadline": "subheadline",
    "ctaPrimary": "primary label",
    "ctaSecondary": "secondary label or null",
    "backgroundTreatment": "solid | gradient | mesh | noise | geometric"
  }
}`

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

function pickDivergentSeeds(count: 1 | 2 | 4): CreativeSeed[] {
    if (count === 1) return [CREATIVE_SEEDS[Math.floor(Math.random() * CREATIVE_SEEDS.length)]]
    if (count === 2) return [CREATIVE_SEEDS[0], CREATIVE_SEEDS[2]]
    return [CREATIVE_SEEDS[0], CREATIVE_SEEDS[1], CREATIVE_SEEDS[2], CREATIVE_SEEDS[5]]
}

function parseExploration(raw: string, seed: CreativeSeed): Exploration {
    const parsed = JSON.parse(extractJSON(raw)) as {
        title?: unknown
        philosophy?: unknown
        tokens?: ExplorationTokens
        hero?: {
            layout?: unknown
            headline?: unknown
            subheadline?: unknown
            ctaPrimary?: unknown
            ctaSecondary?: unknown
            backgroundTreatment?: unknown
        }
    }

    const safeTokens = parsed.tokens && typeof parsed.tokens === 'object'
        ? parsed.tokens
        : FALLBACK_EXPLORATION_TOKENS

    return {
        id: randomId(),
        title: typeof parsed.title === 'string' ? parsed.title : seed.name,
        philosophy: typeof parsed.philosophy === 'string' ? parsed.philosophy : seed.directive,
        seed,
        tokens: safeTokens as ExplorationTokens,
        heroLayout: {
            component: 'HeroSection',
            props: {
                layout: parsed.hero?.layout,
                headline: parsed.hero?.headline,
                subheadline: parsed.hero?.subheadline,
                ctaPrimary: parsed.hero?.ctaPrimary,
                ctaSecondary: parsed.hero?.ctaSecondary,
                backgroundTreatment: parsed.hero?.backgroundTreatment,
            },
        },
    }
}

async function generateOneExploration(intent: IntentJSON, seed: CreativeSeed): Promise<Exploration> {
    const userMessage = `Creative directive:\n${seed.directive}\n\nProduct intent:\n${JSON.stringify(intent, null, 2)}`
    const raw = await callLLM(EXPLORATION_SYSTEM_PROMPT, userMessage)
    return parseExploration(raw, seed)
}

export async function generateExplorations(intent: IntentJSON, count: 1 | 2 | 4): Promise<Exploration[]> {
    const seeds = pickDivergentSeeds(count)
    return Promise.all(seeds.map(seed => generateOneExploration(intent, seed)))
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

    return {
        colors: {
            ...tokens.colors,
            onPrimary: tokens.colors.background,
        },
        typography: {
            fontFamily: mappedFont,
            baseSize: tokens.typography.bodySize,
            headingSize: tokens.typography.headingSize,
            bodySize: tokens.typography.bodySize,
            headingWeight: tokens.typography.headingWeight,
            headingTracking: tokens.typography.headingTracking,
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
