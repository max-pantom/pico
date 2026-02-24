export interface CriticScore {
    overall: number
    hierarchy: number
    composition: number
    rhythm: number
    interaction: number
    accessibility: number
    archetype_fit: number
}

export interface CriticProblem {
    id: string
    category: 'hierarchy' | 'composition' | 'rhythm' | 'interaction' | 'accessibility' | 'archetype_fit'
    severity: 'critical' | 'high' | 'medium' | 'low'
    evidence: string
    fix_intent: string
}

export interface CriticMissingElement {
    id: string
    why: string
    minimal_addition: string
}

export interface CriticOutput {
    score: CriticScore
    verdict: 'pass' | 'revise'
    top_problems: CriticProblem[]
    missing_elements: CriticMissingElement[]
    non_negotiables: string[]
}

export interface PatchAction {
    id: string
    priority: number
    action: 'rewrite' | 'add' | 'remove' | 'restructure'
    target: 'component' | 'section' | 'layout' | 'styles'
    instruction: string
    acceptance: string[]
}

export interface LayoutDecision {
    pattern: 'immersive' | 'split' | 'sidebar' | 'topnav' | 'sheet' | 'stack'
    dominant_zone: string
    primary_action_placement: string
}

export interface DirectorOutput {
    patch_plan: PatchAction[]
    layout_decision: LayoutDecision
    accessibility_fixes: string[]
}

export interface PicoLoopResult {
    baselineCode: string
    improvedCode: string
    critic1: CriticOutput
    critic2: CriticOutput | null
    patchPlan: DirectorOutput | null
    seedFamily: string
    verdict: 'pass' | 'revise'
}
