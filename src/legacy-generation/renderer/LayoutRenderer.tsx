import { useMemo } from 'react'
import type { DesignDecisions, LayoutNode, ResolvedTokens } from '../../types/pipeline'
import { ComponentRegistry } from './ComponentRegistry'

const SECTION_COMPONENTS = new Set([
    'HeroSection',
    'FeatureGrid',
    'CTASection',
    'FooterSection',
    'WorkGrid',
    'KPIRow',
    'ChartBlock',
    'DataTable',
    'ActivityFeed',
    'Header',
    'Card',
    'Tabs',
])

interface Props {
    node: LayoutNode
    tokens: ResolvedTokens
    decisions: DesignDecisions
}

export function LayoutRenderer({ node, tokens, decisions }: Props) {
    const instanceCount = useMemo(() => new Map<string, number>(), [])
    return <LayoutNode_ node={node} tokens={tokens} decisions={decisions} instanceCount={instanceCount} />
}

function LayoutNode_({
    node,
    tokens,
    decisions,
    instanceCount,
}: Props & { instanceCount: Map<string, number> }) {
    const Component = ComponentRegistry[node.component]
    if (!Component) return null

    let sectionId: string | undefined
    if (SECTION_COMPONENTS.has(node.component)) {
        const count = (instanceCount.get(node.component) ?? 0) + 1
        instanceCount.set(node.component, count)
        sectionId = `section-${node.component.toLowerCase()}-${count}`
    }

    const inner = (
        <Component {...node.props} tokens={tokens} decisions={decisions}>
            {node.children?.map((child, i) => (
                <LayoutNode_ key={i} node={child} tokens={tokens} decisions={decisions} instanceCount={instanceCount} />
            ))}
        </Component>
    )

    if (sectionId) {
        return <div id={sectionId}>{inner}</div>
    }

    return inner
}
