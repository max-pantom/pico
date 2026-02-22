import { useState } from 'react'
import { parseIntent } from '../pipeline/intentParser'
import { generateExplorations } from '../pipeline/explorationEngine'
import { usePicoStore } from '../store/picoStore'

export function PromptBar() {
    const [prompt, setPrompt] = useState('')
    const [focused, setFocused] = useState(false)
    const {
        count,
        mode,
        setCount,
        setMode,
        setIntent,
        setSourcePrompt,
        addExploration,
        setExplorations,
        setError,
    } = usePicoStore()

    const isRunning = mode === 'exploring' || mode === 'expanding'

    const handleExplore = async () => {
        if (!prompt.trim() || isRunning) return

        setMode('exploring')
        setSourcePrompt(prompt)
        try {
            const intent = await parseIntent(prompt)
            setIntent(intent)
            const explorations = await generateExplorations(
                intent,
                count,
                prompt,
                (exploration) => addExploration(exploration),
            )
            setExplorations(explorations)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to explore direction')
        }
    }

    return (
        <div
            className={`w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-4 py-3 transition-all ${
                focused ? 'border-neutral-600 ring-1 ring-neutral-700/50' : ''
            }`}
        >
            <div className="flex items-center gap-3">
                <input
                    className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
                    placeholder="Describe what to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />

                <div className="flex border border-neutral-700 rounded-lg overflow-hidden shrink-0">
                    {([1, 2, 4] as const).map((n) => (
                        <button
                            key={n}
                            onClick={() => setCount(n)}
                            className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                                count === n
                                    ? 'bg-neutral-100 text-neutral-950'
                                    : 'text-neutral-500 hover:text-neutral-100'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleExplore}
                    disabled={isRunning}
                    className="shrink-0 px-5 py-1.5 bg-neutral-100 text-neutral-950 text-xs font-medium rounded-lg hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    {mode === 'exploring' ? 'Exploring...' : 'Explore'}
                </button>
            </div>
        </div>
    )
}
