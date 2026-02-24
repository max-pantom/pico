/**
 * Run orchestrator - run.start (Codex only), run.improve (Pico design review), run.cancel.
 * Pico runs only when user presses Improve — a single design audit pass, not a loop.
 */

import { ipcMain, BrowserWindow } from 'electron'
import { randomUUID } from 'crypto'
import { emit, subscribeAll } from './eventBus'
import { runCodexStreaming } from './codexStreaming'
import { runPicoStreaming } from './picoStreaming'
import { previewManager } from './previewManager'
import { getSelectedPath } from './workspace'
import type { StreamEvent } from '../src/types/stream'
import type { RunStartParams, RunStartResult, RunImproveParams, RunImproveResult } from '../src/types/stream'

const activeRuns = new Map<string, { cancel: () => void }>()

function getWin() {
  return BrowserWindow.getAllWindows()[0] ?? null
}

function forwardToRenderer(event: StreamEvent) {
  getWin()?.webContents.send('run:event', event)
}

export function registerRunHandlers(ipc: typeof ipcMain): void {
  subscribeAll(forwardToRenderer)

  ipc.handle('run:start', async (_: unknown, params: RunStartParams): Promise<RunStartResult> => {
    const runId = randomUUID()
    const workspacePath = params.workspacePath ?? getSelectedPath() ?? process.cwd()

    emit(runId, {
      source: 'system',
      kind: 'status',
      stage: 'generate',
      message: 'Starting run',
      meta: { prompt: params.prompt, directionCount: params.directionCount ?? 1 },
    })

    const cancelRef = { cancelled: false }
    activeRuns.set(runId, {
      cancel: () => { cancelRef.cancelled = true },
    })

    ;(async () => {
      try {
        emit(runId, { source: 'codex', kind: 'status', stage: 'generate', message: 'Generating baseline...' })
        const baselineCode = await runCodexStreaming(runId, params.prompt, workspacePath, cancelRef)
        if (cancelRef.cancelled) return

        if (!baselineCode?.trim()) {
          emit(runId, { source: 'system', kind: 'error', stage: 'generate', message: 'Codex produced empty output' })
          emit(runId, { source: 'system', kind: 'status', stage: 'done', message: 'Generation failed' })
          return
        }

        try {
          const wsPath = getSelectedPath()
          emit(runId, { source: 'system', kind: 'status', stage: 'build', message: wsPath ? 'Starting preview from output folder...' : 'Spinning baseline preview...' })
          await previewManager.spin(runId, 'baseline', { 'App.tsx': baselineCode }, wsPath)
        } catch (e) {
          emit(runId, { source: 'system', kind: 'error', stage: 'build', message: `Baseline preview: ${e instanceof Error ? e.message : String(e)}` })
        }
        if (cancelRef.cancelled) return

        emit(runId, {
          source: 'system',
          kind: 'status',
          stage: 'done',
          message: 'Baseline ready. Press Improve for design review.',
          meta: { baselineCode },
        })
      } catch (err) {
        emit(runId, {
          source: 'system',
          kind: 'error',
          stage: 'generate',
          message: err instanceof Error ? err.message : String(err),
        })
        emit(runId, { source: 'system', kind: 'status', stage: 'done', message: 'Generation failed' })
      } finally {
        activeRuns.delete(runId)
      }
    })()

    return { runId }
  })

  ipc.handle('run:improve', async (_: unknown, params: RunImproveParams): Promise<RunImproveResult> => {
    const { runId, baselineCode, prompt, instruction, seedpack } = params
    const cancelRef = { cancelled: false }
    activeRuns.set(runId, { cancel: () => { cancelRef.cancelled = true } })

    try {
      emit(runId, { source: 'pico', kind: 'status', stage: 'critic', message: 'Reviewing interface…' })
      const { improvedCode, critic1, critic2, archetype } = await runPicoStreaming(
        runId,
        baselineCode,
        prompt,
        cancelRef,
        seedpack,
        instruction
      )
      if (cancelRef.cancelled) return { success: false, error: 'Cancelled' }

      try {
        const wsPath = getSelectedPath()
        emit(runId, { source: 'system', kind: 'status', stage: 'build', message: wsPath ? 'Updating preview from output folder...' : 'Spinning improved preview...' })
        await previewManager.spin(runId, 'improved', { 'App.tsx': improvedCode }, wsPath)
      } catch (e) {
        emit(runId, { source: 'system', kind: 'error', stage: 'build', message: `Improved preview: ${e instanceof Error ? e.message : String(e)}` })
      }
      if (cancelRef.cancelled) return { success: false, error: 'Cancelled' }

      emit(runId, {
        source: 'system',
        kind: 'status',
        stage: 'done',
        message: 'Design review complete',
        meta: {
          baselineCode,
          improvedCode,
          critic1,
          critic2,
          verdict: critic2?.verdict ?? critic1.verdict,
          archetype,
        },
      })
      return { success: true }
    } catch (err) {
      emit(runId, {
        source: 'system',
        kind: 'error',
        stage: 'critic',
        message: err instanceof Error ? err.message : String(err),
      })
      emit(runId, { source: 'system', kind: 'status', stage: 'done', message: 'Design review failed' })
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    } finally {
      activeRuns.delete(runId)
    }
  })

  ipc.handle('run:cancel', async (_: unknown, runId: string) => {
    const run = activeRuns.get(runId)
    if (run) {
      run.cancel()
      emit(runId, { source: 'system', kind: 'status', stage: 'done', message: 'Cancelled' })
    }
    previewManager.stop(runId)
  })

  ipc.handle('preview:refreshBaseline', async (_: unknown, params: { runId: string; code: string; workspacePath?: string | null }) => {
    const { runId, code, workspacePath } = params
    if (!code?.trim()) return
    if (workspacePath) {
      previewManager.writeToWorkspace(workspacePath, { 'App.tsx': code })
      const win = BrowserWindow.getAllWindows()[0]
      if (win) {
        win.webContents.send('run:event', {
          runId,
          ts: Date.now(),
          source: 'system',
          kind: 'preview',
          stage: 'build',
          message: 'Preview updated',
          meta: { port: 5174, side: 'baseline' },
        })
      }
    } else {
      previewManager.stop(runId)
      try {
        await previewManager.spin(runId, 'baseline', { 'App.tsx': code }, null)
      } catch (e) {
        emit(runId, {
          source: 'system',
          kind: 'error',
          stage: 'build',
          message: `Preview refresh: ${e instanceof Error ? e.message : String(e)}`,
        })
      }
    }
  })
}
