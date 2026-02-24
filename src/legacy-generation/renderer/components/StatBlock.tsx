import React from 'react'
import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'
import { Sparkline } from './Sparkline'
import { StaggerContainer, StaggerItem } from './AnimateIn'

interface Props {
    tokens: ResolvedTokens
    items: unknown[]
    children?: React.ReactNode
}

interface MetricItem {
    label: string
    value?: string
    trend?: string
    trendDirection?: string
    icon?: string
}

function normalizeMetricItems(items: unknown[]): MetricItem[] {
    if (!Array.isArray(items)) return []
    return items.map((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
            return { label: asText(item) }
        }
        if (!item || typeof item !== 'object') return { label: 'Metric' }
        const c = item as Record<string, unknown>
        if (typeof c.component === 'string' && c.component === 'MetricCard' && c.props && typeof c.props === 'object') {
            const p = c.props as Record<string, unknown>
            return {
                label: asText(p.label, 'Metric'),
                value: asText(p.value),
                trend: asText(p.trend),
                trendDirection: asText(p.trendDirection),
                icon: asText(p.icon),
            }
        }
        return {
            label: asText(c.label, 'Metric'),
            value: asText(c.value),
            trend: asText(c.trend),
            trendDirection: asText(c.trendDirection),
            icon: asText(c.icon),
        }
    })
}

const MOCK_SPARKS = [
    [30, 40, 35, 50, 49, 60, 70, 91, 85, 95],
    [50, 45, 60, 55, 70, 65, 80, 75, 90, 88],
    [20, 30, 25, 40, 35, 50, 45, 55, 65, 72],
    [80, 75, 85, 70, 90, 85, 95, 88, 92, 98],
]

export function StatBlock({ tokens, items }: Props) {
    const safeItems = normalizeMetricItems(items)
    const morphology = tokens.morphology.cards

    const cardBase = {
        flat: `bg-[var(--color-surface)] border ${tokens.tone.border}`,
        elevated: `bg-[var(--color-surface)] shadow-lg shadow-black/10 border border-white/5`,
        bordered: `bg-transparent border-2 ${tokens.tone.border}`,
        panel: `bg-[var(--color-surface)] border ${tokens.tone.border} bg-gradient-to-br from-[var(--color-surface-alt)]/50 to-transparent`,
    }

    return (
        <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {safeItems.map((item, i) => {
                const isUp = item.trendDirection === 'up' || item.trend?.startsWith('+')
                const isDown = item.trendDirection === 'down' || item.trend?.startsWith('-')
                const trendClass = isUp ? tokens.status.success : isDown ? tokens.status.error : tokens.tone.muted
                const sparkColor = isUp ? 'var(--color-success)' : isDown ? 'var(--color-error)' : 'var(--color-primary)'

                return (
                    <StaggerItem key={i}>
                        <div className={`${cardBase[morphology]} ${tokens.density.card} ${tokens.shape.card} group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.icon && (
                                            <IconElement name={item.icon} size={14} className={tokens.tone.muted} />
                                        )}
                                        <p className={`${tokens.typography.micro} ${tokens.tone.muted} truncate`}>{item.label}</p>
                                    </div>
                                    <p className={`${tokens.typography.heading} ${tokens.tone.text} mt-1`}>
                                        {item.value || '--'}
                                    </p>
                                </div>
                                <Sparkline data={MOCK_SPARKS[i % MOCK_SPARKS.length]} color={sparkColor} />
                            </div>
                            {item.trend && (
                                <div className="mt-2 flex items-center gap-1">
                                    <IconElement name={isUp ? 'trending-up' : isDown ? 'trending-down' : 'arrow-right'} size={12} className={trendClass} />
                                    <p className={`${tokens.typography.micro} ${trendClass} font-medium`}>{item.trend}</p>
                                </div>
                            )}
                        </div>
                    </StaggerItem>
                )
            })}
        </StaggerContainer>
    )
}
