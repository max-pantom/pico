import { useState, useEffect } from 'react'
import { AuthGate } from './AuthGate'
import { LayoutShell } from './LayoutShell'

export function ElectronShell() {
    const [authState, setAuthState] = useState<{ status: string; mode?: string } | null>(null)
    const [bridgeError, setBridgeError] = useState<string | null>(null)

    useEffect(() => {
        const api = window.pico
        if (!api) {
            setBridgeError('Electron bridge not loaded. Reload the window.')
            return
        }
        const timeout = setTimeout(() => {
            setAuthState((prev) => (prev === null ? { status: 'signedOut' } : prev))
        }, 5000)
        api.auth.getState()
            .then((s) => setAuthState(s ?? { status: 'signedOut' }))
            .catch(() => setAuthState({ status: 'signedOut' }))
            .finally(() => clearTimeout(timeout))
        const unsub = api.auth.onStateChange(setAuthState)
        return () => {
            clearTimeout(timeout)
            unsub()
        }
    }, [])

    const isSignedIn = authState?.status === 'signedIn'
    const isLoading = authState === null && !bridgeError

    if (bridgeError) {
        return (
            <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-300 p-6">
                <p className="text-sm text-amber-400">{bridgeError}</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-800"
                >
                    Reload
                </button>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="h-dvh flex items-center justify-center bg-neutral-950 text-neutral-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-300" />
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="h-dvh flex items-center justify-center bg-neutral-950">
                <AuthGate />
            </div>
        )
    }

    return <LayoutShell />
}
