import { PromptBar } from './PromptBar'
import { ExplorationGrid } from './ExplorationGrid'
import { ExpandedView } from './ExpandedView'
import { usePicoStore } from '../store/picoStore'

export default function App() {
    const { mode, error, explorations } = usePicoStore()

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <PromptBar />

            {error && (
                <div className="mx-6 mt-4 rounded border border-red-900 bg-red-950/60 p-3 text-xs text-red-300 font-mono">
                    {error}
                </div>
            )}

            {mode === 'idle' && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <p className="text-sm text-gray-300">Explore {'->'} Select {'->'} Expand {'->'} Export</p>
                        <p className="mt-2 text-xs">Describe a product idea to generate divergent creative directions.</p>
                    </div>
                </div>
            )}

            {mode === 'exploring' && (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 text-sm font-mono animate-pulse">Exploring creative directions...</p>
                </div>
            )}

            {mode === 'selecting' && explorations.length > 0 && <ExplorationGrid />}

            {mode === 'expanding' && (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 text-sm font-mono animate-pulse">Developing this direction...</p>
                </div>
            )}

            {mode === 'done' && <ExpandedView />}
        </div>
    )
}
