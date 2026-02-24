import type { ResolvedTokens } from '../../../types/pipeline'
import { asStringArray, asText } from '../safeValue'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    title?: string
    links?: string[]
    activeIndex?: number
    ctaLabel?: string
    brandIcon?: string
}

export function TopNav({ tokens, title = 'Workspace', links = [], activeIndex = 0, ctaLabel = 'Create', brandIcon }: Props) {
    const safeTitle = asText(title, 'Workspace')
    const safeLinks = asStringArray(links)
    const safeCtaLabel = asText(ctaLabel, 'Create')

    return (
        <header className={`w-full shrink-0 border-b ${tokens.tone.border} bg-[var(--color-surface)]/80 backdrop-blur-xl`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center ${tokens.shape.button} ${tokens.gradient.primary}`}>
                        <IconElement name={brandIcon || 'sparkles'} size={16} className="text-white" />
                    </div>
                    <p className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{safeTitle}</p>
                </div>
                <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
                    {safeLinks.map((link, index) => (
                        <button
                            key={link}
                            className={`${tokens.typography.body} ${tokens.shape.button} px-3 py-1.5 transition-all duration-200 ${
                                index === activeIndex
                                    ? `bg-[var(--color-surface-alt)] ${tokens.tone.text} font-medium`
                                    : `${tokens.tone.muted} hover:${tokens.tone.text} hover:bg-[var(--color-surface-alt)]/50`
                            }`}
                        >
                            {link}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-2">
                    <button className={`p-2 ${tokens.shape.button} ${tokens.tone.muted} hover:bg-[var(--color-surface-alt)] transition-colors`}>
                        <IconElement name="search" size={16} />
                    </button>
                    <button className={`p-2 ${tokens.shape.button} ${tokens.tone.muted} hover:bg-[var(--color-surface-alt)] transition-colors relative`}>
                        <IconElement name="bell" size={16} />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                    </button>
                    <button className={`${tokens.colors.primaryBg} ${tokens.colors.primaryHover} ${tokens.colors.primaryText} ${tokens.shape.button} ${tokens.typography.label} flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200`}>
                        <IconElement name="plus" size={14} className="text-current" />
                        {safeCtaLabel}
                    </button>
                </div>
            </div>
        </header>
    )
}
