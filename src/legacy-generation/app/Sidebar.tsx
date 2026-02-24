import { usePicoStore } from '../../store/picoStore'
import { StatusIndicator } from './StatusIndicator'
import { DirectionList } from '../../app/DirectionList'
import { getSurfaceDefinition } from '../../pipeline/surfaceConfig'

export function Sidebar() {
    const { mode, intent, selectedExploration } = usePicoStore()

    const surfaceLabel = intent
        ? getSurfaceDefinition(intent.surface).label
        : '—'

    const directionLabel = selectedExploration?.title
        ?? (mode === 'selecting' ? 'Pick a direction' : '—')

    const toneLabel = intent?.emotionalTone ?? '—'

    return (
        <aside className="w-[280px] shrink-0 border-r border-neutral-800 flex flex-col overflow-y-auto">
            <div className="p-5 border-b border-neutral-800">
                <p className="text-sm font-semibold text-neutral-100 tracking-tight">Pico</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                    {intent?.domain ?? 'New project'}
                </p>
            </div>

            <div className="p-5 border-b border-neutral-800 space-y-3">
                <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">
                    Project
                </p>
                <div className="space-y-2 text-xs">
                    <Row label="Type" value={surfaceLabel} />
                    <Row label="Direction" value={directionLabel} />
                    <Row label="Tone" value={toneLabel} />
                    <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Status</span>
                        <StatusIndicator mode={mode} />
                    </div>
                </div>
            </div>

            <div className="p-5 border-b border-neutral-800 flex-1 min-h-0 overflow-y-auto">
                <DirectionList />
            </div>

            <div className="p-5 border-b border-neutral-800 space-y-2">
                <ExplorationControls />
            </div>

            <div className="p-5">
                <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500 mb-2">
                    History
                </p>
                <HistoryStub />
            </div>
        </aside>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-neutral-500">{label}</span>
            <span className="text-neutral-300 truncate max-w-[140px] text-right">{value}</span>
        </div>
    )
}

function ExplorationControls() {
    const { regenerateExplorations, reset, mode } = usePicoStore()
    const canRegenerate = mode === 'selecting' || mode === 'done'
    const canReset = mode !== 'idle' && mode !== 'exploring' && mode !== 'expanding'

    return (
        <>
            <p className="text-[11px] font-mono uppercase tracking-wide text-neutral-500">
                Controls
            </p>
            <button
                onClick={regenerateExplorations}
                disabled={!canRegenerate}
                className="w-full text-left text-xs text-neutral-400 hover:text-neutral-100 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900"
            >
                + New Directions
            </button>
            <button
                onClick={reset}
                disabled={!canReset}
                className="w-full text-left text-xs text-neutral-400 hover:text-neutral-100 disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-900"
            >
                Start Over
            </button>
            <button
                disabled
                className="w-full text-left text-xs text-neutral-600 cursor-not-allowed px-3 py-1.5 rounded-lg"
            >
                Refine Tone
            </button>
            <button
                disabled
                className="w-full text-left text-xs text-neutral-600 cursor-not-allowed px-3 py-1.5 rounded-lg"
            >
                Make it Bolder
            </button>
            <button
                disabled
                className="w-full text-left text-xs text-neutral-600 cursor-not-allowed px-3 py-1.5 rounded-lg"
            >
                Simplify
            </button>
        </>
    )
}

function HistoryStub() {
    const { mode } = usePicoStore()

    const steps = [
        { label: 'Idea', active: mode !== 'idle' },
        { label: 'Directions', active: mode === 'selecting' || mode === 'expanding' || mode === 'done' },
        { label: 'Expanded', active: mode === 'done' },
    ]

    return (
        <div className="flex items-center gap-1.5">
            {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1.5">
                    <span className={`text-[11px] ${step.active ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {step.label}
                    </span>
                    {i < steps.length - 1 && (
                        <span className="text-[10px] text-neutral-700">{'→'}</span>
                    )}
                </div>
            ))}
        </div>
    )
}
