import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    placeholder?: string
    type?: string
    value?: string
    icon?: string
}

export function Input({ tokens, placeholder, type = 'text', value, icon }: Props) {
    const safeType = asText(type, 'text')
    const safePlaceholder = asText(placeholder)
    const safeValue = asText(value)

    return (
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IconElement name={icon} size={16} className={tokens.tone.muted} />
                </div>
            )}
            <input
                type={safeType}
                placeholder={safePlaceholder}
                defaultValue={safeValue}
                className={`
                    w-full transition-all duration-200 outline-none
                    ${tokens.shape.input} bg-[var(--color-surface-alt)] ${tokens.tone.text} border ${tokens.tone.border}
                    focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] focus:-translate-y-px
                    ${tokens.typography.body} placeholder:${tokens.tone.muted} placeholder:opacity-60
                    hover:border-[var(--color-muted)]
                    ${icon ? 'pl-10 pr-3 py-2' : 'px-3 py-2'}
                `}
            />
        </div>
    )
}
