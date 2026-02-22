import { usePicoStore } from '../store/picoStore'
import { StatusIndicator } from './StatusIndicator'
import { DirectionList } from './DirectionList'

export function Sidebar() {
    const { mode, intent, selectedExploration } = usePicoStore()

    const directionLabel = selectedExploration?.title
        ?? (mode === 'selecting' ? 'Pick a direction' : '—')

    const toneLabel = intent?.emotionalTone ?? '—'

    const layoutLabel = selectedExploration
        ? 'Full page'
        : '—'

    return (
        <aside className="w-[280px] shrink-0 border-r border-gray-800 flex flex-col overflow-y-auto">
            <div className="p-5 border-b border-gray-800">
                <p className="text-sm font-semibold text-white tracking-tight">Pico</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                    {intent?.domain ?? 'New project'}
                </p>
            </div>

            <div className="p-5 border-b border-gray-800 space-y-3">
                <p className="text-[11px] font-mono uppercase tracking-wide text-gray-500">
                    Creative State
                </p>
                <div className="space-y-2 text-xs">
                    <Row label="Direction" value={directionLabel} />
                    <Row label="Tone" value={toneLabel} />
                    <Row label="Layout" value={layoutLabel} />
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Status</span>
                        <StatusIndicator mode={mode} />
                    </div>
                </div>
            </div>

            <div className="p-5 border-b border-gray-800 flex-1 min-h-0 overflow-y-auto">
                <DirectionList />
            </div>

            <div className="p-5 border-b border-gray-800 space-y-2">
                <ExplorationControls />
            </div>

            <div className="p-5">
                <p className="text-[11px] font-mono uppercase tracking-wide text-gray-500 mb-2">
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
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-300 truncate max-w-[140px] text-right">{value}</span>
        </div>
    )
}

function ExplorationControls() {
    const { reset, mode } = usePicoStore()
    const canAct = mode === 'selecting' || mode === 'done'

    return (
        <>
            <p className="text-[11px] font-mono uppercase tracking-wide text-gray-500">
                Controls
            </p>
            <button
                onClick={reset}
                disabled={!canAct}
                className="w-full text-left text-xs text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-900"
            >
                + New Directions
            </button>
            <button
                disabled
                className="w-full text-left text-xs text-gray-600 cursor-not-allowed px-3 py-1.5 rounded-lg"
            >
                Refine Tone
            </button>
            <button
                disabled
                className="w-full text-left text-xs text-gray-600 cursor-not-allowed px-3 py-1.5 rounded-lg"
            >
                Make it Bolder
            </button>
            <button
                disabled
                className="w-full text-left text-xs text-gray-600 cursor-not-allowed px-3 py-1.5 rounded-lg"
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
                    <span className={`text-[11px] ${step.active ? 'text-gray-300' : 'text-gray-600'}`}>
                        {step.label}
                    </span>
                    {i < steps.length - 1 && (
                        <span className="text-[10px] text-gray-700">{'→'}</span>
                    )}
                </div>
            ))}
        </div>
    )
}
