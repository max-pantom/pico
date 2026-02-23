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
        name: 'antares-void',
        family: 'editorial',
        directive: `Background: pale sage #EDF2EC. The entire page is almost empty.
Text anchored bottom-left: studio name with italic serif A.
Description anchored top-right: small body text, no headline hierarchy.
Live clock bottom-right as the only dynamic element.
Small dark square bottom-left as the only non-text element.
Whitespace IS the dominant element — 80% empty. Two anchors: text top-right, branding bottom-left.
PROHIBITED: centered layouts, large headlines, images, decoration, dark backgrounds.`,
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
        name: 'synq-protocol',
        family: 'dark',
        directive: `Pure black #000000 background. White text only. No color accent whatsoever.
Right side: geometric dashed circle grid pattern as the dominant visual mass.
Left side: large weight-contrast headline — light then heavy.
Navigation: right-aligned with a white-border CTA box. Unusual placement.
PROHIBITED: any color, gradients, images, warm tones, rounded shapes.`,
    },
    {
        name: 'trading-terminal',
        family: 'dark',
        directive: `Near-black #0D0D14 with dark blue-tinted panels #161622.
Everything is small — 11-13px. Maximum information density.
Purple #8B5CF6 as the only accent, used on active states.
Panels tile edge to edge. Borders are barely visible.
PROHIBITED: whitespace, large text, images, decoration, warm tones.`,
    },
    {
        name: 'airsend-fintech',
        family: 'dark',
        directive: `Navy gradient background top-to-bottom: #1A2340 to #2A4060 to #3A6080.
White headline, weight 700, centered. Sky blue #4AABF7 on pill badge element.
Product screenshot in laptop frame below headline — large and prominent.
Pill-shape buttons. Small ghost CTA beside solid CTA.
PROHIBITED: warm colors, dark black, electric neon, serif fonts.`,
    },
    {
        name: 'new-money-cinematic',
        family: 'dark',
        directive: `Full-bleed street photography as the entire background — no padding, no border.
Italic serif headline, uppercase, 96px+, overlaid bottom-left on photo.
Navigation: uppercase sans with bracket-style CTA [CREATE AN ACCOUNT] in emerald green.
Emerald #00FF88 used only on the primary CTA and one nav bracket — nowhere else.
Monospace body text. Dark grid-line sections below the hero.
PROHIBITED: warm backgrounds, rounded corners, centered layouts, sans-serif headlines.`,
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
        name: 'norden-minimal',
        family: 'minimal',
        directive: `Pure white background with faint topographic contour lines at ~4% opacity.
Typography: light weight 300 geometric sans. Large but not heavy.
Small label 'NEW COLLECTION' in uppercase tracking — far left, small size.
Product photography bleeds off the bottom edge — no bottom margin.
Arrow CTA far right, understated. Crosshair (+) symbol as decorative detail.
PROHIBITED: color accents, heavy type weights, gradients, dark backgrounds.`,
    },
    {
        name: 'alfred-saas',
        family: 'minimal',
        directive: `White background. Clean geometric sans. Weight 600 headline.
Hero: product screenshot displayed large, filling most of the lower viewport.
Behind the screenshot: horizontal stripe gradient — soft purple, navy, dark blue.
Logo strip above screenshot: muted gray brand logos.
PROHIBITED: dark page background, heavy decoration, electric colors.`,
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
        name: 'claura-warm',
        family: 'warm',
        directive: `Background: warm blush #F2EDE8 — soft, inviting, feminine.
Typography: serif, weight 400, not bold. Elegant restraint.
Hero image: dot grid pattern over warm-to-cool gradient (coral to blue).
Buttons: pill shape, dark brown fill, white text. One solid, one ghost.
PROHIBITED: dark backgrounds, heavy type, electric colors, sharp corners.`,
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
        name: 'creators-streetwear',
        family: 'expressive',
        directive: `Background: electric lime #D4FF00 — the whole page IS lime.
Typography: condensed sans, weight 900, uppercase only, massive scale.
Primary color: hot pink #FF1493 used aggressively in headlines and accents.
Zero padding anywhere — elements bleed to all edges.
Images scatter between text without alignment — intentional chaos.
PROHIBITED: rounded corners, subtle colors, whitespace as value, gentle tone.`,
    },
    {
        name: 'bsod-brutalist',
        family: 'expressive',
        directive: `Solid #0000AA blue — the entire screen is this exact blue.
Monospace font only. Small text. Nothing large or heroic.
All content centered. Error code in a white-bordered box.
One emoji as decoration. Pure concept — the medium IS the message.
PROHIBITED: sans-serif, anything resembling a normal website, images, gradients.`,
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
    {
        name: 'twentyfirst-glass',
        family: 'spatial',
        directive: `Near-black #0A0A12 background with scattered gear icons at 8% opacity as texture.
Floating dark cards with subtle borders — glass depth without full transparency.
Typography: small, weight 400, nothing heroic. Interface text only.
Accent: muted blue-purple, used sparingly on interactive elements.
PROHIBITED: light backgrounds, large headlines, warm colors, bright accents.`,
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

function secureRandInt(maxExclusive: number): number {
    if (maxExclusive <= 0) return 0
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const buf = new Uint32Array(1)
        crypto.getRandomValues(buf)
        return buf[0]! % maxExclusive
    }
    return Math.floor(Math.random() * maxExclusive)
}

function pickOne<T>(arr: T[]): T {
    return arr[secureRandInt(arr.length)]!
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = secureRandInt(i + 1)
        ;[a[i], a[j]] = [a[j]!, a[i]!]
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
    if (candidates.length) return candidates[secureRandInt(candidates.length)]!
    return SEED_LIBRARY[secureRandInt(SEED_LIBRARY.length)]!
}

export function formatSeedForPrompt(seed: CreativeSeed): string {
    return `CREATIVE SEED
name: ${seed.name}
family: ${seed.family}

DIRECTIVE
${seed.directive}`
}
