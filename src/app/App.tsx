import { ElectronShell } from './ElectronShell'
import { CompareView } from './CompareView'

const isElectron = typeof window !== 'undefined' && 'pico' in window

export default function App() {
    if (isElectron) {
        return <ElectronShell />
    }
    return <CompareView />
}
