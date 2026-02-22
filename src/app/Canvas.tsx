import { ExplorationGrid } from './ExplorationGrid'
import { ExpandedView } from './ExpandedView'
import { SectionNavigator } from './SectionNavigator'
import { ScreenPreview, surfaceAspectRatio } from '../renderer/ScreenPreview'
import { usePicoStore } from '../store/picoStore'
import type { Exploration } from '../pipeline/explorationEngine'
import type { InterfaceSurface } from '../types/pipeline'

export function Canvas() {
    const { mode, error, count, explorations, intent, fullLayout } = usePicoStore()

    return (
        <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
            {error && (
                <div className="mx-6 mt-4 rounded border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300 font-mono">
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-auto flex flex-col min-h-0">
                {mode === 'idle' && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-neutral-500">
                            <p className="text-sm text-neutral-400 text-balance">
                                Explore {'->'} Select {'->'} Expand {'->'} Export
                            </p>
                            <p className="mt-2 text-xs text-pretty">
                                Describe a product idea to generate divergent creative directions.
                            </p>
                        </div>
                    </div>
                )}

                {mode === 'exploring' && (
                    <StreamingGrid
                        count={count}
                        explorations={explorations}
                        surface={intent?.surface ?? 'marketing'}
                    />
                )}

                {mode === 'selecting' && explorations.length > 0 && <ExplorationGrid />}

                {mode === 'expanding' && <SkeletonExpanded />}

                {mode === 'done' && <ExpandedView />}
            </div>

            {mode === 'done' && fullLayout && <SectionNavigator layout={fullLayout} />}
        </div>
    )
}

function StreamingGrid({
    count,
    explorations,
    surface,
}: {
    count: 1 | 2 | 4
    explorations: Exploration[]
    surface: InterfaceSurface
}) {
    const isMobile = surface === 'mobile'

    const gridClass = isMobile
        ? count === 1
            ? 'flex justify-center'
            : count === 2
                ? 'flex justify-center gap-4'
                : 'flex flex-wrap justify-center gap-4'
        : {
            1: 'grid grid-cols-1 max-w-3xl mx-auto',
            2: 'grid grid-cols-1 lg:grid-cols-2',
            4: 'grid grid-cols-2',
        }[count]

    const ratio = surfaceAspectRatio(surface)

    return (
        <div className="flex-1 p-4 overflow-y-auto flex items-start justify-center">
            <div className={`${gridClass} ${isMobile ? '' : 'gap-4 w-full'}`}>
                {Array.from({ length: count }).map((_, i) => {
                    const exploration = explorations[i]
                    if (exploration) {
                        return (
                            <div
                                key={exploration.id}
                                className={`rounded-xl overflow-hidden border border-neutral-800 animate-[fadeIn_0.4s_ease-out] ${isMobile ? 'w-[220px]' : ''}`}
                                style={{ aspectRatio: ratio }}
                            >
                                <ScreenPreview exploration={exploration} surface={surface} />
                            </div>
                        )
                    }
                    return (
                        <SkeletonCard
                            key={`skeleton-${i}`}
                            surface={surface}
                            ratio={ratio}
                        />
                    )
                })}
            </div>
        </div>
    )
}

function SkeletonCard({ surface, ratio }: { surface: InterfaceSurface; ratio: string }) {
    const isMobile = surface === 'mobile'

    return (
        <div
            className={`rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden flex flex-col ${isMobile ? 'w-[220px]' : ''}`}
            style={{ aspectRatio: ratio }}
        >
            <div className="flex-1 relative">
                <div className="absolute inset-0 shimmer" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                    <div className="h-8 w-3/4 rounded-lg bg-neutral-800" />
                    <div className="h-4 w-1/2 rounded bg-neutral-800" />
                    <div className="h-10 w-32 rounded-full bg-neutral-800 mt-4" />
                </div>
            </div>
        </div>
    )
}

function SkeletonExpanded() {
    return (
        <div className="flex-1 p-5 space-y-0">
            <div className="rounded-t-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                <div className="relative h-72">
                    <div className="absolute inset-0 shimmer" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                        <div className="h-10 w-2/3 rounded-lg bg-neutral-800" />
                        <div className="h-4 w-1/3 rounded bg-neutral-800" />
                        <div className="h-10 w-36 rounded-full bg-neutral-800 mt-2" />
                    </div>
                </div>
            </div>
            <div className="border-x border-neutral-800 bg-neutral-900 p-6">
                <div className="shimmer h-5 w-48 rounded bg-neutral-800 mb-5" />
                <div className="grid grid-cols-3 gap-4">
                    <div className="shimmer h-28 rounded-xl bg-neutral-800" />
                    <div className="shimmer h-28 rounded-xl bg-neutral-800" />
                    <div className="shimmer h-28 rounded-xl bg-neutral-800" />
                </div>
            </div>
            <div className="rounded-b-2xl border border-neutral-800 bg-neutral-900 p-6">
                <div className="flex items-center justify-center gap-4">
                    <div className="shimmer h-5 w-56 rounded bg-neutral-800" />
                    <div className="shimmer h-10 w-32 rounded-full bg-neutral-800" />
                </div>
            </div>
        </div>
    )
}
