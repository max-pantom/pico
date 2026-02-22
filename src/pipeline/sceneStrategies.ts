export type SceneStrategy =
    | 'immersive-surface'
    | 'object-focus'
    | 'interface-first'
    | 'cinematic-hero'
    | 'editorial-canvas'
    | 'control-dominant'

export interface SceneBlueprint {
    strategy: SceneStrategy
    dominantElement: string
    dominantCoverage: number
    secondaryElements: string[]
    interactionLayer: 'inline' | 'overlay' | 'sidebar' | 'bottom'
    avoidGrids: boolean
}

interface SceneDefinition {
    description: string
    rules: string[]
    forbids: string[]
    naturalFor: string[]
}

export const sceneDefinitions: Record<SceneStrategy, SceneDefinition> = {
    'immersive-surface': {
        description: 'A spatial surface leads first impression, then controls appear as supporting layers.',
        rules: [
            'Prioritize one atmospheric or environmental surface as the dominant region.',
            'Keep utility controls lightweight and context-attached.',
            'Use depth, scale, and motion cues instead of repeated card stacks.',
        ],
        forbids: [
            'Do not open with balanced dashboard quadrants.',
            'Do not flatten the dominant scene into equally weighted rows.',
        ],
        naturalFor: ['immersive products', 'simulation surfaces', 'showcase experiences'],
    },
    'object-focus': {
        description: 'A singular object or artifact dominates the scene with supporting details around it.',
        rules: [
            'Center hierarchy on one concrete object, item, or artifact.',
            'Support with compact metadata, actions, and context snippets.',
            'Keep visual noise low so the object reads immediately.',
        ],
        forbids: [
            'Do not split attention across many equal tiles.',
            'Do not lead with navigation chrome over the object itself.',
        ],
        naturalFor: ['commerce objects', 'device control views', 'single-record workflows'],
    },
    'interface-first': {
        description: 'The product interface itself is the hero, with feature narrative secondary.',
        rules: [
            'Make real UI controls and product mechanics the dominant element.',
            'Use supporting copy to explain capability, not replace it.',
            'Keep hierarchy task-oriented and legible at a glance.',
        ],
        forbids: [
            'Do not rely on generic marketing headline + cards composition.',
            'Do not bury core controls beneath decorative sections.',
        ],
        naturalFor: ['workspace tools', 'analytical apps', 'operations software'],
    },
    'cinematic-hero': {
        description: 'A dramatic narrative hero dominates, with utility and proof appearing as secondary beats.',
        rules: [
            'Lead with one dramatic focal composition and narrative statement.',
            'Keep secondary content concise and rhythmically staged.',
            'Use contrast and pacing to maintain emotional momentum.',
        ],
        forbids: [
            'Do not default to symmetric card matrices.',
            'Do not equalize headline, stats, and navigation weight.',
        ],
        naturalFor: ['brand storytelling', 'launch moments', 'high-impact marketing'],
    },
    'editorial-canvas': {
        description: 'An editorial composition with intentional alignment, hierarchy breaks, and textual rhythm.',
        rules: [
            'Use asymmetry and typography cadence as the main hierarchy driver.',
            'Support with selective modules rather than exhaustive utility panels.',
            'Keep negative space intentional and directional.',
        ],
        forbids: [
            'Do not normalize into strict equal columns.',
            'Do not overfill every region with controls.',
        ],
        naturalFor: ['editorial experiences', 'portfolio narratives', 'thoughtful brand canvases'],
    },
    'control-dominant': {
        description: 'Command controls and operational status dominate, with contextual support surrounding them.',
        rules: [
            'Primary region should foreground live controls or command state.',
            'Secondary region should hold context, logs, and supporting views.',
            'Optimize for rapid comprehension and actionability.',
        ],
        forbids: [
            'Do not prioritize decorative hero copy over controls.',
            'Do not collapse into a generic feature-card landing page.',
        ],
        naturalFor: ['admin operations', 'monitoring centers', 'control rooms'],
    },
}

export function suggestStrategy(surface: string, seedName: string): SceneStrategy {
    const normalizedSurface = surface.trim().toLowerCase()
    const normalizedSeed = seedName.trim().toLowerCase()
    const signal = `${normalizedSurface} ${normalizedSeed}`

    if (/editorial|magazine|journal|newspaper|type|story/.test(signal)) return 'editorial-canvas'
    if (/cinematic|film|movie|trailer|dramatic|noir/.test(signal)) return 'cinematic-hero'
    if (/control|command|ops|operator|console|cockpit|mission/.test(signal)) return 'control-dominant'
    if (/object|artifact|device|product|hardware|sku|item/.test(signal)) return 'object-focus'
    if (/immersive|spatial|environment|world|3d|atmosphere/.test(signal)) return 'immersive-surface'
    if (/dashboard|workspace|analysis|analytics|tool|panel|data/.test(signal)) return 'interface-first'

    if (normalizedSurface === 'immersive') return 'immersive-surface'
    if (normalizedSurface === 'analytical' || normalizedSurface === 'workspace') return 'interface-first'
    if (normalizedSurface === 'marketing') return 'cinematic-hero'
    if (normalizedSurface === 'mobile') return 'object-focus'

    return 'interface-first'
}
