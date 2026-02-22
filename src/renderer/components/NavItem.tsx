import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    label: string
    active?: boolean
    children?: React.ReactNode
}

export function NavItem({ tokens, label, active }: Props) {
    const safeLabel = asText(label, 'item')

    return (
        <button
            className={`
        w-full text-left transition-all duration-200 ease-out ${tokens.density.nav} ${tokens.shape.button}
        ${tokens.typography.body}
        ${active
                    ? `${tokens.colors.primaryBg} ${tokens.colors.primaryText} shadow-sm font-medium translate-x-1`
                    : `${tokens.tone.muted} hover:bg-black/5 hover:text-black hover:translate-x-1`
                }
      `}
        >
            {safeLabel}
        </button>
    )
}
