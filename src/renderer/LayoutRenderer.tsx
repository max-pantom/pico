import type { DesignDecisions, LayoutNode, ResolvedTokens } from '../types/pipeline'
import { ComponentRegistry } from './ComponentRegistry'

interface Props {
    node: LayoutNode
    tokens: ResolvedTokens
    decisions: DesignDecisions
}

export function LayoutRenderer({ node, tokens, decisions }: Props) {
    const Component = ComponentRegistry[node.component]
    if (!Component) return null

    return (
        <Component {...node.props} tokens={tokens} decisions={decisions}>
            {node.children?.map((child, i) => (
                <LayoutRenderer key={i} node={child} tokens={tokens} decisions={decisions} />
            ))}
        </Component>
    )
}
