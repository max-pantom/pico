/**
 * Run orchestrator - run.start (Codex only), run.improve (Pico design review), run.cancel.
 * Pico runs only when user presses Improve — a single design audit pass, not a loop.
 */

import { ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { emit, subscribeAll } from './eventBus'
import { runCodexStreaming } from './codexStreaming'
import { runPicoStreaming } from './picoStreaming'
import { previewManager } from './previewManager'
import { getSelectedPath } from './workspace'
import { safeSend } from './safeSend'
import type { StreamEvent } from '../src/types/stream'
import type { RunStartParams, RunStartResult, RunImproveParams, RunImproveResult } from '../src/types/stream'

const activeRuns = new Map<string, { cancel: () => void }>()

function forwardToRenderer(event: StreamEvent) {
  safeSend('run:event', event)
}

async function readWorkspacePrimaryCode(workspacePath: string): Promise<string> {
  const candidates = ['src/App.tsx', 'src/main.tsx', 'index.html']
  for (const relativePath of candidates) {
    try {
      const content = await readFile(join(workspacePath, relativePath), 'utf-8')
      if (content.trim()) return content
    } catch {
      // continue
    }
  }
  return ''
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

        const wsPath = getSelectedPath()
        if (!wsPath && baselineCode.trim()) {
          try {
            emit(runId, { source: 'system', kind: 'status', stage: 'build', message: 'Spinning baseline preview...' })
            await previewManager.spin(runId, 'baseline', { 'App.tsx': baselineCode }, null)
          } catch (e) {
            emit(runId, { source: 'system', kind: 'error', stage: 'build', message: `Baseline preview: ${e instanceof Error ? e.message : String(e)}` })
          }
        } else if (wsPath) {
          emit(runId, { source: 'system', kind: 'status', stage: 'build', message: 'Codex runs in output folder. Check terminal for dev server.' })
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
    const workspacePath = getSelectedPath() ?? process.cwd()
    const cancelRef = { cancelled: false }
    activeRuns.set(runId, { cancel: () => { cancelRef.cancelled = true } })

    try {
      emit(runId, { source: 'pico', kind: 'status', stage: 'critic', message: 'Reviewing interface…' })
      const { critic1, critic2, archetype, codexInstruction } = await runPicoStreaming(
        runId,
        baselineCode,
        prompt,
        cancelRef,
        seedpack,
        instruction
      )
      if (cancelRef.cancelled) return { success: false, error: 'Cancelled' }

      emit(runId, {
        source: 'pico',
        kind: 'code',
        stage: 'direct',
        message: 'Pico instruction plan',
        meta: { codexInstruction },
      })

      emit(runId, {
        source: 'codex',
        kind: 'status',
        stage: 'rewrite',
        message: 'Applying Pico instructions in workspace...',
      })

      const applyPrompt = [
        `Original request:\n${prompt}`,
        '',
        'Pico instructions:',
        codexInstruction,
      ].join('\n')

      const codexOutputCode = await runCodexStreaming(runId, applyPrompt, workspacePath, cancelRef)
      if (cancelRef.cancelled) return { success: false, error: 'Cancelled' }
      const improvedCode = (await readWorkspacePrimaryCode(workspacePath)) || codexOutputCode || baselineCode

      try {
        emit(runId, { source: 'system', kind: 'status', stage: 'build', message: 'Updating preview from output folder...' })
        await previewManager.spin(runId, 'improved', { 'App.tsx': improvedCode }, workspacePath)
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
      safeSend('run:event', {
        runId,
        ts: Date.now(),
        source: 'system',
        kind: 'preview',
        stage: 'build',
        message: 'Preview updated',
        meta: { port: 5174, side: 'baseline' },
      })
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
