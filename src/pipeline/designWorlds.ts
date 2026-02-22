export type SeedFamily =
    | 'editorial'
    | 'dark'
    | 'vibrant'
    | 'minimal'
    | 'warm'
    | 'expressive'
    | 'spatial'

export interface CreativeSeed {
    name: string
    family: SeedFamily
    directive: string
}

export const SEED_LIBRARY: CreativeSeed[] = [

    // ── EDITORIAL FAMILY ──────────────────────────────
    {
        name: 'luxury-editorial',
        family: 'editorial',
        directive: `White background. Serif headline, weight 300-400, wide tracking.
Body text tiny and considered — 11-12px. One gold or deep burgundy accent used once.
Feels like Vogue, not a startup. Extreme whitespace.
PROHIBITED: dark backgrounds, heavy weights, electric colors, gradients, rounded shapes.`,
    },
    {
        name: 'newspaper-bold',
        family: 'editorial',
        directive: `White or off-white background. Condensed serif or slab serif headline.
Weight 900. Dense layout, multiple text sizes creating hierarchy.
Feels like a broadsheet newspaper or a protest zine.
PROHIBITED: dark backgrounds, gradients, rounded corners, friendly language.`,
    },
    {
        name: 'swiss-grid',
        family: 'editorial',
        directive: `Pure white. Helvetica-style geometric sans only.
Type is the grid. Red or black as the only accent.
Feels like 1960s Swiss International Style poster design.
PROHIBITED: decorative elements, gradients, serif fonts, warm colors, shadows.`,
    },
    {
        name: 'art-magazine',
        family: 'editorial',
        directive: `Off-white or pale cream. Mix of very large and very small type.
Asymmetric layout — nothing centered. One image placeholder, large.
Feels like Apartamento or Monocle magazine.
PROHIBITED: dark backgrounds, all-caps headlines, electric colors, CTAs that feel pushy.`,
    },

    // ── DARK FAMILY ───────────────────────────────────
    {
        name: 'terminal-dark',
        family: 'dark',
        directive: `Pure black (#000000). Monospace font only. Green or amber accent.
Text feels like a command line. Dense, technical, no decoration.
Feels like a Bloomberg terminal or a hacker tool.
PROHIBITED: serif fonts, rounded shapes, warm colors, friendly language, gradients.`,
    },
    {
        name: 'deep-space',
        family: 'dark',
        directive: `Very dark navy or near-black with subtle star/noise texture.
Type: light weight geometric sans, wide tracking.
One electric blue or violet accent. Feels infinite and spatial.
PROHIBITED: warm colors, heavy type weights, white backgrounds, serif fonts.`,
    },
    {
        name: 'noir-cinema',
        family: 'dark',
        directive: `Deep charcoal (#1A1A1A). High contrast.
Typography: italic serif or condensed sans. Dramatic.
Feels like a film poster from the 1940s or a luxury whiskey brand.
PROHIBITED: bright colors, friendly rounded shapes, tech aesthetic, gradients.`,
    },
    {
        name: 'obsidian-minimal',
        family: 'dark',
        directive: `Near-black background (#0C0C0C). White type only, weight 300.
One hairline border as the only decorative element.
Extreme restraint. Feels like a luxury fashion brand's digital presence.
PROHIBITED: color accents, heavy weights, gradients, busy layouts, rounded corners.`,
    },

    // ── VIBRANT FAMILY ────────────────────────────────
    {
        name: 'electric-pop',
        family: 'vibrant',
        directive: `Background: electric lime (#CCFF00), hot coral, or vivid cyan.
Not dark. Not white. Saturated and committed.
Black type on vivid background. Feels like a rave flyer or streetwear drop.
PROHIBITED: dark backgrounds, gradients, serif fonts, corporate language.`,
    },
    {
        name: 'sunset-gradient',
        family: 'vibrant',
        directive: `Background: warm gradient from coral to deep orange or pink to purple.
White type floating over it. Weight 700-800. Large and confident.
Feels like a consumer app launch or a music festival.
PROHIBITED: flat solid backgrounds, dark moods, corporate structure, monospace.`,
    },
    {
        name: 'neon-night',
        family: 'vibrant',
        directive: `Dark background (#0A0A0F) with neon pink and cyan accents.
Type glows slightly. Feels like Tokyo at night or a cyberpunk aesthetic.
PROHIBITED: warm colors, serif fonts, minimal restraint, white backgrounds.`,
    },
    {
        name: 'candy-system',
        family: 'vibrant',
        directive: `Soft pastel background — baby blue, mint, lavender, or blush.
Type: rounded, friendly, weight 600-700. Large and approachable.
Feels like Duolingo or a Gen Z consumer app. Joyful.
PROHIBITED: dark backgrounds, serif fonts, aggressive language, corporate tone.`,
    },

    // ── MINIMAL FAMILY ────────────────────────────────
    {
        name: 'developer-minimal',
        family: 'minimal',
        directive: `White or #FAFAFA background. Geometric sans, weight 400-500.
Type is small and precise — 12-13px body. Gray scale only.
Feels like Linear, Vercel, or Raycast. Functional beauty.
PROHIBITED: gradients, warm colors, large heroic type, emotional language, shadows.`,
    },
    {
        name: 'zen-white',
        family: 'minimal',
        directive: `Pure white. Maximum whitespace. One element on screen at a time.
Type: thin weight (200-300), wide tracking. Nothing competes.
Feels like Muji or a Japanese product company. Silence as design.
PROHIBITED: multiple competing elements, bold weights, colors, gradients, busy layouts.`,
    },
    {
        name: 'monochrome-pro',
        family: 'minimal',
        directive: `White background, black type, no color whatsoever.
Every element sized by importance, not convention.
Feels like a serious design studio portfolio.
PROHIBITED: any color including accents, gradients, decorative elements, rounded shapes.`,
    },

    // ── WARM FAMILY ───────────────────────────────────
    {
        name: 'craft-studio',
        family: 'warm',
        directive: `Warm off-white or cream (#F5F0E8). Serif or rounded sans.
Weight 400-500. Feels handmade, considered, slow.
Like a Scandinavian design studio or a high-end food brand.
PROHIBITED: dark backgrounds, electric colors, heavy weights, tech aesthetic, all-caps.`,
    },
    {
        name: 'terracotta-earth',
        family: 'warm',
        directive: `Warm terracotta, ochre, or burnt sienna as the dominant color.
Natural. Organic. Type: serif with generous leading.
Feels like a sustainable brand or artisan food company.
PROHIBITED: cold colors, dark backgrounds, tech aesthetic, heavy geometric type.`,
    },
    {
        name: 'warm-dark',
        family: 'warm',
        directive: `Deep warm brown (#1A0F0A) or very dark burgundy background.
Cream or warm white type. Gold accent. Feels like aged whiskey or leather.
Rich, premium, tactile. Not tech.
PROHIBITED: cold tones, electric colors, clean geometric shapes, startup language.`,
    },
    {
        name: 'golden-hour',
        family: 'warm',
        directive: `Warm amber or honey-tinted off-white background.
Type: humanist serif or warm sans, weight 400-500. Rich golden accent.
Everything feels lit by late afternoon sun. Cozy, elevated, intentional.
PROHIBITED: cold blues, dark backgrounds, sharp geometric type, tech language.`,
    },

    // ── EXPRESSIVE FAMILY ─────────────────────────────
    {
        name: 'brutalist-raw',
        family: 'expressive',
        directive: `Stark white OR aggressive solid color (yellow, red).
Typography breaks convention: extreme size contrast, intentional asymmetry.
Text may overlap. Nothing is centered safely.
PROHIBITED: safe layouts, subtle colors, professional polish, rounded corners.`,
    },
    {
        name: 'maximalist',
        family: 'expressive',
        directive: `Everything is large. Multiple type sizes competing.
Rich color. Dense. Feels like a poster that demands to be read.
The opposite of minimal. Celebrates visual noise with intention.
PROHIBITED: whitespace as a value, restraint, one-color palettes, minimal layouts.`,
    },
    {
        name: 'glitch-digital',
        family: 'expressive',
        directive: `Dark background with intentional digital artifacts as aesthetic.
Type feels slightly displaced or corrupted. RGB split effect implied.
Electric. Feels like digital art or a music visualizer.
PROHIBITED: clean polished rendering, warm colors, serif fonts, corporate structure.`,
    },
    {
        name: 'protest-poster',
        family: 'expressive',
        directive: `High contrast, black and red on white or inverse.
Type is huge, condensed, uppercase. Message-driven layout.
Feels like a political broadside or punk album cover. Raw urgency.
PROHIBITED: subtlety, pastels, friendly rounded shapes, gentle language, gradients.`,
    },

    // ── GLASS / SPATIAL FAMILY ────────────────────────
    {
        name: 'glass-premium',
        family: 'spatial',
        directive: `Deep navy or dark purple with mesh gradient overlay.
Frosted glass card surface floating over it — translucent, blurred.
Type: light weight, geometric, wide tracking.
PROHIBITED: flat solid surfaces, serif fonts, warm colors, heavy weights.`,
    },
    {
        name: 'aurora-gradient',
        family: 'spatial',
        directive: `Dark background with a multi-color aurora gradient (green, teal, violet).
Type: white, light weight, appears to float above the color field.
Feels like a high-end SaaS product or Apple's spatial computing aesthetic.
PROHIBITED: flat backgrounds, warm colors, heavy type, serif fonts.`,
    },
    {
        name: 'depth-layers',
        family: 'spatial',
        directive: `Near-black base with stacked translucent panels at different depths.
Subtle blur and shadow create z-axis hierarchy. Content lives on glass cards.
Feels like visionOS or a spatial interface prototype.
PROHIBITED: flat layouts, warm colors, serif fonts, heavy borders, solid backgrounds.`,
    },
]

function groupByFamily(): Record<SeedFamily, CreativeSeed[]> {
    const map: Partial<Record<SeedFamily, CreativeSeed[]>> = {}
    for (const seed of SEED_LIBRARY) {
        if (!map[seed.family]) map[seed.family] = []
        map[seed.family]!.push(seed)
    }
    return map as Record<SeedFamily, CreativeSeed[]>
}

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j]!, a[i]!]
    }
    return a
}

export function pickDivergentSeeds(count: 1 | 2 | 4): CreativeSeed[] {
    const byFamily = groupByFamily()
    const families = Object.keys(byFamily) as SeedFamily[]

    if (count === 1) {
        const family = pickRandom(families)
        return [pickRandom(byFamily[family])]
    }

    if (count === 2) {
        return [
            pickRandom(byFamily.editorial),
            pickRandom(byFamily.dark),
        ]
    }

    const shuffled = shuffle(families)
    return shuffled.slice(0, 4).map(f => pickRandom(byFamily[f]))
}

export function formatSeedForPrompt(seed: CreativeSeed): string {
    return `CREATIVE SEED: ${seed.name} (family: ${seed.family})

${seed.directive}

You MUST follow every instruction above AND respect every PROHIBITED rule.
This direction should feel like it was designed by a world-class studio with an unmistakable point of view.
Do not soften, average, or compromise the aesthetic. Commit fully.`
}
