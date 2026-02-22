import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asText } from '../safeValue'
import { IconElement } from './IconElement'
import { AnimateIn } from './AnimateIn'

interface Props {
    tokens: ResolvedTokens
    title?: string
    events?: string[]
    icon?: string
}

const fallbackEvents = [
    'New deployment completed - v2.4.1|2 min ago',
    'User signup spike detected - 340 new|8 min ago',
    'Database backup completed|15 min ago',
    'API latency alert resolved|23 min ago',
    'Payment processed - $2,400|31 min ago',
]

const EVENT_ICONS = ['rocket', 'users', 'database', 'check-circle', 'credit-card', 'bell', 'mail', 'activity']
const EVENT_COLORS = [
    'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
    'bg-[var(--color-success)]/15 text-[var(--color-success)]',
    'bg-[var(--color-info)]/15 text-[var(--color-info)]',
    'bg-[var(--color-accent)]/15 text-[var(--color-accent)]',
    'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
]

export function ActivityFeed({ tokens, title = 'Live Activity', events = fallbackEvents, icon }: Props) {
    const safeTitle = asText(title, 'Live Activity')
    const safeEvents = asStringArray(events)

    return (
        <AnimateIn>
            <section className={`${tokens.tone.card} ${tokens.shape.card} ${tokens.density.card} ${tokens.tone.shadow}`}>
                <div className="flex items-center gap-2 mb-4">
                    {icon && <IconElement name={icon} size={16} className={tokens.tone.muted} />}
                    <p className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{safeTitle}</p>
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                </div>
                <ul className="space-y-1">
                    {safeEvents.map((item, index) => {
                        const [message, time] = item.split('|')
                        return (
                            <li key={`${message}-${index}`} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[var(--color-surface-alt)]/50">
                                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${EVENT_COLORS[index % EVENT_COLORS.length]}`}>
                                    <IconElement name={EVENT_ICONS[index % EVENT_ICONS.length]} size={13} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`${tokens.typography.body} ${tokens.tone.text} truncate`}>{asText(message)}</p>
                                    <p className={`${tokens.typography.micro} ${tokens.tone.muted} mt-0.5`}>{asText(time)}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </section>
        </AnimateIn>
    )
}
