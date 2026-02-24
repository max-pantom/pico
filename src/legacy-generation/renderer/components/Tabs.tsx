import type { ResolvedTokens } from '../../../types/pipeline'
import { asStringArray } from '../safeValue'

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
            <div className={`flex gap-1 border-b ${tokens.tone.border} pb-px`}>
                {safeTabs.map((tab, i) => {
                    const isActive = i === activeTab
                    return (
                        <button
                            key={tab}
                            className={`
                                relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg
                                ${isActive
                                    ? `${tokens.tone.text} bg-[var(--color-surface-alt)]/50`
                                    : `${tokens.tone.muted} hover:${tokens.tone.text} hover:bg-[var(--color-surface-alt)]/30`
                                }
                            `}
                        >
                            {tab}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full" />
                            )}
                        </button>
                    )
                })}
            </div>
            <div className="pt-1">
                {children}
            </div>
        </div>
    )
}
