import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    children: React.ReactNode
}

export function Shell({ tokens, children }: Props) {
    return (
        <div className={`${tokens.colors.surfaceBg} ${tokens.layout.wrapper}`}>
            {children}
        </div>
    )
}
