import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'
import { Sparkline } from './Sparkline'
import { AnimateIn } from './AnimateIn'

interface Props {
    tokens: ResolvedTokens
    label: string
    value: string
    trend?: string
    trendDirection?: 'up' | 'down' | 'neutral'
    icon?: string
}

export function MetricCard({ tokens, label, value, trend = '+0.0%', trendDirection = 'neutral', icon }: Props) {
    const safeLabel = asText(label, 'Metric')
    const safeValue = asText(value, '--')
    const safeTrend = asText(trend, '+0.0%')

    const isUp = trendDirection === 'up'
    const isDown = trendDirection === 'down'
    const trendClass = isUp ? tokens.status.success : isDown ? tokens.status.error : tokens.tone.muted
    const sparkColor = isUp ? 'var(--color-success)' : isDown ? 'var(--color-error)' : 'var(--color-primary)'

    return (
        <AnimateIn>
            <article className={`${tokens.tone.card} ${tokens.density.card} ${tokens.shape.card} ${tokens.tone.shadow} group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 mb-1">
                    {icon && (
                        <div className={`flex h-6 w-6 items-center justify-center ${tokens.shape.badge} bg-[var(--color-primary)]/10`}>
                            <IconElement name={icon} size={12} className={tokens.colors.accentText} />
                        </div>
                    )}
                    <p className={`${tokens.typography.micro} ${tokens.tone.muted}`}>{safeLabel}</p>
                </div>
                <p className={`${tokens.typography.heading} ${tokens.tone.text} mt-1`}>{safeValue}</p>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <IconElement name={isUp ? 'trending-up' : isDown ? 'trending-down' : 'arrow-right'} size={14} className={trendClass} />
                        <p className={`${tokens.typography.micro} ${trendClass} font-medium`}>{safeTrend}</p>
                    </div>
                    <Sparkline color={sparkColor} />
                </div>
            </article>
        </AnimateIn>
    )
}
