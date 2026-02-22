/**
 * Composition Engine — the Art Director layer.
 *
 * Decides WHERE attention goes, what dominates, what is secondary,
 * how dense the interface is, and the first emotional impression.
 *
 * Layout decisions become intentional BEFORE styling decisions exist.
 */

export type CompositionStrategy =
    | 'statement-first'
    | 'product-first'
    | 'story-first'
    | 'atmosphere-first'
    | 'tool-first'
    | 'proof-first'

export interface CompositionRules {
    /** Hero/above-fold height as viewport fraction or px */
    heroHeight: string
    /** Typography scale: small | medium | large | huge */
    headingScale: 'small' | 'medium' | 'large' | 'huge'
    /** Media/imagery priority: low | medium | high */
    mediaPriority: 'low' | 'medium' | 'high'
    /** Whitespace multiplier: 0.5 = tight, 1 = normal, 1.5+ = generous */
    whitespaceMultiplier: number
    /** Show product UI immediately (not hero-first) */
    showProductImmediately?: boolean
    /** Grid/cards visible above fold */
    gridVisible?: boolean
    /** Interface/tool visible immediately */
    showInterface?: boolean
    /** Minimize marketing chrome */
    minimizeMarketing?: boolean
    /** Lead with stats/testimonials */
    proofLeads?: boolean
    /** Editorial narrative flow */
    narrativeFlow?: boolean
}

export const COMPOSITION_STRATEGIES: Record<CompositionStrategy, CompositionRules> = {
    'statement-first': {
        heroHeight: '90vh',
        headingScale: 'huge',
        mediaPriority: 'low',
        whitespaceMultiplier: 1.8,
    },
    'product-first': {
        heroHeight: '70vh',
        headingScale: 'large',
        mediaPriority: 'high',
        whitespaceMultiplier: 1.2,
        showProductImmediately: true,
        gridVisible: true,
    },
    'story-first': {
        heroHeight: '75vh',
        headingScale: 'large',
        mediaPriority: 'medium',
        whitespaceMultiplier: 1.5,
        narrativeFlow: true,
    },
    'atmosphere-first': {
        heroHeight: '100vh',
        headingScale: 'medium',
        mediaPriority: 'high',
        whitespaceMultiplier: 2,
        minimizeMarketing: true,
    },
    'tool-first': {
        heroHeight: '60vh',
        headingScale: 'medium',
        mediaPriority: 'low',
        whitespaceMultiplier: 0.9,
        showInterface: true,
        minimizeMarketing: true,
    },
    'proof-first': {
        heroHeight: '65vh',
        headingScale: 'large',
        mediaPriority: 'low',
        whitespaceMultiplier: 1.1,
        proofLeads: true,
    },
}

export const ALL_STRATEGIES: CompositionStrategy[] = [
    'statement-first',
    'product-first',
    'story-first',
    'atmosphere-first',
    'tool-first',
    'proof-first',
]

/**
 * Pick a composition strategy for a given direction index.
 * Guarantees different strategy per direction (no two directions share a strategy).
 */
export function pickStrategyForDirection(index: number, count: 1 | 2 | 4): CompositionStrategy {
    const stride = count === 1 ? 1 : Math.floor(ALL_STRATEGIES.length / count) || 1
    const i = (index * stride + count) % ALL_STRATEGIES.length
    return ALL_STRATEGIES[i]!
}

/**
 * Format strategy for prompt injection.
 */
export function formatStrategyForPrompt(strategy: CompositionStrategy): string {
    const rules = COMPOSITION_STRATEGIES[strategy]
    const parts: string[] = [
        `First impression: ${strategy.replace('-', ' ')}`,
        `Hero height: ${rules.heroHeight}`,
        `Heading scale: ${rules.headingScale}`,
        `Whitespace: ${rules.whitespaceMultiplier}x`,
    ]
    if (rules.showProductImmediately) parts.push('Show product UI immediately')
    if (rules.gridVisible) parts.push('Grid visible above fold')
    if (rules.showInterface) parts.push('Interface visible immediately')
    if (rules.minimizeMarketing) parts.push('Minimize marketing chrome')
    if (rules.proofLeads) parts.push('Lead with stats/testimonials')
    if (rules.narrativeFlow) parts.push('Editorial narrative flow')
    return parts.join('. ')
}
