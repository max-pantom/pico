import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    children?: React.ReactNode
}

export function Card({ tokens, title, children }: Props) {
    const safeTitle = asText(title)
    let cardStyle = `${tokens.tone.card} ${tokens.density.card} ${tokens.shape.card}`

    // Apply morphological overrides
    switch (tokens.morphology.cards) {
        case 'flat':
            cardStyle = `${tokens.tone.surface} ${tokens.density.card} ${tokens.shape.card}`
            break
        case 'elevated':
            cardStyle = `bg-white dark:bg-gray-800 ${tokens.density.card} ${tokens.shape.card} shadow-xl border-t border-white/20 dark:border-white/5`
            break
        case 'bordered':
            cardStyle = `bg-transparent ${tokens.density.card} ${tokens.shape.card} border-2 ${tokens.tone.border}`
            break
        case 'panel':
            cardStyle = `${tokens.tone.card} ${tokens.density.card} w-full` // panels are flush, not rounded
            break
        default:
            cardStyle += ` ${tokens.tone.shadow} transition-shadow duration-300 hover:shadow-md`
    }

    const isPanel = tokens.morphology.cards === 'panel'

    return (
        <div className={cardStyle}>
            {safeTitle && (
                <div className={isPanel ? `bg-black/5 dark:bg-white/5 -mx-3 -mt-3 mb-3 p-3 border-b ${tokens.tone.border}` : ''}>
                    <h3 className={`${tokens.typography.subheading} ${tokens.tone.text} ${isPanel ? 'mb-0' : 'mb-2'}`}>
                        {safeTitle}
                    </h3>
                </div>
            )}
            {children}
        </div>
    )
}
