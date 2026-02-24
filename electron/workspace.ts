import { ipcMain, dialog } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import Store from 'electron-store'

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
