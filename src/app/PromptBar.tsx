import { useState } from 'react'
import { parseIntent } from '../pipeline/intentParser'
import { generateExplorations } from '../pipeline/explorationEngine'
import { usePicoStore } from '../store/picoStore'

export function PromptBar() {
    const [prompt, setPrompt] = useState('')
    const {
        count,
        mode,
        setCount,
        setMode,
        setIntent,
        setExplorations,
        setError,
        reset,
    } = usePicoStore()

    const isRunning = mode === 'exploring' || mode === 'expanding'

    const handleExplore = async () => {
        if (!prompt.trim() || isRunning) return

        setMode('exploring')
        try {
            const intent = await parseIntent(prompt)
            setIntent(intent)
            const explorations = await generateExplorations(intent, count)
            setExplorations(explorations)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to explore direction')
        }
    }

    return (
        <div className="border-b border-gray-800 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">pico</span>
                    <span className="text-xs text-gray-600">-</span>
                    <span className="text-xs text-gray-500">ai creative director</span>
                </div>
                <button
                    onClick={reset}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                    reset
                </button>
            </div>

            <div className="flex gap-3">
                <input
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                    placeholder="Describe your idea..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                />

                <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                    {([1, 2, 4] as const).map((n) => (
                        <button
                            key={n}
                            onClick={() => setCount(n)}
                            className={`px-4 py-3 text-sm font-mono transition-colors ${count === n
                                ? 'bg-white text-gray-950'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleExplore}
                    disabled={isRunning}
                    className="px-6 py-3 bg-white text-gray-950 text-sm font-medium rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {mode === 'exploring' ? 'Exploring...' : 'Explore ->'}
                </button>
            </div>
        </div>
    )
}
