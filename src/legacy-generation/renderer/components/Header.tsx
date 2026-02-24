import React from 'react'
import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'
import { AnimateIn } from './AnimateIn'

interface Props {
    tokens: ResolvedTokens
    title: string
    subtitle?: string
    icon?: string
    badge?: string
    children?: React.ReactNode
}

export function Header({ tokens, title, subtitle, icon, badge }: Props) {
    const safeTitle = asText(title, 'Untitled')
    const safeSubtitle = asText(subtitle)

    return (
        <AnimateIn>
            <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    {icon && (
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center ${tokens.shape.card} ${tokens.gradient.subtle} border ${tokens.tone.border}`}>
                            <IconElement name={icon} size={20} className={tokens.colors.accentText} />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className={`${tokens.typography.heading} ${tokens.tone.text}`}>
                                {safeTitle}
                            </h1>
                            {badge && (
                                <span className={`${tokens.shape.badge} ${tokens.status.infoBg} px-2 py-0.5 ${tokens.typography.micro} font-medium`}>
                                    {badge}
                                </span>
                            )}
                        </div>
                        {safeSubtitle && (
                            <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-1`}>
                                {safeSubtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AnimateIn>
    )
}
