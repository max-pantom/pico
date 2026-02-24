import { useState } from 'react'
import { useEngineStore } from '../../store/engineStore'
import { runPipeline } from '../../pipeline/pipeline'
import type { PipelineStage } from '../../types/pipeline'

export function PromptInput() {
    const [value, setValue] = useState('')
    const {
        stage,
        setStage,
        setOutput,
        setError,
        setPrompt,
        appendActivity,
        clearActivity,
    } = useEngineStore()
    const isRunning = stage !== 'idle' && stage !== 'done' && stage !== 'error'
    const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false })

    const handleRun = async () => {
        if (!value.trim() || isRunning) return
        setPrompt(value)
        clearActivity()
        setStage('parsing')
        appendActivity(`[${stamp()}] Started compilation`)
        try {
            const output = await runPipeline(value, (s: PipelineStage, detail?: string) => {
                setStage(s)
                if (detail) {
                    appendActivity(`[${stamp()}] ${detail}`)
                }
            })
            appendActivity(`[${stamp()}] Compilation completed`)
            setOutput(output)
        } catch (e) {
            appendActivity(`[${stamp()}] Compilation failed`)
            setError(e instanceof Error ? e.message : 'Unknown error')
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 shadow-lg shadow-black/20">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 4h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5l-3.6 3.2c-.5.5-1.4.1-1.4-.6V17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                        />
                    </svg>
                </div>
                <input
                    className="flex-1 bg-transparent px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none"
                    placeholder="Describe the UI you want to compile..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                />
                <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send prompt"
                >
                    {isRunning ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14-7-4 7 4 7-14-7Z" />
                        </svg>
                    )}
                </button>
            </div>
            {stage !== 'idle' && stage !== 'done' && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {stage}
                </div>
            )}
        </div>
    )
}
