import type { CSSProperties, ReactNode } from 'react'
import type { ResolvedTokens } from '../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    children: ReactNode
}

export function TokenInjector({ tokens, children }: Props) {
    const style = Object.entries(tokens.cssVars).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = value
        return acc
    }, {}) as CSSProperties

    return (
        <div
            style={{
                ...style,
                fontFamily: 'var(--font-family)',
                color: 'var(--color-text)',
            }}
            className="antialiased"
        >
            {children}
        </div>
    )
}
