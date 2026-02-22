import { expandExploration } from '../pipeline/expansionEngine'
import type { Exploration } from '../pipeline/explorationEngine'
import { usePicoStore } from '../store/picoStore'
import { ScreenPreview } from '../renderer/ScreenPreview'
import { surfaceAspectRatio } from '../renderer/surfaceRender'
import type { InterfaceSurface } from '../types/pipeline'

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

    const surface: InterfaceSurface = intent?.surface ?? 'marketing'
    const isMobile = surface === 'mobile'

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

    return (
        <div className="flex-1 p-4 overflow-y-auto flex items-start justify-center">
            <div className={`${gridClass} ${isMobile ? '' : 'gap-4 w-full'}`}>
                {explorations.map((exploration) => (
                    <ExplorationCard
                        key={exploration.id}
                        exploration={exploration}
                        surface={surface}
                        onExpand={() => handleExpand(exploration)}
                    />
                ))}
            </div>
        </div>
    )
}

function ExplorationCard({
    exploration,
    surface,
    onExpand,
}: {
    exploration: Exploration
    surface: InterfaceSurface
    onExpand: () => void
}) {
    const isMobile = surface === 'mobile'

    return (
        <div
            className={`group relative overflow-hidden rounded-xl border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer ${isMobile ? 'w-[220px]' : ''}`}
            style={{ aspectRatio: surfaceAspectRatio(surface) }}
            onClick={onExpand}
        >
            <ScreenPreview exploration={exploration} surface={surface} />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <span className="px-5 py-2 bg-white text-neutral-950 text-xs font-medium rounded-full shadow-lg">
                    Expand this direction
                </span>
            </div>
        </div>
    )
}
