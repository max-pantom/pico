import { ipcMain, dialog } from 'electron'

let selectedWorkspacePath: string | null = null

export function registerWorkspaceHandlers(ipc: typeof ipcMain): void {
  ipc.handle('workspace:pickFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select workspace folder',
    })
    if (result.canceled) return null
    selectedWorkspacePath = result.filePaths[0] ?? null
    return selectedWorkspacePath
  })

  ipc.handle('workspace:getSelectedPath', () => selectedWorkspacePath)
}
