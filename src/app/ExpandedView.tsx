import { useMemo } from 'react'
import { LayoutRenderer } from '../renderer/LayoutRenderer'
import { TokenInjector } from '../renderer/TokenInjector'
import { usePicoStore } from '../store/picoStore'
import { buildTokensFromRuntime } from '../pipeline/tokenBuilder'
import { explorationToRuntimeTokens } from '../pipeline/explorationEngine'
import { exportToJSX } from '../lib/codeExporter'
import type { DesignDecisions } from '../types/pipeline'

const RENDERER_DECISIONS: DesignDecisions = {
    layoutStrategy: 'top-nav-content',
    navigationPosition: 'top',
    density: 'comfortable',
    visualTone: 'minimal',
    primaryColorFamily: 'blue-600',
    accentUsage: 'focused',
    typographyStrategy: 'display',
    componentMorphology: {
        cards: 'flat',
        tables: 'minimal',
        buttons: 'label',
        inputs: 'outlined',
    },
    contentArchitecture: ['hero', 'features', 'cta'],
    hierarchyFlow: ['Overview', 'Details', 'Contact'],
    interactionModel: 'click-to-drill',
}

export function ExpandedView() {
    const { selectedExploration, fullLayout } = usePicoStore()

    const resolvedTokens = useMemo(() => {
        if (!selectedExploration) return null
        return buildTokensFromRuntime(explorationToRuntimeTokens(selectedExploration.tokens), 'top-nav-content')
    }, [selectedExploration])

    if (!selectedExploration || !fullLayout || !resolvedTokens) return null

    const copyExport = async () => {
        const jsx = exportToJSX(fullLayout, explorationToRuntimeTokens(selectedExploration.tokens))
        await navigator.clipboard.writeText(jsx)
    }

    return (
        <div className="flex-1 p-6 overflow-auto space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-white font-medium">{selectedExploration.title}</p>
                    <p className="text-xs text-gray-500">{selectedExploration.philosophy}</p>
                </div>
                <button
                    onClick={copyExport}
                    className="px-4 py-2 text-xs rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                >
                    Copy JSX
                </button>
            </div>

            <div className="rounded-xl border border-gray-800 overflow-hidden min-h-[520px]">
                <TokenInjector tokens={resolvedTokens}>
                    <LayoutRenderer node={fullLayout} tokens={resolvedTokens} decisions={RENDERER_DECISIONS} />
                </TokenInjector>
            </div>
        </div>
    )
}
