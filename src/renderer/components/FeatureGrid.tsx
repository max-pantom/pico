import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    features?: string[]
}

export function FeatureGrid({ tokens, title = 'Key features', features = [] }: Props) {
    const safeFeatures = asStringArray(features)

    return (
        <section className="space-y-4">
            <h2 className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{asText(title, 'Key features')}</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {safeFeatures.map((feature, index) => (
                    <article key={`${feature}-${index}`} className={`${tokens.shape.card} ${tokens.tone.card} ${tokens.density.card} border ${tokens.tone.border}`}>
                        <p className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{feature}</p>
                        <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-2`}>
                            Designed to support this capability with a clear and conversion-friendly section.
                        </p>
                    </article>
                ))}
            </div>
        </section>
    )
}
