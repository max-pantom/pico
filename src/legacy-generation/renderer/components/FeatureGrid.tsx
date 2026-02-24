import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'
import { StaggerContainer, StaggerItem } from './AnimateIn'

interface FeatureItem {
    title: string
    description?: string
    icon?: string
}

interface Props {
    tokens: ResolvedTokens
    title?: string
    subtitle?: string
    features?: (string | FeatureItem)[]
    columns?: 2 | 3
}

const FEATURE_ICONS = ['zap', 'shield', 'layers', 'globe', 'target', 'sparkles', 'rocket', 'code']

function normalizeFeatures(features: (string | FeatureItem)[]): FeatureItem[] {
    return features.map((f, i) => {
        if (typeof f === 'string') {
            return {
                title: f,
                description: 'Built with care to deliver exceptional results for your workflow.',
                icon: FEATURE_ICONS[i % FEATURE_ICONS.length],
            }
        }
        return {
            ...f,
            icon: f.icon || FEATURE_ICONS[i % FEATURE_ICONS.length],
            description: f.description || 'Built with care to deliver exceptional results for your workflow.',
        }
    })
}

export function FeatureGrid({ tokens, title = 'Key features', subtitle, features = [], columns = 3 }: Props) {
    const items = normalizeFeatures(features as (string | FeatureItem)[])
    const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'

    return (
        <section className="space-y-6">
            <div>
                <h2 className={`${tokens.typography.heading} ${tokens.tone.text}`}>{asText(title, 'Key features')}</h2>
                {subtitle && (
                    <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-2 max-w-2xl`}>{asText(subtitle)}</p>
                )}
            </div>
            <StaggerContainer className={`grid gap-4 ${gridCols}`}>
                {items.map((feature, index) => (
                    <StaggerItem key={`${feature.title}-${index}`}>
                        <article className={`${tokens.shape.card} ${tokens.tone.card} ${tokens.density.card} group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center ${tokens.shape.card} bg-[var(--color-primary)]/10`}>
                                <IconElement name={feature.icon} size={20} className={tokens.colors.accentText} />
                            </div>
                            <h3 className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{feature.title}</h3>
                            <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-2`}>{feature.description}</p>
                        </article>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </section>
    )
}
