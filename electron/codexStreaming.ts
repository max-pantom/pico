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
import { safeSend } from './safeSend'

function sendToTerminal(text: string): void {
  safeSend('preview:terminal', text)
}

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
  if (t.length < 30) return false
  const hasCode = t.includes('import ') || t.includes('export ') || t.includes('function ') || t.includes('=>') ||
    t.includes('return ') || t.includes('const ') || t.includes('React.') || t.includes('className=') ||
    t.includes('<>') || t.includes('</') || t.includes('{') || t.includes('(')
  if (hasCode) return true
  if (looksLikePureDescription(t)) return false
  return t.length > 100
}

function looksLikePureDescription(text: string): boolean {
  const t = text.trim().toLowerCase()
  if (t.length < 50) return false
  const descStarts = ['built a ', 'created a ', "i've ", 'i have ', 'here is ', 'details:', 'summary:', 'overview:']
  const startsAsDesc = descStarts.some((s) => t.startsWith(s))
  const noCode = !t.includes('import ') && !t.includes('export ') && !t.includes('function ') && !t.includes('=>') && !t.includes('return ')
  return startsAsDesc && noCode
}

function looksLikeHTML(text: string): boolean {
  const t = text.trim()
  return (
    t.length > 10 &&
    (t.startsWith('<!DOCTYPE') ||
      t.startsWith('<html') ||
      (t.startsWith('<') && (t.includes('<div') || t.includes('<body') || t.includes('<section') || t.includes('<main'))))
  )
}

function extractCodeFromOutput(stdout: string): string {
  const htmlMatch = stdout.match(/```(?:html)\s*\n([\s\S]*?)```/)
  if (htmlMatch) {
    const code = htmlMatch[1].trim()
    if (looksLikeHTML(code)) return code
  }
  const langPattern = /```(?:tsx|ts|jsx|js|typescript|javascript)\s*\n([\s\S]*?)```/
  const match = stdout.match(langPattern)
  if (match) {
    const code = match[1].trim()
    if (code.length > 15) return code
  }
  const match2 = stdout.match(/```\s*\n([\s\S]*?)```/)
  if (match2) {
    const code = match2[1].trim()
    if (looksLikeHTML(code)) return code
    if (code.length > 15 && !looksLikePureDescription(code)) return code
  }
  if (looksLikeHTML(stdout.trim())) return stdout.trim()
  const trimmed = stdout.trim()
  if (looksLikeCode(trimmed)) return trimmed
  return ''
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

  const args = [
    'exec',
    '--full-auto',
    '--skip-git-repo-check',
    '-C', cwd,
    prompt,
  ]
  return new Promise((resolve, reject) => {
    const proc = spawn('codex', args, {
      cwd,
      env: getCodexEnv(),
      shell: false,
    })

    let stdout = ''
    let stderr = ''

    const localhostMatch = /(?:Local|➜|localhost)[:\s]+(https?:\/\/localhost:\d+)/i
    proc.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stdout += text
      sendToTerminal(text)
      const urlMatch = text.match(localhostMatch)
      if (urlMatch) {
        const port = parseInt(urlMatch[1].replace(/.*:(\d+).*/, '$1'), 10)
        if (!isNaN(port)) {
          emit(runId, {
            source: 'system',
            kind: 'preview',
            stage: 'build',
            message: 'Preview ready (Codex)',
            meta: { port, side: 'baseline' },
          })
        }
      }
      const partial = extractCodeFromOutput(stdout)
      const meta: Record<string, unknown> = { raw: text.slice(-200) }
      if (partial) meta.baselineCode = partial
      emit(runId, {
        source: 'codex',
        kind: 'tool',
        stage: 'generate',
        message: text.slice(-200),
        meta,
      })
    })

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      stderr += text
      sendToTerminal(text)
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
        resolve(extracted || (looksLikeCode(stdout) ? stdout.trim() : '') || (looksLikeHTML(stdout.trim()) ? stdout.trim() : ''))
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
