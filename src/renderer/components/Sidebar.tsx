import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    brand?: string
    brandIcon?: string
    children: React.ReactNode
}

export function Sidebar({ tokens, brand, brandIcon, children }: Props) {
    return (
        <nav className={`${tokens.layout.sidebar} ${tokens.colors.surfaceBg} border-r ${tokens.colors.surfaceBorder}`}>
            {brand && (
                <div className={`flex items-center gap-2.5 border-b ${tokens.colors.surfaceBorder} px-4 py-4`}>
                    <div className={`flex h-8 w-8 items-center justify-center ${tokens.shape.button} ${tokens.gradient.primary}`}>
                        <IconElement name={brandIcon || 'sparkles'} size={16} className="text-white" />
                    </div>
                    <span className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{brand}</span>
                </div>
            )}
            <div className={`${tokens.density.section} p-3 flex-1`}>
                {children}
            </div>
            <div className={`border-t ${tokens.colors.surfaceBorder} p-3`}>
                <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-[var(--color-surface-alt)] transition-colors">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                        <IconElement name="user" size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`${tokens.typography.micro} ${tokens.tone.text} truncate`}>User</p>
                    </div>
                    <IconElement name="more" size={14} className={tokens.tone.muted} />
                </div>
            </div>
        </nav>
    )
}
