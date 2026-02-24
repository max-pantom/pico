import { ElectronShell } from './ElectronShell'
import { LayoutShell } from './LayoutShell'

const isElectron = typeof window !== 'undefined' && !!window.pico
const isElectronEnv = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent)

export default function App() {
  if (isElectron) {
    return <ElectronShell />
  }
  if (isElectronEnv && !window.pico) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-300 p-6">
        <p className="text-sm text-amber-400">Electron bridge not loaded. Try View → Reload.</p>
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
  return <LayoutShell />
}
