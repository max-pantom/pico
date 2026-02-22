import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    links?: string[]
    activeIndex?: number
    ctaLabel?: string
}

export function TopNav({ tokens, title = 'Workspace', links = [], activeIndex = 0, ctaLabel = 'Create' }: Props) {
    const safeTitle = asText(title, 'Workspace')
    const safeLinks = asStringArray(links)
    const safeCtaLabel = asText(ctaLabel, 'Create')

    return (
        <header className={`${tokens.layout.sidebar} border-b ${tokens.tone.border} bg-white/70 backdrop-blur`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
                <p className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{safeTitle}</p>
                <nav className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto">
                    {safeLinks.map((link, index) => (
                        <button
                            key={link}
                            className={`${tokens.typography.body} ${tokens.shape.button} px-3 py-1.5 transition-colors ${index === activeIndex ? `${tokens.colors.primaryBg} ${tokens.colors.primaryText}` : `${tokens.tone.muted} hover:bg-white/80 hover:text-current`}`}
                        >
                            {link}
                        </button>
                    ))}
                </nav>
                <button className={`${tokens.colors.primaryBg} ${tokens.colors.primaryHover} ${tokens.colors.primaryText} ${tokens.shape.button} ${tokens.typography.label} px-3 py-2`}>
                    {safeCtaLabel}
                </button>
            </div>
        </header>
    )
}
