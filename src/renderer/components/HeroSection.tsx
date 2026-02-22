import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    subtitle?: string
    ctaLabel?: string
    secondaryCtaLabel?: string
}

export function HeroSection({
    tokens,
    title = 'Build something meaningful',
    subtitle = 'A focused product experience designed for your users',
    ctaLabel = 'Get started',
    secondaryCtaLabel = 'Learn more',
}: Props) {
    return (
        <section className={`${tokens.shape.card} ${tokens.tone.card} ${tokens.density.card} ${tokens.tone.shadow} border ${tokens.tone.border}`}>
            <h1 className={`${tokens.typography.heading} ${tokens.tone.text}`}>{asText(title, 'Build something meaningful')}</h1>
            <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-2 max-w-2xl`}>
                {asText(subtitle, 'A focused product experience designed for your users')}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
                <button className={`${tokens.colors.primaryBg} ${tokens.colors.primaryHover} ${tokens.colors.primaryText} ${tokens.shape.button} px-4 py-2 ${tokens.typography.label}`}>
                    {asText(ctaLabel, 'Get started')}
                </button>
                <button className={`${tokens.shape.button} ${tokens.typography.label} border ${tokens.tone.border} ${tokens.tone.text} px-4 py-2`}>
                    {asText(secondaryCtaLabel, 'Learn more')}
                </button>
            </div>
        </section>
    )
}
