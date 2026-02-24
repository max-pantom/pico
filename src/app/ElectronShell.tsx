import { useState, useEffect } from 'react'
import { AuthGate } from './AuthGate'
import { CompareView } from './CompareView'

export function ElectronShell() {
    const [authState, setAuthState] = useState<{ status: string; mode?: string } | null>(null)

    useEffect(() => {
        const api = window.pico
        if (!api) return
        api.auth.getState().then(setAuthState)
        const unsub = api.auth.onStateChange(setAuthState)
        return unsub
    }, [])

    const isSignedIn = authState?.status === 'signedIn'
    const isLoading = authState === null

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

    return <CompareView />
}
