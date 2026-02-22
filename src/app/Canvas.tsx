import { ExplorationGrid } from './ExplorationGrid'
import { ExpandedView } from './ExpandedView'
import { SectionNavigator } from './SectionNavigator'
import { usePicoStore } from '../store/picoStore'

export function Canvas() {
    const { mode, error, explorations, fullLayout } = usePicoStore()

    return (
        <div className="relative flex-1 flex flex-col min-w-0">
            {error && (
                <div className="mx-6 mt-4 rounded border border-red-900 bg-red-950/60 p-3 text-xs text-red-300 font-mono">
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-auto">
                {mode === 'idle' && (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <p className="text-sm text-gray-300 text-balance">
                                Explore {'->'} Select {'->'} Expand {'->'} Export
                            </p>
                            <p className="mt-2 text-xs text-pretty">
                                Describe a product idea to generate divergent creative directions.
                            </p>
                        </div>
                    </div>
                )}

                {mode === 'exploring' && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400 text-sm font-mono animate-pulse">
                            Exploring creative directions...
                        </p>
                    </div>
                )}

                {mode === 'selecting' && explorations.length > 0 && <ExplorationGrid />}

                {mode === 'expanding' && (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400 text-sm font-mono animate-pulse">
                            Developing this direction...
                        </p>
                    </div>
                )}

                {mode === 'done' && <ExpandedView />}
            </div>

            {mode === 'done' && fullLayout && <SectionNavigator layout={fullLayout} />}
        </div>
    )
}
