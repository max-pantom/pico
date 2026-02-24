/**
 * CodexService - Wraps Codex CLI for v0.
 * Spawns `codex` with the user's prompt. Requires Codex CLI to be installed.
 */

import { ipcMain, BrowserWindow } from 'electron'
import { spawn } from 'child_process'
import { getAuth } from './secureStore'

function getCodexEnv(): NodeJS.ProcessEnv {
  const auth = getAuth()
  const env = { ...process.env }

  if (auth?.mode === 'apiKey' && auth.apiKey) {
    env.OPENAI_API_KEY = auth.apiKey
  }
  // For ChatGPT mode, Codex CLI uses its own auth (e.g. ~/.codex/auth.json).
  // We could write our tokens there in Codex format for v0.
  return env
}

export function registerCodexHandlers(ipc: typeof ipcMain): void {
  ipc.handle('codex:run', async (_: unknown, prompt: string, workspacePath: string) => {
    const win = BrowserWindow.getAllWindows()[0] ?? null

    return new Promise<string>((resolve, reject) => {
      const cwd = workspacePath || process.cwd()
      const proc = spawn('codex', ['exec', '--full-auto', '-C', cwd, prompt], {
        cwd,
        env: getCodexEnv(),
        shell: false,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout?.on('data', (chunk: Buffer) => {
        const text = chunk.toString()
        stdout += text
        win?.webContents.send('codex:progress', { type: 'stdout', data: text })
      })

      proc.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString()
        stderr += text
        win?.webContents.send('codex:progress', { type: 'stderr', data: text })
      })

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(stderr || stdout || `Codex exited with code ${code}`))
        }
      })

      proc.on('error', (err) => {
        reject(new Error(`Codex not found. Install with: npm install -g @openai/codex. ${err.message}`))
      })
    })
  })
}
