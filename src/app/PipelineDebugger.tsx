import { useState } from 'react'
import { useEngineStore } from '../store/engineStore'

type Tab = 'activity' | 'intent' | 'decisions' | 'tokens' | 'dom' | 'layout' | 'code' | 'quality'

export function PipelineDebugger() {
    const { output, activityLog } = useEngineStore()
    const [activeTab, setActiveTab] = useState<Tab>('activity')
    if (!output && activityLog.length === 0) {
        return (
            <div className="flex h-full items-center justify-center px-6 text-center text-xs font-mono text-gray-600">
                Run a prompt to inspect activity, intent, and generated layout JSON.
            </div>
        )
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: 'activity', label: 'Activity' },
        ...(output
            ? [
                { id: 'intent' as const, label: 'Intent' },
                { id: 'decisions' as const, label: 'Decisions' },
                { id: 'tokens' as const, label: 'Tokens' },
                { id: 'dom' as const, label: 'Raw DOM' },
                { id: 'layout' as const, label: 'Layout' },
                { id: 'code' as const, label: '</> Code' },
                { id: 'quality' as const, label: `Quality ${output.qualityScore}` },
            ]
            : []),
    ]

    const data: Partial<Record<Tab, unknown>> = {
        activity: activityLog,
        ...(output
            ? {
                intent: output.intent,
                decisions: output.decisions,
                tokens: output.tokens,
                dom: output.mainChildren,
                layout: output.layout,
                code: output.reactSourceCode,
                quality: { score: output.qualityScore, issues: output.qualityIssues },
            }
            : {}),
    }

    const selectedTab = tabs.some(tab => tab.id === activeTab) ? activeTab : tabs[0].id

    return (
        <div className="text-xs font-mono h-full flex flex-col">
            <div className="flex border-b border-gray-800 shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 text-xs transition-colors ${selectedTab === tab.id
                            ? 'text-white border-b border-white'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {selectedTab === 'code' ? (
                <div className="p-4 overflow-auto flex-1 relative group bg-gray-900">
                    <button
                        onClick={() => navigator.clipboard.writeText(String(data.code))}
                        className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Copy
                    </button>
                    <pre className="text-blue-400 text-xs whitespace-pre-wrap">
                        {data.code as string}
                    </pre>
                </div>
            ) : (
                <pre className="p-4 text-green-400 text-xs overflow-auto flex-1 whitespace-pre-wrap">
                    {JSON.stringify(data[selectedTab], null, 2)}
                </pre>
            )}
        </div>
    )
}
