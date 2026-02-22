import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'
import { AnimateIn } from './AnimateIn'

interface Props {
    tokens: ResolvedTokens
    title?: string
    subtitle?: string
    ctaLabel?: string
}

export function CTASection({ tokens, title = 'Ready to begin?', subtitle = 'Start with a guided setup in minutes.', ctaLabel = 'Start now' }: Props) {
    return (
        <AnimateIn>
            <section className={`${tokens.shape.card} relative overflow-hidden ${tokens.gradient.primary} text-white`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.15),transparent_50%)]" />
                <div className={`relative z-10 ${tokens.density.card} py-12 px-8 text-center`}>
                    <h2 className={`${tokens.typography.heading} text-white`}>{asText(title, 'Ready to begin?')}</h2>
                    <p className="mt-2 text-white/80 max-w-lg mx-auto">{asText(subtitle, 'Start with a guided setup in minutes.')}</p>
                    <button className={`mt-6 ${tokens.shape.button} bg-white text-black px-6 py-2.5 ${tokens.typography.label} shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 mx-auto`}>
                        {asText(ctaLabel, 'Start now')}
                        <IconElement name="arrow-right" size={14} className="text-current" />
                    </button>
                </div>
            </section>
        </AnimateIn>
    )
}
