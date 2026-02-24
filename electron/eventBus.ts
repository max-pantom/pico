/**
 * EventBus - In-memory pubsub keyed by runId.
 * IPC channel run.events streams to renderer.
 */

import type { StreamEvent } from '../src/types/stream'

type Listener = (event: StreamEvent) => void

const listenersByRunId = new Map<string, Set<Listener>>()
const globalListeners = new Set<Listener>()

export function emit(runId: string, event: Omit<StreamEvent, 'runId' | 'ts'>): void {
  const full: StreamEvent = {
    ...event,
    runId,
    ts: Date.now(),
  }
  const runListeners = listenersByRunId.get(runId)
  if (runListeners) {
    runListeners.forEach((cb) => cb(full))
  }
  globalListeners.forEach((cb) => cb(full))
}

export function subscribe(runId: string, listener: Listener): () => void {
  let set = listenersByRunId.get(runId)
  if (!set) {
    set = new Set()
    listenersByRunId.set(runId, set)
  }
  set.add(listener)
  return () => {
    set?.delete(listener)
    if (set?.size === 0) listenersByRunId.delete(runId)
  }
}

export function subscribeAll(listener: Listener): () => void {
  globalListeners.add(listener)
  return () => globalListeners.delete(listener)
}

export function getEmitter(runId: string) {
  return {
    status: (stage: StreamEvent['stage'], message?: string, meta?: Record<string, unknown>) =>
      emit(runId, { source: 'system', kind: 'status', stage, message, meta }),
    thought: (message: string, meta?: Record<string, unknown>) =>
      emit(runId, { source: 'system', kind: 'thought', stage: 'generate', message, meta }),
    tool: (message: string, meta?: Record<string, unknown>) =>
      emit(runId, { source: 'system', kind: 'tool', stage: 'generate', message, meta }),
    code: (message: string, meta?: Record<string, unknown>) =>
      emit(runId, { source: 'system', kind: 'code', stage: 'generate', message, meta }),
    error: (message: string, meta?: Record<string, unknown>) =>
      emit(runId, { source: 'system', kind: 'error', stage: 'generate', message, meta }),
    preview: (url: string, artifact: 'baseline' | 'improved') =>
      emit(runId, { source: 'system', kind: 'preview', stage: 'build', message: url, meta: { artifact } }),
  }
}
