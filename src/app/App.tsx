import { ElectronShell } from './ElectronShell'
import { LayoutShell } from './LayoutShell'

const isElectron = typeof window !== 'undefined' && 'pico' in window

export default function App() {
  if (isElectron) {
    return <ElectronShell />
  }
  return <LayoutShell />
}
