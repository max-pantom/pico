import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    children: React.ReactNode
}

export function Sidebar({ tokens, children }: Props) {
    return (
        <nav className={`${tokens.layout.sidebar} ${tokens.colors.surfaceBg} border-r ${tokens.colors.surfaceBorder}`}>
            <div className={`${tokens.density.section} p-3`}>
                {children}
            </div>
        </nav>
    )
}
