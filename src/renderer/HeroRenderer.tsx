import type { Exploration } from '../pipeline/explorationEngine'
import type { ResolvedTokens, SceneBlueprint } from '../types/pipeline'

interface Props {
    exploration: Exploration
    tokens: ResolvedTokens
}

const FALLBACK_BLUEPRINT: SceneBlueprint = {
    strategy: 'interface-first',
    dominantElement: 'Primary product narrative',
    dominantCoverage: 74,
    secondaryElements: ['Supporting details', 'Actions', 'Recent context'],
    interactionLayer: 'inline',
    avoidGrids: true,
}

function resolveBlueprint(exploration: Exploration): SceneBlueprint {
    const blueprint = exploration.blueprint ?? FALLBACK_BLUEPRINT
    const coverage = Number.isFinite(blueprint.dominantCoverage)
        ? Math.max(70, Math.min(85, Math.round(blueprint.dominantCoverage)))
        : FALLBACK_BLUEPRINT.dominantCoverage

    return {
        ...FALLBACK_BLUEPRINT,
        ...blueprint,
        dominantCoverage: coverage,
        secondaryElements: blueprint.secondaryElements.length > 0
            ? blueprint.secondaryElements
            : FALLBACK_BLUEPRINT.secondaryElements,
    }
}

export function HeroRenderer({ exploration, tokens }: Props) {
    const blueprint = resolveBlueprint(exploration)
    const secondaryCoverage = 100 - blueprint.dominantCoverage
    const isEditorial = blueprint.strategy === 'editorial-canvas'
    const isImmersive = blueprint.strategy === 'immersive-surface' || blueprint.strategy === 'cinematic-hero'

    const dominantAlign = isEditorial
        ? 'items-start justify-end text-left'
        : isImmersive
            ? 'items-center justify-center text-center'
            : 'items-start justify-center text-left'

    const displayHeadline = exploration.screen.headline || exploration.title
    const displaySubheadline = exploration.screen.subheadline || exploration.philosophy
    const secondaryLabels = blueprint.secondaryElements.slice(0, 3)

    return (
        <div className="h-full w-full overflow-hidden bg-[var(--color-background)]">
            <section
                className={`relative overflow-hidden ${tokens.shape.card} border ${tokens.tone.border}`}
                style={{ height: `${blueprint.dominantCoverage}%` }}
            >
                <div className={`absolute inset-0 ${tokens.gradient.hero}`} />
                {isImmersive && (
                    <>
                        <div className="absolute -right-20 top-[-72px] h-72 w-72 rounded-full bg-[var(--color-gradient-from)]/20 blur-3xl" />
                        <div className="absolute -left-16 bottom-[-88px] h-72 w-72 rounded-full bg-[var(--color-gradient-to)]/20 blur-3xl" />
                    </>
                )}

                <div className={`relative z-10 flex h-full ${dominantAlign} p-8`}>
                    <div className="max-w-[75%] space-y-3">
                        <p className={`${tokens.typography.micro} ${tokens.tone.muted} uppercase tracking-[0.18em]`}>
                            {blueprint.dominantElement}
                        </p>
                        <h2 className={`${tokens.typography.display} ${tokens.tone.text} leading-[1.02]`}>
                            {displayHeadline}
                        </h2>
                        <p className={`${tokens.typography.body} ${tokens.tone.muted} max-w-2xl`}>
                            {displaySubheadline}
                        </p>
                    </div>
                </div>
            </section>

            <section
                className="flex overflow-hidden"
                style={{ height: `${secondaryCoverage}%` }}
            >
                <div className={`flex-1 p-4 ${tokens.tone.surface}`}>
                    <div className={`${tokens.shape.card} h-full border ${tokens.tone.border} p-3`}>
                        <p className={`${tokens.typography.micro} ${tokens.tone.muted} mb-2`}>Secondary elements</p>
                        <div className="space-y-2">
                            {secondaryLabels.map((label, idx) => (
                                <div
                                    key={`${label}-${idx}`}
                                    className={`rounded-md border ${tokens.tone.border} ${tokens.tone.surface} px-3 py-2 ${tokens.typography.label} ${tokens.tone.text}`}
                                    style={blueprint.avoidGrids
                                        ? { width: `${100 - (idx * 12)}%` }
                                        : undefined}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {blueprint.interactionLayer === 'sidebar' && (
                    <aside className={`w-[34%] border-l ${tokens.tone.border} ${tokens.tone.surface} p-4`}>
                        <p className={`${tokens.typography.micro} ${tokens.tone.muted} mb-2`}>Interaction layer</p>
                        <div className={`rounded-md border ${tokens.tone.border} p-3 ${tokens.typography.body} ${tokens.tone.text}`}>
                            {exploration.screen.ctaPrimary}
                        </div>
                    </aside>
                )}
            </section>
        </div>
    )
}
