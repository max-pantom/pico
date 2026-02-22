import { useMemo } from 'react'
import { LayoutRenderer } from '../renderer/LayoutRenderer'
import { TokenInjector } from '../renderer/TokenInjector'
import { usePicoStore } from '../store/picoStore'
import { buildTokensFromRuntime } from '../pipeline/tokenBuilder'
import { explorationToRuntimeTokens } from '../pipeline/explorationEngine'
import { deriveDecisions } from '../pipeline/deriveDecisions'

export function ExpandedView() {
    const { selectedExploration, fullLayout, intent } = usePicoStore()
    const surface = intent?.surface ?? 'marketing'

    const decisions = useMemo(() => {
        if (!selectedExploration) return null
        return deriveDecisions(selectedExploration.tokens, selectedExploration.seed.name, surface)
    }, [selectedExploration, surface])

    const resolvedTokens = useMemo(() => {
        if (!selectedExploration || !decisions) return null
        const runtime = explorationToRuntimeTokens(selectedExploration.tokens)
        return buildTokensFromRuntime(runtime, decisions.layoutStrategy, {
            cards: decisions.componentMorphology.cards,
            tables: decisions.componentMorphology.tables,
            buttons: decisions.componentMorphology.buttons,
        })
    }, [selectedExploration, decisions])

    if (!selectedExploration || !fullLayout || !resolvedTokens || !decisions) return null

    return (
        <div className="flex-1 overflow-auto">
            <TokenInjector tokens={resolvedTokens}>
                <LayoutRenderer node={fullLayout} tokens={resolvedTokens} decisions={decisions} />
            </TokenInjector>
        </div>
    )
}
