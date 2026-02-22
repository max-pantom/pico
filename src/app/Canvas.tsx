import { useEngineStore } from '../store/engineStore'
import { LayoutRenderer } from '../renderer/LayoutRenderer'

export function Canvas() {
    const { output } = useEngineStore()
    if (!output) return null

    return (
        <div className="w-full h-full">
            <LayoutRenderer node={output.layout} tokens={output.tokens} decisions={output.decisions} />
        </div>
    )
}
