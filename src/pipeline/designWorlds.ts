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
    {
        name: 'luxury-editorial',
        family: 'editorial',
        directive: `Luxury editorial, calm authority, architecture and silence.
Typography: refined serif or high-end grotesk, generous tracking, small labels.
Composition: massive whitespace, asymmetrical restraint, slow hierarchy.
Color logic: warm off-white, charcoal text, one muted metallic accent used sparingly.
Details: hairline borders, subtle dividers, no heavy shadows, no loud gradients.
PROHIBITED: neon, playful rounded UI, loud badges, busy patterns, dense grids, heavy drop shadows.`,
    },
    {
        name: 'newspaper-bold',
        family: 'editorial',
        directive: `Newspaper front page energy with bold modern hierarchy.
Typography: strong serif headlines, tight leading, crisp subheads, small caps labels.
Composition: column logic, rules and dividers, intentional density with clear scanning.
Color logic: black, off-white, one accent (deep red or ink blue) used once per screen.
PROHIBITED: soft gradients, glassmorphism, huge rounded cards, pastel palettes, playful icon sets.`,
    },
    {
        name: 'swiss-grid',
        family: 'editorial',
        directive: `Swiss grid precision, typographic rigor, modernist clarity.
Typography: neutral grotesk, strict scale, consistent baseline rhythm.
Composition: clear grid, aligned edges, modular blocks, disciplined spacing.
Color logic: minimal, primarily monochrome, single accent used for focus only.
PROHIBITED: noisy decoration, random spacing, mixed alignment, inconsistent radii, gimmick effects.`,
    },
    {
        name: 'art-magazine',
        family: 'editorial',
        directive: `Art magazine cover as interface, expressive but controlled.
Typography: large editorial headline, supporting small text, contrast in weights.
Composition: one dominant element, intentional negative space, curated imbalance.
Color logic: muted gallery palette, paper tones, one bold art accent.
PROHIBITED: generic SaaS hero patterns, default card grids, standard nav bars, overly safe layout.`,
    },

    {
        name: 'terminal-dark',
        family: 'dark',
        directive: `Terminal inspired dark UI, data-first, serious tool energy.
Typography: monospace or mono-sans hybrid, compact sizes, high information density.
Composition: panels, dividers, rows, dense but readable, clear state indicators.
Color logic: near-black background, soft gray text, one vivid status accent.
PROHIBITED: huge marketing headlines, pastel gradients, big rounded soft cards, decorative illustrations.`,
    },
    {
        name: 'deep-space',
        family: 'dark',
        directive: `Deep space atmosphere, technical and cinematic.
Typography: geometric sans, slightly wide tracking, confident headings.
Composition: layered depth, panels floating with subtle borders, clear focal area.
Color logic: deep navy to black, subtle spatial gradients, one electric accent.
PROHIBITED: flat white backgrounds, warm paper palettes, playful rounded buttons, cluttered grids.`,
    },
    {
        name: 'noir-cinema',
        family: 'dark',
        directive: `Noir cinema mood, high contrast, dramatic lighting.
Typography: elegant serif or condensed sans, strong hierarchy, confident restraint.
Composition: large hero, deep shadows, spotlight focus, minimal UI chrome.
Color logic: black, off-black, ivory text, one gold or crimson accent.
PROHIBITED: bright cheerful palettes, cartoon icons, bubbly radii, dense dashboards.`,
    },
    {
        name: 'obsidian-minimal',
        family: 'dark',
        directive: `Obsidian minimal, luxurious dark restraint.
Typography: modern sans, small labels, refined scale.
Composition: minimal elements, strong spacing, quiet confidence.
Color logic: charcoal surfaces, subtle border contrast, tiny accent usage.
PROHIBITED: heavy glow, neon overload, busy textures, unnecessary gradients, excessive animation.`,
    },

    {
        name: 'electric-pop',
        family: 'vibrant',
        directive: `Electric pop, bold contemporary energy, creator internet culture.
Typography: heavy rounded sans, big confident headings, playful microcopy.
Composition: chunky blocks, confident contrast, clear CTA dominance.
Color logic: bright saturated background, strong foreground, one contrasting secondary.
PROHIBITED: grayscale minimalism, timid hierarchy, subtle hairline-only UI, luxury editorial restraint.`,
    },
    {
        name: 'sunset-gradient',
        family: 'vibrant',
        directive: `Sunset gradient optimism with premium polish.
Typography: clean modern sans, friendly confidence, clear hierarchy.
Composition: spacious hero, gradient atmosphere, crisp panels above.
Color logic: warm gradient field, high contrast text, restrained secondary accents.
PROHIBITED: harsh black-white only, terminal aesthetics, brutalist overlap, overly dense layouts.`,
    },
    {
        name: 'neon-night',
        family: 'vibrant',
        directive: `Neon night city energy, nightlife tech, high voltage.
Typography: sharp sans, confident headings, tight buttons, strong emphasis.
Composition: dark base with neon accents, glowing separators, punchy components.
Color logic: near-black with neon cyan, magenta, lime used strategically.
PROHIBITED: warm paper tones, soft craft textures, grayscale corporate SaaS, timid accents.`,
    },
    {
        name: 'candy-system',
        family: 'vibrant',
        directive: `Candy system UI, playful but systematic, bright and clean.
Typography: rounded sans, readable sizes, friendly hierarchy.
Composition: modular cards with clear grouping, friendly spacing.
Color logic: bright pastels with strong contrast text, one saturated anchor color.
PROHIBITED: brutalist raw overlap, ultra-dark noir, overly minimal monochrome, heavy editorial serif dominance.`,
    },

    {
        name: 'developer-minimal',
        family: 'minimal',
        directive: `Developer minimal, modern tool clarity, quiet competence.
Typography: neutral sans or mono-sans, compact scale, precise labels.
Composition: clean grid, functional panels, minimal decoration.
Color logic: near-white or near-black with one reserved accent.
PROHIBITED: decorative gradients, loud color fields, giant marketing headlines, playful icon chaos.`,
    },
    {
        name: 'zen-white',
        family: 'minimal',
        directive: `Zen white, calm breathing room, maximum readability.
Typography: clean sans, soft weights, stable hierarchy.
Composition: large whitespace, few elements, gentle rhythm.
Color logic: whites and warm grays, single calm accent.
PROHIBITED: dense dashboards, heavy borders, loud saturation, harsh contrast blocks.`,
    },
    {
        name: 'monochrome-pro',
        family: 'minimal',
        directive: `Monochrome pro, crisp and editorial-lite, premium neutrality.
Typography: modern grotesk, confident weights, precise scale.
Composition: sharp alignment, disciplined spacing, minimal surfaces.
Color logic: grayscale with one functional accent only.
PROHIBITED: neon palettes, playful rounded candy UI, heavy shadows, noisy textures.`,
    },
    {
        name: 'ink-schematic',
        family: 'minimal',
        directive: `Ink schematic, blueprint-like clarity, diagrammatic UI language.
Typography: mono labels, technical small text, clear headings.
Composition: outlines, grids, precise spacing, schematic feel.
Color logic: off-white, ink black, one blueprint accent (blue or green).
PROHIBITED: soft gradients, glass blur, playful shapes, luxury gold accents, heavy drop shadows.`,
    },

    {
        name: 'craft-studio',
        family: 'warm',
        directive: `Craft studio warmth, tactile, human, handmade polish.
Typography: serif for headings or warm sans, comfortable sizes.
Composition: cozy sections, generous padding, subtle texture feel.
Color logic: warm neutrals, clay accents, soft contrast with readable text.
PROHIBITED: neon cyberpunk, terminal dark panels, brutalist overlap, cold sterile minimalism.`,
    },
    {
        name: 'terracotta-earth',
        family: 'warm',
        directive: `Terracotta earth, grounded and premium, calm warmth.
Typography: refined serif or warm grotesk, stable hierarchy.
Composition: layered sections, soft cards, clear CTA but not aggressive.
Color logic: terracotta, sand, olive accents with strong readable text.
PROHIBITED: pure black backgrounds, neon accents, glassmorphism, high-tech sci-fi styling.`,
    },
    {
        name: 'warm-dark',
        family: 'warm',
        directive: `Warm dark, candlelit premium mood, intimate and calm.
Typography: elegant serif headings, readable sans body.
Composition: deep surfaces with warm highlights, quiet hierarchy.
Color logic: espresso, bronze, warm ivory text, minimal accent usage.
PROHIBITED: cold neon glows, sterile white pages, playful candy colors, brutalist raw typography.`,
    },
    {
        name: 'paper-notebook',
        family: 'warm',
        directive: `Paper notebook feel, thoughtful, personal, writing-friendly.
Typography: readable serif or friendly sans, subtle emphasis.
Composition: notebook sections, gentle dividers, light structure.
Color logic: paper background, graphite text, small ink accent.
PROHIBITED: harsh tech panels, neon colors, heavy shadows, loud marketing hero blocks.`,
    },

    {
        name: 'brutalist-raw',
        family: 'expressive',
        directive: `Brutalist raw, intentionally disruptive, anti-template.
Typography: huge contrast, oversized headings, unexpected alignment.
Composition: asymmetric blocks, edge-to-edge sections, intentional tension.
Color logic: stark backgrounds with aggressive accent blocks.
PROHIBITED: safe centered hero, polite spacing everywhere, generic SaaS card grids, subtle-only aesthetic.`,
    },
    {
        name: 'maximalist',
        family: 'expressive',
        directive: `Maximalist, layered, rich, energetic but controlled.
Typography: bold display headings with smaller dense supporting text.
Composition: layered panels, badges, rich sectioning, high visual variety.
Color logic: multiple accents with clear hierarchy and readable text.
PROHIBITED: minimal monochrome, excessive whitespace only, timid hierarchy, one-note layouts.`,
    },
    {
        name: 'glitch-digital',
        family: 'expressive',
        directive: `Glitch digital, cyber artifact vibe, experimental interface.
Typography: sharp sans or mono, occasional distorted emphasis, strong hierarchy.
Composition: cut panels, offset layers, subtle scanline or glitch accents.
Color logic: dark base with sharp digital accents, controlled noise.
PROHIBITED: warm craft palettes, luxury editorial softness, overly clean corporate minimalism.`,
    },
    {
        name: 'poster-typography',
        family: 'expressive',
        directive: `Poster typography, graphic design as UI, big type first.
Typography: headline dominates, supporting copy minimal and sharp.
Composition: strong grid breaks, intentional negative space, bold blocks.
Color logic: minimal palette, one punch accent used decisively.
PROHIBITED: generic nav + hero + three cards pattern, tiny timid headings, purely functional tool layout.`,
    },

    {
        name: 'glass-premium',
        family: 'spatial',
        directive: `Glass premium, depth and atmosphere, high fidelity surfaces.
Typography: modern sans, light weights, confident headings.
Composition: layered glass panels over atmospheric background, clear focal plane.
Color logic: deep gradient field, glass highlights, restrained accent.
PROHIBITED: flat paper-only aesthetic, brutalist raw overlap, noisy maximalism, harsh grid density.`,
    },
    {
        name: 'aurora-gradient',
        family: 'spatial',
        directive: `Aurora gradient space, calm luminous depth, premium futuristic.
Typography: geometric sans, slightly wide tracking, elegant hierarchy.
Composition: floating sections, soft depth cues, spacious layout.
Color logic: aurora gradients with high contrast type, minimal extra accents.
PROHIBITED: newspaper dividers, craft textures, terminal panels, aggressive brutalist blocks.`,
    },
    {
        name: 'museum-gallery',
        family: 'spatial',
        directive: `Museum gallery, curated objects in space, quiet presence.
Typography: refined sans, small labels, confident headings.
Composition: large negative space, spotlight cards, curated grouping.
Color logic: neutral gallery tones with one tasteful accent.
PROHIBITED: dense dashboards, loud saturation, glitch effects, busy decorative elements.`,
    },
]

function groupByFamily(seeds: CreativeSeed[]) {
    const map = new Map<SeedFamily, CreativeSeed[]>()
    for (const s of seeds) {
        const list = map.get(s.family) ?? []
        list.push(s)
        map.set(s.family, list)
    }
    return map
}

function randInt(maxExclusive: number) {
    return Math.floor(Math.random() * maxExclusive)
}

function pickOne<T>(arr: T[]): T {
    return arr[randInt(arr.length)]!
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
    const byFamily = groupByFamily(SEED_LIBRARY)
    const families = Array.from(byFamily.keys())

    if (count === 1) {
        const fam = pickOne(families)
        return [pickOne(byFamily.get(fam)!)]
    }

    if (count === 2) {
        const editorial = byFamily.get('editorial')
        const dark = byFamily.get('dark')
        if (!editorial?.length || !dark?.length) {
            const shuffled = shuffle(families)
            const a = pickOne(byFamily.get(shuffled[0]!)!)
            const b = pickOne(byFamily.get(shuffled[1]!)!)
            return [a, b]
        }
        return [pickOne(editorial), pickOne(dark)]
    }

    const pickedFamilies = shuffle(families).slice(0, 4)
    return pickedFamilies.map(fam => pickOne(byFamily.get(fam)!))
}

export function pickReplacementSeed(usedFamilies: Set<string>): CreativeSeed {
    const candidates = SEED_LIBRARY.filter(s => !usedFamilies.has(s.family))
    if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)]!
    return SEED_LIBRARY[Math.floor(Math.random() * SEED_LIBRARY.length)]!
}

export function formatSeedForPrompt(seed: CreativeSeed): string {
    return `CREATIVE SEED
name: ${seed.name}
family: ${seed.family}

DIRECTIVE
${seed.directive}`
}
