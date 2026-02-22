import type { DesignDecisions, LayoutNode, ResolvedTokens } from '../types/pipeline'
import { ComponentRegistry } from './ComponentRegistry'

const SECTION_COMPONENTS = new Set([
    'HeroSection',
    'FeatureGrid',
    'CTASection',
    'FooterSection',
    'WorkGrid',
])

interface Props {
    node: LayoutNode
    tokens: ResolvedTokens
    decisions: DesignDecisions
}

export function LayoutRenderer({ node, tokens, decisions }: Props) {
    const Component = ComponentRegistry[node.component]
    if (!Component) return null

    const sectionId = SECTION_COMPONENTS.has(node.component)
        ? `section-${node.component.toLowerCase()}`
        : undefined

    const inner = (
        <Component {...node.props} tokens={tokens} decisions={decisions}>
            {node.children?.map((child, i) => (
                <LayoutRenderer key={i} node={child} tokens={tokens} decisions={decisions} />
            ))}
        </Component>
    )

    if (sectionId) {
        return <div id={sectionId}>{inner}</div>
    }

    return inner
}
