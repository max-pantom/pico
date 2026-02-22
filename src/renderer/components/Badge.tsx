import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    label: string
    variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info'
}

export function Badge({ tokens, label, variant = 'neutral' }: Props) {
    const safeLabel = asText(label, 'status')

    const colorStyles: Record<string, string> = {
        success: tokens.status.successBg,
        warning: tokens.status.warningBg,
        error: tokens.status.errorBg,
        info: tokens.status.infoBg,
        neutral: `bg-[var(--color-surface-alt)] ${tokens.tone.muted}`,
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium ${tokens.shape.badge} ${colorStyles[variant] || colorStyles.neutral}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {safeLabel}
        </span>
    )
}
