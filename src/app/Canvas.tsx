import { useEngineStore } from '../store/engineStore'
import { LayoutRenderer } from '../renderer/LayoutRenderer'
import { TokenInjector } from '../renderer/TokenInjector'

export function Canvas() {
    const { output } = useEngineStore()
    if (!output) return null

    return (
        <div className="w-full h-full">
            <TokenInjector tokens={output.tokens}>
                <LayoutRenderer node={output.layout} tokens={output.tokens} decisions={output.decisions} />
            </TokenInjector>
        </div>
    )
}
