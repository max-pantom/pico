import { create } from 'zustand'
import type { PipelineOutput, PipelineStage } from '../types/pipeline'

interface EngineStore {
    stage: PipelineStage
    prompt: string
    output: PipelineOutput | null
    error: string | null
    activityLog: string[]
    setPrompt: (p: string) => void
    setStage: (s: PipelineStage) => void
    setOutput: (o: PipelineOutput) => void
    setError: (e: string) => void
    appendActivity: (entry: string) => void
    clearActivity: () => void
    reset: () => void
}

export const useEngineStore = create<EngineStore>((set) => ({
    stage: 'idle',
    prompt: '',
    output: null,
    error: null,
    activityLog: [],
    setPrompt: (prompt) => set({ prompt }),
    setStage: (stage) => set({ stage }),
    setOutput: (output) => set({ output, stage: 'done' }),
    setError: (error) => set({ error, stage: 'error' }),
    appendActivity: (entry) => set((state) => ({ activityLog: [...state.activityLog, entry] })),
    clearActivity: () => set({ activityLog: [] }),
    reset: () => set({ stage: 'idle', output: null, error: null, activityLog: [] }),
}))
