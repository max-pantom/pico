/**
 * Codex runner streaming adapter.
 * Spawns codex exec, streams stdout as events, detects file writes.
 * Auto-initializes git in workspace if not already a repo (Codex requires trusted dir).
 */

import { spawn, execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'
import { emit } from './eventBus'
import { getAuth } from './secureStore'

function ensureGitRepo(cwd: string): void {
  const gitDir = join(cwd, '.git')
  if (existsSync(gitDir)) return
  try {
    execSync('git init', { cwd, stdio: 'pipe' })
  } catch {
    // git not installed or init failed; Codex may still run with --skip-git-repo-check
  }
}

function looksLikeCode(text: string): boolean {
  const t = text.trim()
  return (
    t.length > 50 &&
    (t.includes('import ') || t.includes('export ') || t.includes('function ') || t.includes('=>') || t.includes('return '))
  )
}

function extractCodeFromOutput(stdout: string): string {
  const match = stdout.match(/```(?:tsx|ts|jsx|js)\s*\n([\s\S]*?)```/)
  if (match) {
    const code = match[1].trim()
    return looksLikeCode(code) ? code : ''
  }
  const match2 = stdout.match(/```\s*\n([\s\S]*?)```/)
  if (match2) {
    const code = match2[1].trim()
    return looksLikeCode(code) ? code : ''
  }
  return looksLikeCode(stdout) ? stdout.trim() : ''
}

function getCodexEnv(): NodeJS.ProcessEnv {
  const auth = getAuth()
  const env = { ...process.env }
  if (auth?.mode === 'apiKey' && auth.apiKey) {
    env.OPENAI_API_KEY = auth.apiKey
  }
  return env
}

export async function runCodexStreaming(
  runId: string,
  prompt: string,
  workspacePath: string,
  cancelRef: { cancelled: boolean }
): Promise<string> {
  const cwd = workspacePath || process.cwd()
  ensureGitRepo(cwd)

  return new Promise((resolve, reject) => {
    const proc = spawn('codex', ['exec', '--full-auto', '--skip-git-repo-check', '-C', cwd, prompt], {
      cwd,
      env: getCodexEnv(),
      shell: false,
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stdout += text
      emit(runId, {
        source: 'codex',
        kind: 'tool',
        stage: 'generate',
        message: text.slice(-200),
        meta: { raw: text },
      })
    })

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stderr += text
      emit(runId, {
        source: 'codex',
        kind: 'status',
        stage: 'generate',
        message: text.slice(-200),
        meta: { stderr: true },
      })
    })

    proc.on('close', (code) => {
      if (cancelRef.cancelled) {
        resolve('')
        return
      }
      if (code === 0) {
        const extracted = extractCodeFromOutput(stdout)
        emit(runId, { source: 'codex', kind: 'status', stage: 'done', message: 'Codex complete' })
        resolve(extracted || stdout)
      } else {
        const errMsg = [stderr, stdout].filter(Boolean).join('\n---\n') || `Codex exited with code ${code}`
        emit(runId, { source: 'codex', kind: 'error', stage: 'generate', message: errMsg })
        reject(new Error(errMsg))
      }
    })

    proc.on('error', (err) => {
      emit(runId, { source: 'codex', kind: 'error', stage: 'generate', message: err.message })
      reject(new Error(`Codex not found. Install with: npm install -g @openai/codex. ${err.message}`))
    })
  })
}
