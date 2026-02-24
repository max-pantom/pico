import type { LayoutNode, ResolvedTokens, AppState } from '../../types/pipeline'

export function exportReactCode(
    layoutNodes: LayoutNode[],
    tokens: ResolvedTokens,
    state?: AppState
): string {
    const componentImports = new Set<string>()

    function collectImports(nodes: LayoutNode[]) {
        for (const node of nodes) {
            componentImports.add(node.component)
            if (node.children) collectImports(node.children)
        }
    }
    collectImports(layoutNodes)

    const importsString = `import React${state && state.variables.length > 0 ? ', { useState }' : ''} from 'react'
import { ${Array.from(componentImports).join(', ')} } from './components'
// Note: In a real project, you would import these components from your registry or library.
`

    let stateString = ''
    if (state) {
        stateString = state.variables.map(v =>
            `  const [${v.name}, set${v.name.charAt(0).toUpperCase() + v.name.slice(1)}] = useState<${v.type}>(${JSON.stringify(v.initialValue)})`
        ).join('\n')

        if (state.handlers.length > 0) {
            stateString += '\n\n' + state.handlers.map(h =>
                `  const ${h.name} = (${h.parameters.join(', ')}) => {\n    ${h.body}\n  }`
            ).join('\n\n')
        }
    }

    function renderNode(node: LayoutNode, indent = '      '): string {
        const propsString = Object.entries(node.props || {})
            .map(([key, value]) => {
                // If it's a string that looks like a state variable reference, bind it directly (remove quotes)
                if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
                    return `${key}=${value}`
                }
                if (typeof value === 'string' && value.startsWith('() =>')) {
                    return `${key}={${value}}` // Raw function handlers
                }
                // Check if the value is strictly an event handler name like 'handleAdd'
                if (typeof value === 'string' && state?.handlers.some(h => h.name === value)) {
                    return `${key}={${value}}`
                }

                if (typeof value === 'string') return `${key}="${value}"`
                return `${key}={${JSON.stringify(value)}}`
            })
            .join(' ')

        const propsSyntax = propsString ? ` ${propsString}` : ''

        // Pass tokens as a prop for our component architecture
        const tokenProp = ` tokens={tokens}`

        if (!node.children || node.children.length === 0) {
            return `${indent}<${node.component}${tokenProp}${propsSyntax} />`
        }

        const childrenString = node.children.map(c => renderNode(c, indent + '  ')).join('\n')
        return `${indent}<${node.component}${tokenProp}${propsSyntax}>\n${childrenString}\n${indent}</${node.component}>`
    }

    const jsxTree = layoutNodes.map(node => renderNode(node, '          ')).join('\n')

    return `${importsString}

export default function GeneratedApp() {
${stateString}

  const tokens = ${JSON.stringify(tokens, null, 4).replace(/\n/g, '\n  ')}

  return (
    <div className={\`\${tokens.colors.surfaceBg} \${tokens.layout.wrapper}\`}>
      <div className={tokens.layout.sidebar}>
        {/* Sidebar placeholder */}
      </div>
      <div className={tokens.layout.main}>
${jsxTree}
      </div>
    </div>
  )
}
`
}
