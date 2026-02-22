import { expandExploration } from '../pipeline/expansionEngine'
import type { Exploration } from '../pipeline/explorationEngine'
import { usePicoStore } from '../store/picoStore'

export function DirectionList() {
    const {
        mode,
        explorations,
        selectedExploration,
        intent,
        selectExploration,
        setFullLayout,
        setMode,
        setError,
        reset,
    } = usePicoStore()

    const handleExpand = async (exploration: Exploration) => {
        if (!intent) return
        selectExploration(exploration)
        setMode('expanding')

        try {
            const fullLayout = await expandExploration(exploration, intent)
            setFullLayout(fullLayout)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to expand exploration')
        }
    }

    if (mode === 'done' && selectedExploration) {
        return (
            <div className="space-y-3">
                <p className="text-[11px] font-mono uppercase tracking-wide text-gray-500">
                    Direction
                </p>
                <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2.5">
                    <p className="text-xs text-white font-medium">
                        {selectedExploration.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        {selectedExploration.philosophy}
                    </p>
                </div>
                <button
                    onClick={reset}
                    className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                    New directions
                </button>
            </div>
        )
    }

    if (explorations.length === 0) return null

    return (
        <div className="space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wide text-gray-500">
                Directions
            </p>
            <div className="space-y-1">
                {explorations.map((exploration) => {
                    const isSelected = selectedExploration?.id === exploration.id
                    return (
                        <button
                            key={exploration.id}
                            onClick={() => selectExploration(exploration)}
                            className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                                isSelected
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`size-2 shrink-0 rounded-full border ${
                                    isSelected
                                        ? 'border-white bg-white'
                                        : 'border-gray-600'
                                }`} />
                                <span className="text-xs font-medium truncate">
                                    {exploration.title}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
            {selectedExploration && mode === 'selecting' && (
                <button
                    onClick={() => handleExpand(selectedExploration)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white text-gray-950 hover:bg-gray-100 transition-colors"
                >
                    Expand this direction
                </button>
            )}
        </div>
    )
}
