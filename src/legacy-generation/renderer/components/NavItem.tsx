import React from 'react'
import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    label: string
    icon?: string
    active?: boolean
    badge?: string
    children?: React.ReactNode
}

export function NavItem({ tokens, label, icon, active, badge }: Props) {
    const safeLabel = asText(label, 'item')

    return (
        <button
            className={`
                w-full flex items-center gap-2.5 transition-all duration-200 ease-out ${tokens.density.nav} ${tokens.shape.button}
                ${tokens.typography.body}
                ${active
                    ? `bg-[var(--color-primary)]/10 ${tokens.colors.accentText} font-medium`
                    : `${tokens.tone.muted} hover:bg-[var(--color-surface-alt)] hover:${tokens.tone.text}`
                }
            `}
        >
            {icon && <IconElement name={icon} size={16} className="shrink-0" />}
            <span className="flex-1 text-left truncate">{safeLabel}</span>
            {badge && (
                <span className={`${tokens.shape.badge} bg-[var(--color-primary)]/15 ${tokens.colors.accentText} px-1.5 py-0.5 ${tokens.typography.micro} font-medium`}>
                    {badge}
                </span>
            )}
            {active && <span className="h-5 w-0.5 rounded-full bg-[var(--color-primary)]" />}
        </button>
    )
}
