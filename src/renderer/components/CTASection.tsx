import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    subtitle?: string
    ctaLabel?: string
}

export function CTASection({ tokens, title = 'Ready to begin?', subtitle = 'Start with a guided setup in minutes.', ctaLabel = 'Start now' }: Props) {
    return (
        <section className={`${tokens.shape.card} ${tokens.colors.primaryBg} ${tokens.colors.primaryText} ${tokens.density.card}`}>
            <h2 className={`${tokens.typography.subheading}`}>{asText(title, 'Ready to begin?')}</h2>
            <p className={`${tokens.typography.body} mt-2 opacity-90`}>{asText(subtitle, 'Start with a guided setup in minutes.')}</p>
            <button className={`mt-4 ${tokens.shape.button} bg-white/90 px-4 py-2 text-black ${tokens.typography.label}`}>
                {asText(ctaLabel, 'Start now')}
            </button>
        </section>
    )
}
