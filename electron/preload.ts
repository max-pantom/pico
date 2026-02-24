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
    listFiles: (rootPath?: string | null) => ipcRenderer.invoke('workspace:listFiles', rootPath),
    readFile: (params: { rootPath?: string | null; relativePath: string }) =>
      ipcRenderer.invoke('workspace:readFile', params),
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
  // Run (Codex generate + Pico improve)
  run: {
    start: (params: { prompt: string; directionCount?: 1 | 2 | 4; workspacePath?: string; seedpack?: string }) =>
      ipcRenderer.invoke('run:start', params),
    improve: (params: { runId: string; baselineCode: string; prompt: string; instruction?: string; seedpack?: string }) =>
      ipcRenderer.invoke('run:improve', params),
    cancel: (runId: string) => ipcRenderer.invoke('run:cancel', runId),
    onEvent: (cb: (event: { runId: string; ts: number; source: string; kind: string; stage: string; message?: string; meta?: Record<string, unknown> }) => void) => {
      const sub = (_: unknown, event: { runId: string; ts: number; source: string; kind: string; stage: string; message?: string; meta?: Record<string, unknown> }) => cb(event)
      ipcRenderer.on('run:event', sub)
      return () => ipcRenderer.removeListener('run:event', sub)
    },
  },
  // Export
  export: {
    toWorkspace: (files: Record<string, string>) => ipcRenderer.invoke('export:toWorkspace', files),
  },
  // Preview (refresh baseline when applying Pico fixes)
  preview: {
    refreshBaseline: (params: { runId: string; code: string; workspacePath?: string | null }) =>
      ipcRenderer.invoke('preview:refreshBaseline', params),
    runCommand: (params: { command: string; cwd?: string | null; side?: 'baseline' | 'improved' }) =>
      ipcRenderer.invoke('terminal:run', params),
    onTerminalOutput: (cb: (text: string) => void) => {
      const sub = (_: unknown, text: string) => cb(text)
      ipcRenderer.on('preview:terminal', sub)
      return () => ipcRenderer.removeListener('preview:terminal', sub)
    },
  },
  // Menu actions
  menu: {
    onAction: (cb: (action: string) => void) => {
      const sub = (_: unknown, action: string) => cb(action)
      ipcRenderer.on('menu:action', sub)
      return () => ipcRenderer.removeListener('menu:action', sub)
    },
  },
})
