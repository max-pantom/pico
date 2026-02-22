import type { LayoutNode, ResolvedTokens, DesignDecisions } from '../types/pipeline'

interface QualityResult {
    score: number
    issues: string[]
    passed: boolean
}

const PASS_THRESHOLD = 70

export function runQualityGate(
    layout: LayoutNode,
    tokens: ResolvedTokens,
    decisions: DesignDecisions
): QualityResult {
    const issues: string[] = []
    let score = 100

    // Rule: layout must have children
    if (!layout.children || layout.children.length < 1) {
        issues.push('Layout has no top-level sections')
        score -= 20
    }

    // Rule: hierarchy must have at least 3 items
    if (decisions.hierarchyFlow.length < 3) {
        issues.push('Hierarchy flow has fewer than 3 levels')
        score -= 15
    }

    // Rule: clinical tone should have no shadow
    if (decisions.visualTone === 'clinical' && tokens.tone.shadow !== '') {
        issues.push('Clinical tone should not use shadows')
        score -= 10
    }

    // Rule: compact density must use small text
    if (decisions.density === 'compact' && !tokens.density.table.includes('text-xs')) {
        issues.push('Compact density should use xs text in tables')
        score -= 10
    }

    // Rule: sidebar-main layout requires a Sidebar component
    if (decisions.layoutStrategy === 'sidebar-main') {
        const hasSidebar = layout.children?.some(c => c.component === 'Sidebar')
        if (!hasSidebar) {
            issues.push('sidebar-main layout requires a Sidebar component')
            score -= 25
        }
    }

    // Rule: canvas layout should not have a Sidebar
    if (decisions.layoutStrategy === 'canvas') {
        const hasSidebar = layout.children?.some(c => c.component === 'Sidebar')
        if (hasSidebar) {
            issues.push('canvas layout should not have a Sidebar')
            score -= 15
        }
    }

    if (decisions.layoutStrategy === 'top-nav-content') {
        const hasTopNav = layout.children?.some(c => c.component === 'TopNav')
        if (!hasTopNav) {
            issues.push('top-nav-content layout requires a TopNav component')
            score -= 20
        }
    }

    if (decisions.layoutStrategy === 'split-panel') {
        const hasListPanel = layout.children?.some(c => c.component === 'ListPanel')
        const hasDetailPanel = layout.children?.some(c => c.component === 'DetailPanel')
        if (!hasListPanel || !hasDetailPanel) {
            issues.push('split-panel layout requires ListPanel and DetailPanel components')
            score -= 20
        }
    }

    if (decisions.layoutStrategy === 'dense-grid') {
        const hasDenseGrid = layout.children?.some(c => c.component === 'DenseGrid')
        if (!hasDenseGrid) {
            issues.push('dense-grid layout requires a DenseGrid component')
            score -= 20
        }
    }

    return {
        score,
        issues,
        passed: score >= PASS_THRESHOLD,
    }
}
