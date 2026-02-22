import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray } from '../safeValue'
// Note: Normally Tabs require state to switch panels. Since V4 handles functional state,
// for V3 this is a visual implementation only to organize dense dashboards statically.

interface Props {
    tokens: ResolvedTokens
    tabs: string[]
    activeTab?: number
    children?: React.ReactNode
}

export function Tabs({ tokens, tabs, activeTab = 0, children }: Props) {
    const safeTabs = asStringArray(tabs)

    return (
        <div className="w-full flex flex-col space-y-4">
            <div className={`flex space-x-4 border-b ${tokens.tone.border}`}>
                {safeTabs.map((tab, i) => {
                    const isActive = i === activeTab
                    return (
                        <button
                            key={tab}
                            className={`
                                pb-2 text-sm font-medium transition-colors
                                ${isActive ? `${tokens.colors.primaryText} border-b-2 border-current` : `${tokens.tone.muted} hover:${tokens.tone.text}`}
                            `}
                            style={isActive ? { color: tokens.colors.primaryBg.replace('bg-', '') } : {}} // Hack to use bg color as text for active border
                        >
                            {tab}
                        </button>
                    )
                })}
            </div>
            {/* For V3 mock purposes, we just render the children block entirely (usually the first tab's content) */}
            <div className="pt-2">
                {children}
            </div>
        </div>
    )
}
