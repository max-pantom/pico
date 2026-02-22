import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    label: string
    variant?: 'primary' | 'secondary' | 'outline'
    onClick?: () => void
}

export function Button({ tokens, label, variant = 'primary', onClick }: Props) {
    const safeLabel = asText(label, 'Action')

    let style = ''
    if (variant === 'primary') {
        style = `${tokens.colors.primaryBg} ${tokens.colors.primaryHover} ${tokens.colors.primaryText} border border-transparent ${tokens.tone.shadow}`
    } else if (variant === 'secondary') {
        style = `${tokens.tone.card} ${tokens.tone.text} border ${tokens.tone.border} hover:bg-neutral-50`
    } else {
        style = `bg-transparent ${tokens.colors.primaryText} border border-current hover:bg-white/10`
    }

    const shapeClass = tokens.morphology.buttons === 'pill' ? 'rounded-full' : tokens.shape.button
    const hasIcon = tokens.morphology.buttons === 'icon-label'

    return (
        <button
            onClick={onClick}
            className={`
                ${style} ${tokens.typography.label} ${shapeClass} px-4 py-2
                transition-all duration-200 ease-out active:scale-95
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current
                ${hasIcon ? 'flex items-center gap-2' : ''}
            `}
        >
            {hasIcon && (
                <span className="w-4 h-4 rounded-full bg-current opacity-20 inline-block" />
            )}
            {safeLabel}
        </button>
    )
}
