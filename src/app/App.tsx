import { AppShell } from './AppShell'
import { Canvas } from './Canvas'
import { PromptBar } from './PromptBar'

export default function App() {
    return (
        <AppShell
            canvas={<Canvas />}
            promptBar={<PromptBar />}
        />
    )
}
