import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface AppShellProps {
    canvas: ReactNode
    promptBar: ReactNode
}

export function AppShell({ canvas, promptBar }: AppShellProps) {
    return (
        <div className="min-h-dvh flex bg-gray-950 text-white">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">
                {canvas}
                <div className="shrink-0 flex justify-center px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    {promptBar}
                </div>
            </div>
        </div>
    )
}
