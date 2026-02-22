import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    label: string
    variant?: 'success' | 'warning' | 'error' | 'neutral'
}

export function Badge({ tokens, label, variant = 'neutral' }: Props) {
    const safeLabel = asText(label, 'status')

    let colorStyle = ''
    switch (variant) {
        case 'success':
            colorStyle = 'bg-emerald-100 text-emerald-800'
            break
        case 'warning':
            colorStyle = 'bg-amber-100 text-amber-800'
            break
        case 'error':
            colorStyle = 'bg-rose-100 text-rose-800'
            break
        case 'neutral':
        default:
            colorStyle = `${tokens.tone.surface} ${tokens.tone.text} border ${tokens.tone.border}`
            break
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${tokens.shape.badge} ${colorStyle}`}>
            {safeLabel}
        </span>
    )
}
