import type { DesignDecisions, InterfaceSurface, LayoutStrategy } from '../types/pipeline'
import type { ExplorationTokens } from './explorationEngine'

function luma(hex: string): number {
    const raw = hex.replace('#', '')
    if (raw.length < 6) return 0.5
    const r = parseInt(raw.slice(0, 2), 16) / 255
    const g = parseInt(raw.slice(2, 4), 16) / 255
    const b = parseInt(raw.slice(4, 6), 16) / 255
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function layoutForSurface(surface: InterfaceSurface): LayoutStrategy {
    switch (surface) {
        case 'analytical': return 'sidebar-main'
        case 'workspace': return 'sidebar-main'
        case 'immersive': return 'canvas'
        case 'mobile': return 'top-nav-content'
        case 'marketing': return 'top-nav-content'
    }
}

export function deriveDecisions(
    tokens: ExplorationTokens,
    seedName: string,
    surface: InterfaceSurface = 'marketing',
): DesignDecisions {
    const isDark = luma(tokens.colors.background) < 0.35
    const isRounded = parseInt(tokens.radius.card, 10) >= 16
    const isBold = parseInt(tokens.typography.headingWeight, 10) >= 700
    const hasGlow = tokens.shadow === 'glow'
    const isHeavy = tokens.shadow === 'heavy' || tokens.shadow === 'lift'

    const visualTone = seedName.includes('brutalist') ? 'bold' as const
        : seedName.includes('editorial') ? 'editorial' as const
        : seedName.includes('futuristic') ? 'linear' as const
        : seedName.includes('playful') ? 'playful' as const
        : seedName.includes('luxury') ? 'minimal' as const
        : seedName.includes('system') ? 'vercel' as const
        : isDark && isBold ? 'bold' as const
        : 'minimal' as const

    const cards = hasGlow || seedName.includes('futuristic') ? 'elevated' as const
        : seedName.includes('system') || seedName.includes('editorial') ? 'bordered' as const
        : isHeavy ? 'elevated' as const
        : 'flat' as const

    const tables = seedName.includes('system') || seedName.includes('brutalist') ? 'dense' as const
        : seedName.includes('editorial') ? 'minimal' as const
        : 'striped' as const

    const buttons = isRounded ? 'pill' as const
        : seedName.includes('system') ? 'label' as const
        : 'icon-label' as const

    const typographyStrategy = seedName.includes('editorial') ? 'editorial' as const
        : seedName.includes('system') || seedName.includes('brutalist') ? 'utilitarian' as const
        : seedName.includes('luxury') ? 'display' as const
        : isBold ? 'expressive' as const
        : 'utilitarian' as const

    return {
        layoutStrategy: layoutForSurface(surface),
        navigationPosition: surface === 'analytical' || surface === 'workspace' ? 'left-rail' : 'top',
        density: surface === 'analytical' ? 'compact' : 'comfortable',
        visualTone,
        primaryColorFamily: tokens.colors.primary,
        accentUsage: 'focused',
        typographyStrategy,
        componentMorphology: { cards, tables, buttons, inputs: 'outlined' },
        contentArchitecture: [],
        hierarchyFlow: [],
        interactionModel: 'click-to-drill',
    }
}
