import { ipcMain, dialog } from 'electron'
import { spawn } from 'child_process'
import { emit } from './eventBus'
import { safeSend } from './safeSend'
import * as fs from 'fs/promises'
import * as path from 'path'
import Store from 'electron-store'

const MAX_FILE_SIZE_BYTES = 250_000
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'dist-electron', 'release'])

async function walkFiles(root: string, relDir = ''): Promise<string[]> {
  const dirPath = path.join(root, relDir)
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const relPath = relDir ? path.join(relDir, entry.name) : entry.name
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      const nested = await walkFiles(root, relPath)
      files.push(...nested)
      continue
    }
    files.push(relPath)
  }

  return files
}

interface WorkspaceStore {
  selectedWorkspacePath: string | null
}

const workspaceStore = new Store<WorkspaceStore>({
  name: 'workspace-preferences',
  defaults: {
    selectedWorkspacePath: null,
  },
})

let selectedWorkspacePath: string | null = workspaceStore.get('selectedWorkspacePath')

function setSelectedWorkspacePath(nextPath: string | null): void {
  selectedWorkspacePath = nextPath
  workspaceStore.set('selectedWorkspacePath', nextPath)
}

export function getSelectedPath(): string | null {
  return selectedWorkspacePath
}

export function registerWorkspaceHandlers(ipc: typeof ipcMain): void {
  ipc.handle('workspace:pickFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select workspace folder',
    })
    if (result.canceled) return null
    setSelectedWorkspacePath(result.filePaths[0] ?? null)
    return selectedWorkspacePath
  })

  ipc.handle('workspace:getSelectedPath', () => selectedWorkspacePath)

  ipc.handle('workspace:listFiles', async (_: unknown, inputPath?: string | null) => {
    const root = inputPath ?? selectedWorkspacePath
    if (!root) return [] as string[]
    try {
      const files = await walkFiles(root)
      return files.sort((a, b) => a.localeCompare(b)).slice(0, 300)
    } catch {
      return [] as string[]
    }
  })

  ipc.handle('workspace:readFile', async (_: unknown, params: { rootPath?: string | null; relativePath: string }) => {
    const root = params.rootPath ?? selectedWorkspacePath
    if (!root) return null
    const rel = params.relativePath
    const fullPath = path.join(root, rel)
    try {
      const stat = await fs.stat(fullPath)
      if (!stat.isFile() || stat.size > MAX_FILE_SIZE_BYTES) return null
      return await fs.readFile(fullPath, 'utf-8')
    } catch {
      return null
    }
  })

  ipc.handle('terminal:run', async (_: unknown, params: { command: string; cwd?: string | null; side?: 'baseline' | 'improved' }) => {
    const cwd = params.cwd ?? selectedWorkspacePath ?? process.cwd()
    const cmd = params.command.trim()
    const side = params.side ?? 'baseline'
    if (!cmd) return

    const send = (text: string) => safeSend('preview:terminal', text)
    send(`\n$ ${cmd}\n`)

    const localhostRe = /https?:\/\/localhost:(\d+)/i
    const emitPreview = (port: number) => {
      emit('terminal', {
        source: 'system',
        kind: 'preview',
        stage: 'build',
        message: 'Preview ready (terminal)',
        meta: { port, side },
      })
    }

    const [head, ...rest] = cmd.split(/\s+/)
    const proc = spawn(head ?? cmd, rest, {
      cwd,
      shell: true,
      stdio: 'pipe',
    })
    proc.stdout?.on('data', (chunk) => {
      const text = chunk.toString()
      send(text)
      const m = text.match(localhostRe)
      if (m) {
        const port = parseInt(m[1], 10)
        if (!isNaN(port)) emitPreview(port)
      }
    })
    proc.stderr?.on('data', (chunk) => {
      const text = chunk.toString()
      send(text)
      const m = text.match(localhostRe)
      if (m) {
        const port = parseInt(m[1], 10)
        if (!isNaN(port)) emitPreview(port)
      }
    })
    proc.on('close', (code) => send(code !== 0 ? `\n[exit ${code}]\n` : ''))
    proc.on('error', (err) => send(`\nError: ${err.message}\n`))
  })

  ipc.handle('export:toWorkspace', async (_: unknown, files: Record<string, string>) => {
    let dest = selectedWorkspacePath

    if (!dest) {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Select folder to export files',
      })
      if (result.canceled || !result.filePaths[0]) return { success: false, error: 'No folder selected' }
      dest = result.filePaths[0]
      setSelectedWorkspacePath(dest)
    }

    try {
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(dest, filename)
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, content, 'utf-8')
      }
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  })
}
