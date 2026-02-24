export type StreamSource = 'codex' | 'pico' | 'system'

export type StreamKind =
  | 'status'
  | 'thought'
  | 'tool'
  | 'code'
  | 'diff'
  | 'preview'
  | 'error'

export type StreamStage =
  | 'generate'
  | 'critic'
  | 'direct'
  | 'rewrite'
  | 'build'
  | 'done'

export interface StreamEvent {
  runId: string
  ts: number
  source: StreamSource
  kind: StreamKind
  stage: StreamStage
  message?: string
  meta?: Record<string, unknown>
}

export interface RunStartParams {
  prompt: string
  directionCount?: 1 | 2 | 4
  workspacePath?: string
  seedpack?: string
}

export interface RunStartResult {
  runId: string
}

export interface RunImproveParams {
  runId: string
  baselineCode: string
  prompt: string
  instruction?: string
  seedpack?: string
}

export interface RunImproveResult {
  success: boolean
  error?: string
}
