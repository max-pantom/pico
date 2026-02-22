import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    headline?: string
    subtitle?: string
    subheadline?: string
    ctaLabel?: string
    ctaPrimary?: string
    secondaryCtaLabel?: string
    ctaSecondary?: string
    layout?: 'centered' | 'left-aligned' | 'split' | 'fullbleed'
    backgroundTreatment?: 'solid' | 'gradient' | 'mesh' | 'noise' | 'geometric'
}

export function HeroSection({
    tokens,
    title = 'Build something meaningful',
    headline,
    subtitle = 'A focused product experience designed for your users',
    subheadline,
    ctaLabel = 'Get started',
    ctaPrimary,
    secondaryCtaLabel = 'Learn more',
    ctaSecondary,
    layout = 'left-aligned',
    backgroundTreatment = 'solid',
}: Props) {
    const displayTitle = asText(headline || title, 'Build something meaningful')
    const displaySubtitle = asText(subheadline || subtitle, 'A focused product experience designed for your users')
    const displayPrimary = asText(ctaPrimary || ctaLabel, 'Get started')
    const displaySecondary = asText(ctaSecondary || secondaryCtaLabel)

    const isCentered = layout === 'centered'
    const backgroundClass = backgroundTreatment === 'gradient'
        ? 'bg-gradient-to-br from-[var(--color-background)] via-[var(--color-surface)] to-[var(--color-accent)]/20'
        : backgroundTreatment === 'mesh'
            ? 'bg-[var(--color-background)]'
            : `${tokens.tone.card}`

    return (
        <section className={`${tokens.shape.card} ${backgroundClass} ${tokens.density.card} ${tokens.tone.shadow} border ${tokens.tone.border} ${isCentered ? 'text-center items-center' : ''}`}>
            <h1 className={`${tokens.typography.heading} ${tokens.tone.text} ${isCentered ? 'mx-auto' : ''}`}>{displayTitle}</h1>
            <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-2 max-w-2xl ${isCentered ? 'mx-auto' : ''}`}>
                {displaySubtitle}
            </p>
            <div className={`mt-5 flex flex-wrap gap-3 ${isCentered ? 'justify-center' : ''}`}>
                <button className={`${tokens.colors.primaryBg} ${tokens.colors.primaryHover} ${tokens.colors.primaryText} ${tokens.shape.button} px-4 py-2 ${tokens.typography.label}`}>
                    {displayPrimary}
                </button>
                {displaySecondary && (
                    <button className={`${tokens.shape.button} ${tokens.typography.label} border ${tokens.tone.border} ${tokens.tone.text} px-4 py-2`}>
                        {displaySecondary}
                    </button>
                )}
            </div>
        </section>
    )
}
