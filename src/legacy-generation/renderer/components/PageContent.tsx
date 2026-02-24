import React from 'react'
import type { ResolvedTokens } from '../../../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    children?: React.ReactNode
}

export function PageContent({ tokens, children }: Props) {
    return (
        <main className={`${tokens.layout.main} ${tokens.density.section} mx-auto w-full max-w-7xl p-6`}>
            {children}
        </main>
    )
}
