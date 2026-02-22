import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'
import { AnimateIn } from './AnimateIn'

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
    badge?: string
    icon?: string
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
    backgroundTreatment = 'gradient',
    badge,
    icon,
}: Props) {
    const displayTitle = asText(headline || title, 'Build something meaningful')
    const displaySubtitle = asText(subheadline || subtitle, 'A focused product experience designed for your users')
    const displayPrimary = asText(ctaPrimary || ctaLabel, 'Get started')
    const displaySecondary = asText(ctaSecondary || secondaryCtaLabel)
    const safeBadge = asText(badge)

    const isCentered = layout === 'centered'

    return (
        <AnimateIn direction="none">
            <section className={`relative overflow-hidden ${tokens.shape.card} ${isCentered ? 'text-center' : ''}`}>
                {/* Gradient background */}
                <div className={`absolute inset-0 ${tokens.gradient.hero}`} />
                {backgroundTreatment === 'mesh' && (
                    <>
                        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--color-gradient-from)]/20 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--color-gradient-to)]/15 blur-3xl" />
                    </>
                )}
                {backgroundTreatment === 'geometric' && (
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-text) 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }} />
                )}
                {(backgroundTreatment === 'gradient' || backgroundTreatment === 'noise') && (
                    <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[var(--color-gradient-from)]/10 to-transparent" />
                )}

                <div className={`relative z-10 ${tokens.density.card} py-16 px-8 ${isCentered ? 'flex flex-col items-center' : ''}`}>
                    {safeBadge && (
                        <AnimateIn delay={0.1}>
                            <span className={`inline-flex items-center gap-1.5 ${tokens.shape.badge} border ${tokens.tone.border} bg-[var(--color-surface-alt)] px-3 py-1 ${tokens.typography.micro} ${tokens.tone.muted} font-medium mb-6`}>
                                {icon && <IconElement name={icon} size={12} className={tokens.colors.accentText} />}
                                {safeBadge}
                            </span>
                        </AnimateIn>
                    )}
                    <AnimateIn delay={0.15}>
                        <h1 className={`${tokens.typography.display} ${tokens.tone.text} max-w-3xl ${isCentered ? 'mx-auto' : ''}`}>
                            {displayTitle}
                        </h1>
                    </AnimateIn>
                    <AnimateIn delay={0.25}>
                        <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-4 max-w-2xl text-lg leading-relaxed ${isCentered ? 'mx-auto' : ''}`}>
                            {displaySubtitle}
                        </p>
                    </AnimateIn>
                    <AnimateIn delay={0.35}>
                        <div className={`mt-8 flex flex-wrap gap-3 ${isCentered ? 'justify-center' : ''}`}>
                            <button className={`${tokens.gradient.primary} text-white ${tokens.shape.button} px-5 py-2.5 ${tokens.typography.label} shadow-lg shadow-[var(--color-primary)]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[var(--color-primary)]/30 hover:-translate-y-0.5 flex items-center gap-2`}>
                                {displayPrimary}
                                <IconElement name="arrow-right" size={14} className="text-current" />
                            </button>
                            {displaySecondary && (
                                <button className={`${tokens.shape.button} ${tokens.typography.label} border ${tokens.tone.border} ${tokens.tone.text} px-5 py-2.5 transition-all duration-200 hover:bg-[var(--color-surface-alt)] hover:-translate-y-0.5`}>
                                    {displaySecondary}
                                </button>
                            )}
                        </div>
                    </AnimateIn>
                </div>
            </section>
        </AnimateIn>
    )
}
