import { create } from 'zustand'
import type { IntentJSON, LayoutNode } from '../types/pipeline'
import type { Exploration } from '../pipeline/explorationEngine'
import { generateExplorations } from '../pipeline/explorationEngine'

export type PicoMode = 'idle' | 'exploring' | 'selecting' | 'expanding' | 'done' | 'error'

interface PicoStore {
    mode: PicoMode
    count: 1 | 2 | 4
    intent: IntentJSON | null
    sourcePrompt: string | null
    explorations: Exploration[]
    selectedExploration: Exploration | null
    fullLayout: LayoutNode | null
    error: string | null

    setMode: (mode: PicoMode) => void
    setCount: (count: 1 | 2 | 4) => void
    setIntent: (intent: IntentJSON) => void
    setSourcePrompt: (prompt: string) => void
    addExploration: (exploration: Exploration) => void
    setExplorations: (explorations: Exploration[]) => void
    selectExploration: (exploration: Exploration) => void
    setFullLayout: (layout: LayoutNode) => void
    setError: (error: string) => void
    regenerateExplorations: () => Promise<void>
    reset: () => void
}

export const usePicoStore = create<PicoStore>((set, get) => ({
    mode: 'idle',
    count: 2,
    intent: null,
    sourcePrompt: null,
    explorations: [],
    selectedExploration: null,
    fullLayout: null,
    error: null,

    setMode: (mode) => set({ mode }),
    setCount: (count) => set({ count }),
    setIntent: (intent) => set({ intent }),
    setSourcePrompt: (prompt) => set({ sourcePrompt: prompt }),
    addExploration: (exploration) => set((state) => ({
        explorations: [...state.explorations, exploration],
    })),
    setExplorations: (explorations) => set({ explorations, mode: 'selecting', error: null }),
    selectExploration: (selectedExploration) => set({ selectedExploration }),
    setFullLayout: (fullLayout) => set({ fullLayout, mode: 'done', error: null }),
    setError: (error) => set({ error, mode: 'error' }),

    regenerateExplorations: async () => {
        const { intent, count, sourcePrompt } = get()
        if (!intent) return

        set({ mode: 'exploring', explorations: [], selectedExploration: null, fullLayout: null, error: null })
        try {
            const explorations = await generateExplorations(
                intent,
                count,
                sourcePrompt ?? '',
                (exploration) => set((state) => ({
                    explorations: [...state.explorations, exploration],
                })),
            )
            set({ explorations, mode: 'selecting', error: null })
        } catch (e) {
            set({
                error: e instanceof Error ? e.message : 'Failed to generate new directions',
                mode: 'error',
            })
        }
    },

    reset: () => set({
        mode: 'idle',
        intent: null,
        sourcePrompt: null,
        explorations: [],
        selectedExploration: null,
        fullLayout: null,
        error: null,
    }),
}))
