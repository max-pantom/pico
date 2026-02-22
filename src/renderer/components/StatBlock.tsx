import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    items: unknown[]
    children?: React.ReactNode
}

const mockValues = ['24', '8', '3', '142', '57']

interface MetricItem {
    label: string
    value?: string
    trend?: string
}

function normalizeMetricItems(items: unknown[]): MetricItem[] {
    if (!Array.isArray(items)) return []

    return items.map((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
            return { label: asText(item) }
        }

        if (!item || typeof item !== 'object') {
            return { label: 'Metric' }
        }

        const candidate = item as { label?: unknown; value?: unknown; trend?: unknown; component?: unknown; props?: unknown }

        if (typeof candidate.component === 'string' && candidate.component === 'MetricCard' && candidate.props && typeof candidate.props === 'object') {
            const metricProps = candidate.props as { label?: unknown; value?: unknown; trend?: unknown }
            return {
                label: asText(metricProps.label, 'Metric'),
                value: asText(metricProps.value),
                trend: asText(metricProps.trend),
            }
        }

        return {
            label: asText(candidate.label, 'Metric'),
            value: asText(candidate.value),
            trend: asText(candidate.trend),
        }
    })
}

export function StatBlock({ tokens, items }: Props) {
    const safeItems = normalizeMetricItems(items)
    const morphology = tokens.morphology.cards
    const cardToneByMorphology = {
        flat: `${tokens.tone.card} ${tokens.tone.shadow}`,
        elevated: `${tokens.tone.card} shadow-lg shadow-black/20`,
        bordered: `${tokens.tone.card} border-2 ${tokens.tone.border} shadow-none`,
        panel: `${tokens.tone.card} border ${tokens.tone.border} bg-gradient-to-br from-white/5 to-transparent`,
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {safeItems.map((item, i) => (
                <div key={i} className={`${cardToneByMorphology[morphology]} ${tokens.density.card} ${tokens.shape.card} transition-transform duration-300 hover:-translate-y-1 hover:shadow-md`}>
                    <p className={`${tokens.typography.micro} ${tokens.tone.muted}`}>{item.label}</p>
                    <p className={`${tokens.typography.heading} ${tokens.tone.text} mt-1`}>
                        {item.value || mockValues[i % mockValues.length]}
                    </p>
                    {item.trend && (
                        <p className={`${tokens.typography.micro} ${tokens.tone.muted} mt-1`}>{item.trend}</p>
                    )}
                </div>
            ))}
        </div>
    )
}
