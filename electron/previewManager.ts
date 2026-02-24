/**
 * PreviewManager - Runs Vite dev server for preview.
 * Prefers output folder (workspace): scaffold, write code, run from there.
 * Falls back to temp dir when no output folder is selected.
 */

import { spawn, type ChildProcess } from 'child_process'
import { mkdtempSync, cpSync, writeFileSync, rmSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { connect } from 'net'
import getPort from 'get-port'
import { emit } from './eventBus'
import { getSelectedPath } from './workspace'
import { BrowserWindow } from 'electron'

const WORKSPACE_PREVIEW_PORT = 5174

function sendTerminalOutput(text: string): void {
  const win = BrowserWindow.getAllWindows()[0]
  win?.webContents?.send('preview:terminal', text)
}

function waitForServer(port: number, maxWaitMs: number): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now()
    const tryConnect = () => {
      if (Date.now() - start > maxWaitMs) {
        resolve()
        return
      }
      const sock = connect(port, '127.0.0.1', () => {
        sock.destroy()
        resolve()
      })
      sock.on('error', () => {
        sock.destroy()
        setTimeout(tryConnect, 500)
      })
    }
    tryConnect()
  })
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = join(__dirname, '..', 'preview-template')

interface RunningPreview {
  proc: ChildProcess
  dir: string
  isWorkspace: boolean
}

const byRunId = new Map<string, Map<'baseline' | 'improved', RunningPreview>>()
const byWorkspace = new Map<string, { proc: ChildProcess; port: number }>()

function getRunMap(runId: string): Map<'baseline' | 'improved', RunningPreview> {
  let m = byRunId.get(runId)
  if (!m) {
    m = new Map()
    byRunId.set(runId, m)
  }
  return m
}

function scaffoldWorkspace(workspacePath: string): void {
  const pkgPath = join(workspacePath, 'package.json')
  if (existsSync(pkgPath)) return

  cpSync(TEMPLATE_DIR, workspacePath, {
    recursive: true,
    filter: (src) => !src.includes('node_modules') && !src.includes('package-lock.json'),
  })
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

function ensureFullHTML(html: string): string {
  const t = html.trim()
  if (t.startsWith('<!DOCTYPE') && t.includes('</html>')) return t
  if (t.startsWith('<html') && t.includes('</html>')) return t
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
</head>
<body>
${t}
</body>
</html>`
}

function writeFiles(dir: string, files: Record<string, string>): void {
  for (const [name, content] of Object.entries(files)) {
    if (looksLikeHTML(content)) {
      const full = ensureFullHTML(content)
      writeFileSync(join(dir, 'index.html'), full, 'utf-8')
    } else {
      const dest = join(dir, 'src', name)
      writeFileSync(dest, content, 'utf-8')
    }
  }
}

async function npmInstall(cwd: string, onOutput?: (text: string) => void): Promise<void> {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return new Promise((resolve, reject) => {
    const install = spawn(npm, ['install'], { cwd, stdio: 'pipe', shell: false })
    install.stdout?.on('data', (chunk) => onOutput?.(chunk.toString()))
    install.stderr?.on('data', (chunk) => onOutput?.(chunk.toString()))
    install.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`npm install exited ${code}`))
    })
    install.on('error', reject)
  })
}

function runVite(
  cwd: string,
  port: number,
  onOutput?: (text: string) => void
): ChildProcess {
  const proc = spawn('npx', ['vite', '--port', String(port)], {
    cwd,
    stdio: 'pipe',
    shell: false,
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  proc.stdout?.on('data', (chunk) => onOutput?.(chunk.toString()))
  proc.stderr?.on('data', (chunk) => onOutput?.(chunk.toString()))
  return proc
}

export const previewManager = {
  async spin(
    runId: string,
    side: 'baseline' | 'improved',
    files: Record<string, string>,
    workspacePath?: string | null
  ): Promise<void> {
    const useWorkspace = Boolean(workspacePath)

    if (useWorkspace) {
      const existing = byWorkspace.get(workspacePath!)
      if (existing) {
        writeFiles(workspacePath!, files)
        emit(runId, {
          source: 'system',
          kind: 'preview',
          stage: 'build',
          message: `${side} preview updated`,
          meta: { port: existing.port, side },
        })
        return
      }

      scaffoldWorkspace(workspacePath!)
      writeFiles(workspacePath!, files)

      sendTerminalOutput(`\n$ cd ${workspacePath}\n`)
      try {
        await npmInstall(workspacePath!, sendTerminalOutput)
      } catch (e) {
        sendTerminalOutput(`\nnpm install failed: ${e instanceof Error ? e.message : String(e)}\n`)
        throw e
      }

      const proc = runVite(workspacePath!, WORKSPACE_PREVIEW_PORT, sendTerminalOutput)
      byWorkspace.set(workspacePath!, { proc, port: WORKSPACE_PREVIEW_PORT })

      proc.on('close', () => {
        byWorkspace.delete(workspacePath!)
      })

      await waitForServer(WORKSPACE_PREVIEW_PORT, 45000)

      getRunMap(runId).set(side, { proc, dir: workspacePath!, isWorkspace: true })

      emit(runId, {
        source: 'system',
        kind: 'preview',
        stage: 'build',
        message: `${side} preview ready (from output folder)`,
        meta: { port: WORKSPACE_PREVIEW_PORT, side },
      })
      return
    }

    const port = await getPort({ port: 0 })
    const dir = mkdtempSync(join(tmpdir(), `pico-preview-${runId}-${side}-`))

    try {
      cpSync(TEMPLATE_DIR, dir, { recursive: true, filter: (src) => !src.includes('node_modules') })
    } catch (e) {
      rmSync(dir, { recursive: true, force: true })
      throw new Error(`Failed to copy template: ${e instanceof Error ? e.message : String(e)}`)
    }

    writeFiles(dir, files)

    sendTerminalOutput(`\n$ temp preview (${dir})\n`)
    await npmInstall(dir, sendTerminalOutput)

    const proc = runVite(dir, port, sendTerminalOutput)
    getRunMap(runId).set(side, { proc, dir, isWorkspace: false })

    await waitForServer(port, 45000)

    emit(runId, {
      source: 'system',
      kind: 'preview',
      stage: 'build',
      message: `${side} preview ready`,
      meta: { port, side },
    })

    proc.on('close', () => {
      getRunMap(runId).delete(side)
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        // ignore
      }
    })
  },

  writeToWorkspace(workspacePath: string, files: Record<string, string>): void {
    writeFiles(workspacePath, files)
  },

  stop(runId: string): void {
    const m = byRunId.get(runId)
    if (!m) return
    for (const [, { proc, dir, isWorkspace }] of m) {
      if (isWorkspace) {
        byWorkspace.delete(dir)
      }
      try {
        proc.kill('SIGTERM')
      } catch {
        // ignore
      }
      if (!isWorkspace) {
        try {
          rmSync(dir, { recursive: true, force: true })
        } catch {
          // ignore
        }
      }
    }
    byRunId.delete(runId)
  },

  stopWorkspace(workspacePath: string): void {
    const entry = byWorkspace.get(workspacePath)
    if (entry) {
      try {
        entry.proc.kill('SIGTERM')
      } catch {
        // ignore
      }
      byWorkspace.delete(workspacePath)
    }
  },
}
