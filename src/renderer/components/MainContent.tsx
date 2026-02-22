import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    children: React.ReactNode
}

export function MainContent({ tokens, children }: Props) {
    return (
        <main className={`${tokens.layout.main} ${tokens.density.section} p-6`}>
            {children}
        </main>
    )
}
