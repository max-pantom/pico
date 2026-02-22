import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    events?: string[]
}

const fallbackEvents = [
    'Patient admitted - Ward 3|2 min ago',
    'Lab results ready - J. Doe|8 min ago',
    'Medication dispensed - Room 12|15 min ago',
]

export function ActivityFeed({ tokens, title = 'Live Activity', events = fallbackEvents }: Props) {
    const safeTitle = asText(title, 'Live Activity')
    const safeEvents = asStringArray(events)

    return (
        <section className={`${tokens.tone.card} ${tokens.shape.card} ${tokens.density.card} ${tokens.tone.shadow}`}>
            <p className={`${tokens.typography.subheading} ${tokens.tone.text} mb-3`}>{safeTitle}</p>
            <ul className="space-y-2">
                {safeEvents.map((item, index) => {
                    const [message, time] = item.split('|')
                    return (
                        <li key={`${message}-${index}`} className="flex items-center justify-between gap-3 border-b border-current/10 pb-2 last:border-b-0 last:pb-0">
                            <span className={`flex items-center gap-2 ${tokens.typography.body} ${tokens.tone.text}`}>
                                <span className="inline-block h-2 w-2 rounded-full bg-current/60" />
                                {asText(message)}
                            </span>
                            <span className={`${tokens.typography.micro} ${tokens.tone.muted}`}>{asText(time)}</span>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
