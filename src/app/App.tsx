import { PromptInput } from './PromptInput'
import { PipelineDebugger } from './PipelineDebugger'
import { Canvas } from './Canvas'
import { useEngineStore } from '../store/engineStore'

export default function App() {
    const { output, stage, error, activityLog } = useEngineStore()
    const latestActivity = activityLog.length > 0 ? activityLog[activityLog.length - 1] : 'Waiting for input'
    const issueCount = output?.qualityIssues.length ?? 0

    return (
        <div className="min-h-screen bg-gray-950 p-4 text-white">
            <div className="h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex h-full">
                    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-gray-800 bg-gray-950/85">
                        <div className="border-b border-gray-800 px-5 py-4">
                            <p className="text-xs font-mono tracking-widest text-gray-500">pico v1</p>
                            <h1 className="mt-1 text-base font-semibold text-gray-100">Sidebar</h1>
                            <p className="mt-1 text-xs text-gray-500">Pipeline context and debug data.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-b border-gray-800 p-5 text-xs font-mono">
                            <div className="rounded border border-gray-800 bg-gray-900 p-3">
                                <p className="text-gray-500">Stage</p>
                                <p className="mt-1 text-gray-200">{stage}</p>
                            </div>
                            <div className="rounded border border-gray-800 bg-gray-900 p-3">
                                <p className="text-gray-500">Quality</p>
                                <p className="mt-1 text-gray-200">{output ? output.qualityScore : '--'}</p>
                            </div>
                            <div className="rounded border border-gray-800 bg-gray-900 p-3">
                                <p className="text-gray-500">Issues</p>
                                <p className="mt-1 text-gray-200">{issueCount}</p>
                            </div>
                            <div className="rounded border border-gray-800 bg-gray-900 p-3">
                                <p className="text-gray-500">Log lines</p>
                                <p className="mt-1 text-gray-200">{activityLog.length}</p>
                            </div>
                        </div>

                        {error && (
                            <div className="border-b border-gray-800 px-5 py-4">
                                <div className="rounded border border-red-800 bg-red-950 p-3 text-xs font-mono text-red-300">
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="min-h-0 flex-1 overflow-hidden">
                            <PipelineDebugger />
                        </div>
                    </aside>

                    <div className="flex min-w-0 flex-1 flex-col bg-gradient-to-b from-gray-900 via-gray-950 to-black">
                        <div className="border-b border-gray-800 px-5 py-3 font-mono text-xs text-gray-400">
                            <span className="mr-4 text-gray-500">Live activity</span>
                            {latestActivity}
                        </div>
                        <main className="min-h-0 flex-1 overflow-auto p-5">
                            {output ? (
                                <div className="h-full overflow-hidden rounded-xl border border-gray-800 bg-gray-950 shadow-inner shadow-black/30">
                                    <Canvas />
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-950/60">
                                    <div className="max-w-md text-center">
                                        <p className="text-sm font-semibold text-gray-300">UI preview</p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Your generated interface will render here after compilation.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </main>
                        <div className="border-t border-gray-800 bg-gray-950/90 px-4 py-3">
                            <PromptInput />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
