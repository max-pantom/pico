/**
 * Pivot UI: Raw | Pico Improved
 * Design runtime for coding agents — compare baseline vs opinionated output.
 */

import { useState } from 'react'
import {
    runPicoLoop,
    getBaselineFromPipeline,
    getBaselineFromCodex,
} from '../pipeline/picoLoop'
import { pickDivergentSeeds } from '../pipeline/designWorlds'
import type { PicoLoopResult } from '../types/picoLoop'
import type { CreativeSeed } from '../pipeline/designWorlds'

const hasCodex = typeof window !== 'undefined' && window.pico?.codex?.run

export function CompareView() {
    const [prompt, setPrompt] = useState('')
    const [result, setResult] = useState<PicoLoopResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const handleRun = async (seed?: CreativeSeed) => {
        if (!prompt.trim()) return
        setError('')
        setLoading(true)
        setResult(null)

        try {
            const getBaseline = hasCodex ? getBaselineFromCodex : getBaselineFromPipeline
            const r = await runPicoLoop(prompt, setProgress, {
                getBaseline,
                seed,
            })
            setResult(r)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to run')
        } finally {
            setLoading(false)
            setProgress('')
        }
    }

    const handleNewDirection = () => {
        const newSeed = pickDivergentSeeds(1)[0]
        handleRun(newSeed)
    }

    const handleApplyImprovements = async () => {
        if (!result?.improvedCode) return
        try {
            await navigator.clipboard.writeText(result.improvedCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setError('Failed to copy to clipboard')
        }
    }

    const critic = result?.critic2 ?? result?.critic1
    const scores = critic?.score
    const problems = critic?.top_problems ?? []

    return (
        <div className="h-dvh flex flex-col bg-neutral-950 text-neutral-100">
            {/* Toolbar */}
            <div className="shrink-0 flex items-center gap-4 border-b border-neutral-800 px-4 py-3">
                <h1 className="text-sm font-semibold text-neutral-200 tracking-tight">Pico</h1>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the UI you want..."
                    className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                />
                <button
                    onClick={() => handleRun()}
                    disabled={loading}
                    className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                    {loading ? progress || 'Running...' : 'Compare'}
                </button>
            </div>

            {error && (
                <div className="shrink-0 border-b border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-300">
                    {error}
                </div>
            )}

            {/* Compare panels */}
            <div className="flex flex-1 min-h-0">
                <CodePanel
                    title="Raw"
                    subtitle="Baseline output"
                    code={result?.baselineCode ?? null}
                />
                <div className="w-px shrink-0 bg-neutral-800" />
                <CodePanel
                    title="Pico Improved"
                    subtitle="Design opinions applied"
                    code={result?.improvedCode ?? null}
                />
            </div>

            {/* Scores, problems, actions */}
            <div className="shrink-0 border-t border-neutral-800 px-4 py-3 flex flex-col gap-3">
                {scores && (
                    <div className="flex items-center gap-6 text-xs">
                        <span className="text-neutral-500">Scores:</span>
                        <ScoreBadge label="Overall" value={scores.overall} />
                        <ScoreBadge label="Hierarchy" value={scores.hierarchy} />
                        <ScoreBadge label="Composition" value={scores.composition} />
                        <ScoreBadge label="Rhythm" value={scores.rhythm} />
                        <ScoreBadge label="Interaction" value={scores.interaction} />
                        <ScoreBadge label="A11y" value={scores.accessibility} />
                        <ScoreBadge label="Archetype" value={scores.archetype_fit} />
                        <span
                            className={`font-medium ${
                                result?.verdict === 'pass'
                                    ? 'text-emerald-400'
                                    : 'text-amber-400'
                            }`}
                        >
                            {result?.verdict === 'pass' ? '✓ Pass' : 'Revise'}
                        </span>
                    </div>
                )}
                {problems.length > 0 && (
                    <div className="text-xs">
                        <span className="text-neutral-500">Top problems: </span>
                        {problems.slice(0, 3).map((p) => (
                            <span
                                key={p.id}
                                className="inline-block mr-2 px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300"
                            >
                                [{p.severity}] {p.fix_intent.slice(0, 50)}
                                {p.fix_intent.length > 50 ? '…' : ''}
                            </span>
                        ))}
                    </div>
                )}
                {result && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleApplyImprovements}
                            className="rounded-lg border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                        >
                            {copied ? 'Copied!' : 'Apply improvements'}
                        </button>
                        <button
                            onClick={handleNewDirection}
                            className="rounded-lg border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                        >
                            New direction
                        </button>
                        {result.seedFamily && (
                            <span className="text-neutral-500 text-xs ml-2">
                                Seed: {result.seedFamily}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
    const color =
        value >= 70
            ? 'text-emerald-400'
            : value >= 50
              ? 'text-amber-400'
              : 'text-red-400'
    return (
        <span className={color}>
            {label}: {value}
        </span>
    )
}

function CodePanel({
    title,
    subtitle,
    code,
}: {
    title: string
    subtitle: string
    code: string | null
}) {
    return (
        <div className="flex-1 flex flex-col min-w-0">
            <div className="shrink-0 border-b border-neutral-800 px-4 py-2">
                <p className="text-sm font-medium text-neutral-200">{title}</p>
                <p className="text-xs text-neutral-500">{subtitle}</p>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-neutral-950">
                {code ? (
                    <pre className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-xs font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap">
                        <code>{code}</code>
                    </pre>
                ) : (
                    <div className="flex h-full min-h-[200px] items-center justify-center text-neutral-600 text-sm">
                        Run a prompt to compare
                    </div>
                )}
            </div>
        </div>
    )
}
