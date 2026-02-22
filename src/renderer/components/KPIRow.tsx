import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'
import { AnimateIn } from './AnimateIn'

interface KPIItem {
    label: string
    value: string
    icon?: string
    progress?: number
}

interface Props {
    tokens: ResolvedTokens
    items?: KPIItem[]
}

const fallbackItems: KPIItem[] = [
    { label: 'Availability', value: '99.96%', icon: 'activity', progress: 99 },
    { label: 'P95 Latency', value: '182ms', icon: 'clock', progress: 72 },
    { label: 'Open Incidents', value: '3', icon: 'alert', progress: 15 },
    { label: 'Deploys', value: '14', icon: 'rocket', progress: 88 },
]

export function KPIRow({ tokens, items = fallbackItems }: Props) {
    return (
        <AnimateIn>
            <div className={`grid grid-cols-2 gap-3 md:grid-cols-4`}>
                {items.map((item, index) => {
                    const progress = item.progress ?? 50
                    return (
                        <div
                            key={`${item.label}-${index}`}
                            className={`${tokens.tone.card} ${tokens.shape.card} ${tokens.density.card} relative overflow-hidden transition-all duration-300 hover:shadow-md`}
                        >
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-border)]">
                                <div
                                    className="h-full bg-[var(--color-primary)] transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-2 mb-1.5">
                                {item.icon && <IconElement name={item.icon} size={14} className={tokens.tone.muted} />}
                                <p className={`${tokens.typography.micro} ${tokens.tone.muted}`}>{asText(item.label, 'KPI')}</p>
                            </div>
                            <p className={`${tokens.typography.heading} ${tokens.tone.text}`}>{asText(item.value, '--')}</p>
                        </div>
                    )
                })}
            </div>
        </AnimateIn>
    )
}
