import type { ResolvedTokens } from '../../types/pipeline'
import { asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    placeholder?: string
    type?: string
    value?: string
}

export function Input({ tokens, placeholder, type = 'text', value }: Props) {
    const safeType = asText(type, 'text')
    const safePlaceholder = asText(placeholder)
    const safeValue = asText(value)

    return (
        <input
            type={safeType}
            placeholder={safePlaceholder}
            defaultValue={safeValue}
            className={`
                w-full px-3 py-2 transition-all duration-200 outline-none
                ${tokens.shape.input} ${tokens.tone.surface} ${tokens.tone.text} border ${tokens.tone.border}
                focus:ring-2 focus:ring-neutral-400 focus:border-transparent focus:-translate-y-px
                ${tokens.typography.body} placeholder:opacity-40 hover:border-neutral-400
            `}
        />
    )
}
