import React from 'react'
import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    title?: string
    icon?: string
    children?: React.ReactNode
}

export function Card({ tokens, title, icon, children }: Props) {
    const safeTitle = asText(title)
    const morphology = tokens.morphology.cards

    const cardStyles: Record<string, string> = {
        flat: `bg-[var(--color-surface)] border ${tokens.tone.border}`,
        elevated: `bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-white/[0.06]`,
        bordered: `bg-transparent border-2 ${tokens.tone.border}`,
        panel: `bg-[var(--color-surface)] border ${tokens.tone.border} bg-gradient-to-br from-[var(--color-surface-alt)]/30 to-transparent`,
    }

    const cardStyle = cardStyles[morphology] || cardStyles.flat

    return (
        <div className={`${cardStyle} ${tokens.density.card} ${tokens.shape.card} transition-all duration-300 hover:shadow-md`}>
            {safeTitle && (
                <div className="flex items-center gap-2 mb-3">
                    {icon && (
                        <IconElement name={icon} size={16} className={tokens.tone.muted} />
                    )}
                    <h3 className={`${tokens.typography.subheading} ${tokens.tone.text}`}>
                        {safeTitle}
                    </h3>
                </div>
            )}
            {children}
        </div>
    )
}
