import type { ResolvedTokens } from '../../../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    spacing?: 'none' | 'sm' | 'md' | 'lg'
}

export function Divider({ tokens, spacing = 'md' }: Props) {
    let margins = 'my-4'
    if (spacing === 'none') margins = 'my-0'
    if (spacing === 'sm') margins = 'my-2'
    if (spacing === 'lg') margins = 'my-8'

    return <hr className={`border-t ${tokens.tone.border} ${margins}`} />
}
