import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    label: string
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    icon?: string
    iconPosition?: 'left' | 'right'
    onClick?: () => void
}

export function Button({ tokens, label, variant = 'primary', icon, iconPosition = 'left', onClick }: Props) {
    const safeLabel = asText(label, 'Action')

    const styles: Record<string, string> = {
        primary: `${tokens.gradient.primary} text-white shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-xl hover:shadow-[var(--color-primary)]/30`,
        secondary: `${tokens.tone.card} ${tokens.tone.text} hover:bg-[var(--color-surface-alt)]`,
        outline: `bg-transparent ${tokens.tone.text} border ${tokens.tone.border} hover:bg-[var(--color-surface-alt)]`,
        ghost: `bg-transparent ${tokens.tone.muted} hover:${tokens.tone.text} hover:bg-[var(--color-surface-alt)]`,
    }

    const style = styles[variant] || styles.primary
    const shapeClass = tokens.morphology.buttons === 'pill' ? 'rounded-full' : tokens.shape.button
    const hasIcon = icon || tokens.morphology.buttons === 'icon-label'

    return (
        <button
            onClick={onClick}
            className={`
                ${style} ${tokens.typography.label} ${shapeClass} px-4 py-2
                transition-all duration-200 ease-out active:scale-[0.97]
                ${hasIcon ? 'flex items-center gap-2' : ''}
            `}
        >
            {hasIcon && iconPosition === 'left' && (
                <IconElement name={icon || 'arrow-right'} size={14} className="text-current" />
            )}
            {safeLabel}
            {hasIcon && iconPosition === 'right' && (
                <IconElement name={icon || 'arrow-right'} size={14} className="text-current" />
            )}
        </button>
    )
}
