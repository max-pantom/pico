import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface KPIItem {
    label: string
    value: string
}

interface Props {
    tokens: ResolvedTokens
    items?: KPIItem[]
}

const fallbackItems: KPIItem[] = [
    { label: 'Availability', value: '99.96%' },
    { label: 'P95 Latency', value: '182ms' },
    { label: 'Open Incidents', value: '3' },
    { label: 'Deploys', value: '14' },
]

export function KPIRow({ tokens, items = fallbackItems }: Props) {
    return (
        <div className={`grid grid-cols-2 gap-4 ${tokens.shape.card} border ${tokens.tone.border} ${tokens.tone.card} p-4 md:grid-cols-4`}>
            {items.map((item, index) => (
                <div key={`${item.label}-${index}`} className={index > 0 ? 'md:border-l md:border-current/15 md:pl-4' : ''}>
                    <p className={`${tokens.typography.micro} ${tokens.tone.muted}`}>{asText(item.label, 'KPI')}</p>
                    <p className={`${tokens.typography.subheading} ${tokens.tone.text} mt-1`}>{asText(item.value, '--')}</p>
                </div>
            ))}
        </div>
    )
}
