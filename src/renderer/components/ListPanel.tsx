import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    children?: React.ReactNode
}

export function ListPanel({ tokens, title = 'Items', children }: Props) {
    const safeTitle = asText(title, 'Items')

    return (
        <aside className={`${tokens.layout.sidebar} border-r ${tokens.tone.border} bg-white/50`}>
            <div className="p-4">
                <p className={`${tokens.typography.label} ${tokens.tone.muted} mb-3`}>{safeTitle}</p>
                <div className="space-y-2">{children}</div>
            </div>
        </aside>
    )
}
