import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('pico', {
  // Auth
  auth: {
    getState: () => ipcRenderer.invoke('auth:getState'),
    signInWithChatGPT: () => ipcRenderer.invoke('auth:signInWithChatGPT'),
    signInWithApiKey: (key: string) => ipcRenderer.invoke('auth:signInWithApiKey', key),
    signOut: () => ipcRenderer.invoke('auth:signOut'),
    onStateChange: (cb: (state: unknown) => void) => {
      const sub = (_: unknown, state: unknown) => cb(state)
      ipcRenderer.on('auth:stateChanged', sub)
      return () => ipcRenderer.removeListener('auth:stateChanged', sub)
    },
  },
  // Device code (for ChatGPT sign-in)
  deviceAuth: {
    onCode: (cb: (data: { userCode: string; verificationUrl: string }) => void) => {
      const sub = (_: unknown, data: { userCode: string; verificationUrl: string }) => cb(data)
      ipcRenderer.on('auth:deviceCode', sub)
      return () => ipcRenderer.removeListener('auth:deviceCode', sub)
    },
  },
  // Workspace
  workspace: {
    pickFolder: () => ipcRenderer.invoke('workspace:pickFolder'),
    getSelectedPath: () => ipcRenderer.invoke('workspace:getSelectedPath'),
  },
  // Codex
  codex: {
    run: (prompt: string, workspacePath: string) =>
      ipcRenderer.invoke('codex:run', prompt, workspacePath),
    onProgress: (cb: (event: { type: string; data?: unknown }) => void) => {
      const sub = (_: unknown, event: { type: string; data?: unknown }) => cb(event)
      ipcRenderer.on('codex:progress', sub)
      return () => ipcRenderer.removeListener('codex:progress', sub)
    },
  },
})
