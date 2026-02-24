import { useMemo } from 'react'
import { LayoutRenderer } from '../renderer/LayoutRenderer'
import { TokenInjector } from '../renderer/TokenInjector'
import { usePicoStore } from '../../store/picoStore'
import { buildTokensFromRuntime } from '../pipeline/tokenBuilder'
import { explorationToRuntimeTokens } from '../../pipeline/explorationEngine'
import { deriveDecisions } from '../../pipeline/deriveDecisions'
import type { InterfaceSurface } from '../../types/pipeline'

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

    const rendered = (
        <TokenInjector tokens={resolvedTokens}>
            <LayoutRenderer node={fullLayout} tokens={resolvedTokens} decisions={decisions} />
        </TokenInjector>
    )

    return (
        <div className="flex-1 overflow-auto">
            <SurfaceFrame surface={surface}>
                {rendered}
            </SurfaceFrame>
        </div>
    )
}

function SurfaceFrame({
    surface,
    children,
}: {
    surface: InterfaceSurface
    children: React.ReactNode
}) {
    switch (surface) {
        case 'mobile':
            return (
                <div className="flex justify-center py-8 px-4">
                    <div className="relative w-[390px] h-[844px] shrink-0 rounded-[3rem] border-8 border-neutral-700 bg-neutral-950 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-neutral-700 rounded-b-2xl z-10" />
                        <div className="absolute inset-0 pt-[28px] pb-[24px] overflow-y-auto">
                            {children}
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-neutral-600 rounded-full z-10" />
                    </div>
                </div>
            )
        case 'analytical':
        case 'workspace':
            return <>{children}</>
        case 'immersive':
            return <div className="min-h-screen">{children}</div>
        case 'marketing':
        default:
            return <>{children}</>
    }
}
