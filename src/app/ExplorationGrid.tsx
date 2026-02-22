import { expandExploration } from '../pipeline/expansionEngine'
import type { Exploration } from '../pipeline/explorationEngine'
import { usePicoStore } from '../store/picoStore'
import { HeroRenderer } from '../renderer/HeroRenderer'

export function ExplorationGrid() {
    const {
        explorations,
        count,
        intent,
        selectExploration,
        setFullLayout,
        setMode,
        setError,
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

    const gridClass = {
        1: 'grid-cols-1 max-w-3xl mx-auto',
        2: 'grid-cols-1 lg:grid-cols-2',
        4: 'grid-cols-1 md:grid-cols-2',
    }[count]

    return (
        <div className="flex-1 p-8 overflow-auto">
            <p className="text-xs text-gray-500 font-mono mb-6">
                {explorations.length} direction{explorations.length > 1 ? 's' : ''} - pick one to expand
            </p>

            <div className={`grid ${gridClass} gap-6`}>
                {explorations.map((exploration) => (
                    <ExplorationCard
                        key={exploration.id}
                        exploration={exploration}
                        onExpand={() => handleExpand(exploration)}
                    />
                ))}
            </div>
        </div>
    )
}

function ExplorationCard({
    exploration,
    onExpand,
}: {
    exploration: Exploration
    onExpand: () => void
}) {
    return (
        <div className="group relative flex flex-col border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors bg-gray-950">
            <div className="relative h-72 overflow-hidden border-b border-gray-800">
                <HeroRenderer exploration={exploration} />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <button
                        onClick={onExpand}
                        className="px-6 py-2.5 bg-white text-gray-950 text-sm font-medium rounded-full transform scale-95 group-hover:scale-100 transition-transform"
                    >
                        Expand this {'->'}
                    </button>
                </div>
            </div>

            <div className="p-4 flex-1">
                <p className="text-white text-sm font-medium">{exploration.title}</p>
                <p className="text-gray-500 text-xs mt-1">{exploration.philosophy}</p>
            </div>
        </div>
    )
}
