import type { ResolvedTokens } from '../../types/pipeline'

export function ChartBlock({ tokens }: { tokens: ResolvedTokens }) {
    return <div className={`${tokens.tone.card} ${tokens.shape.card} h-48 flex items-center justify-center border border-dashed`}>[Chart]</div>
}
