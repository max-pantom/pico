import { useEffect, useMemo, useRef, useState } from 'react'
import { TokenInjector } from './TokenInjector'
import { explorationToRuntimeTokens } from '../pipeline/explorationEngine'
import { buildTokensFromRuntime } from '../pipeline/tokenBuilder'
import { deriveDecisions } from '../pipeline/deriveDecisions'
import type { Exploration } from '../pipeline/explorationEngine'
import type { InterfaceSurface } from '../types/pipeline'
import { HeroRenderer } from './HeroRenderer'
import { SURFACE_RENDER } from './surfaceRender'

interface Props {
    exploration: Exploration
    surface: InterfaceSurface
}

export function ScreenPreview({ exploration, surface }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(0)

    const { w: RENDER_W, h: RENDER_H } = SURFACE_RENDER[surface]

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const measure = () => {
            const rect = el.getBoundingClientRect()
            setScale(rect.width / RENDER_W)
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    }, [RENDER_W])

    const decisions = useMemo(
        () => deriveDecisions(exploration.tokens, exploration.seed.name, surface),
        [exploration, surface],
    )

    const resolvedTokens = useMemo(() => {
        const runtime = explorationToRuntimeTokens(exploration.tokens)
        return buildTokensFromRuntime(runtime, decisions.layoutStrategy, {
            cards: decisions.componentMorphology.cards,
            tables: decisions.componentMorphology.tables,
            buttons: decisions.componentMorphology.buttons,
        })
    }, [exploration, decisions])

    const scaledH = RENDER_H * scale

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden"
            style={{ height: scaledH > 0 ? `${scaledH}px` : undefined }}
        >
            {scale > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${RENDER_W}px`,
                        height: `${RENDER_H}px`,
                        overflow: 'hidden',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                    }}
                    >
                        <TokenInjector tokens={resolvedTokens}>
                            <HeroRenderer exploration={exploration} tokens={resolvedTokens} />
                        </TokenInjector>
                </div>
            )}
        </div>
    )
}
