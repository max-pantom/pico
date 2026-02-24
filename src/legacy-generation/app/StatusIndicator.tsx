import type { PicoMode } from '../../store/picoStore'

const STATUS_MAP: Record<PicoMode, { label: string; pulse: boolean }> = {
    idle: { label: 'Ready', pulse: false },
    exploring: { label: 'Thinking', pulse: true },
    selecting: { label: 'Choose direction', pulse: false },
    expanding: { label: 'Expanding', pulse: true },
    done: { label: 'Ready', pulse: false },
    error: { label: 'Error', pulse: false },
}

export function StatusIndicator({ mode }: { mode: PicoMode }) {
    const { label, pulse } = STATUS_MAP[mode]
    const isError = mode === 'error'

    return (
        <div className="flex items-center gap-2">
            <span
                className={`size-2 rounded-full ${
                    isError
                        ? 'bg-red-400'
                        : pulse
                            ? 'bg-emerald-400 animate-pulse'
                            : 'bg-neutral-500'
                }`}
            />
            <span className={`text-xs ${isError ? 'text-red-400' : 'text-neutral-400'}`}>
                {label}
            </span>
        </div>
    )
}
