import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    label: string
    value: string
    trend?: string
    trendDirection?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ tokens, label, value, trend = '+0.0%', trendDirection = 'neutral' }: Props) {
    const safeLabel = asText(label, 'Metric')
    const safeValue = asText(value, '--')
    const safeTrend = asText(trend, '+0.0%')

    const trendColor = trendDirection === 'up'
        ? 'text-emerald-600'
        : trendDirection === 'down'
            ? 'text-rose-600'
            : tokens.tone.muted

    const trendIcon = trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : '='

    return (
        <article className={`${tokens.tone.card} ${tokens.density.card} ${tokens.shape.card} ${tokens.tone.shadow}`}>
            <p className={`${tokens.typography.micro} ${tokens.tone.muted}`}>{safeLabel}</p>
            <p className={`${tokens.typography.heading} ${tokens.tone.text} mt-1`}>{safeValue}</p>
            <div className="mt-3 flex items-center justify-between">
                <p className={`${tokens.typography.micro} ${trendColor}`}>{trendIcon} {safeTrend}</p>
                <div className="flex h-6 w-20 items-end gap-1">
                    <span className="h-2 w-2 rounded bg-current opacity-40" />
                    <span className="h-3 w-2 rounded bg-current opacity-50" />
                    <span className="h-4 w-2 rounded bg-current opacity-60" />
                    <span className="h-3 w-2 rounded bg-current opacity-50" />
                    <span className="h-5 w-2 rounded bg-current opacity-70" />
                </div>
            </div>
        </article>
    )
}
