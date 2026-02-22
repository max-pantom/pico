import { create } from 'zustand'
import type { IntentJSON, LayoutNode } from '../types/pipeline'
import type { Exploration } from '../pipeline/explorationEngine'

export type PicoMode = 'idle' | 'exploring' | 'selecting' | 'expanding' | 'done' | 'error'

interface PicoStore {
    mode: PicoMode
    count: 1 | 2 | 4
    intent: IntentJSON | null
    explorations: Exploration[]
    selectedExploration: Exploration | null
    fullLayout: LayoutNode | null
    error: string | null

    setMode: (mode: PicoMode) => void
    setCount: (count: 1 | 2 | 4) => void
    setIntent: (intent: IntentJSON) => void
    setExplorations: (explorations: Exploration[]) => void
    selectExploration: (exploration: Exploration) => void
    setFullLayout: (layout: LayoutNode) => void
    setError: (error: string) => void
    reset: () => void
}

export const usePicoStore = create<PicoStore>((set) => ({
    mode: 'idle',
    count: 2,
    intent: null,
    explorations: [],
    selectedExploration: null,
    fullLayout: null,
    error: null,

    setMode: (mode) => set({ mode }),
    setCount: (count) => set({ count }),
    setIntent: (intent) => set({ intent }),
    setExplorations: (explorations) => set({ explorations, mode: 'selecting', error: null }),
    selectExploration: (selectedExploration) => set({ selectedExploration }),
    setFullLayout: (fullLayout) => set({ fullLayout, mode: 'done', error: null }),
    setError: (error) => set({ error, mode: 'error' }),
    reset: () => set({
        mode: 'idle',
        intent: null,
        explorations: [],
        selectedExploration: null,
        fullLayout: null,
        error: null,
    }),
}))
