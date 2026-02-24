import React from 'react'
import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    label: string
    children: React.ReactNode
}

export function FormGroup({ tokens, label, children }: Props) {
    const safeLabel = asText(label, 'Field')

    return (
        <div className="flex flex-col space-y-2 mb-4">
            <label className={`${tokens.typography.label} ${tokens.tone.text} opacity-90`}>
                {safeLabel}
            </label>
            {children}
        </div>
    )
}
