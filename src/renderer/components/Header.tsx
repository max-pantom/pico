import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title: string
    subtitle?: string
    children?: React.ReactNode
}

export function Header({ tokens, title, subtitle }: Props) {
    const safeTitle = asText(title, 'Untitled')
    const safeSubtitle = asText(subtitle)

    return (
        <div className="mb-6">
            <h1 className={`${tokens.typography.heading} ${tokens.tone.text} capitalize`}>
                {safeTitle}
            </h1>
            {safeSubtitle && (
                <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-1`}>
                    {safeSubtitle}
                </p>
            )}
        </div>
    )
}
