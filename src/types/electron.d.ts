export interface PicoAuthState {
  status: 'signedOut' | 'pendingDeviceAuth' | 'signedIn' | 'error'
  mode?: 'chatgpt' | 'apiKey'
  message?: string
}

export interface PicoAPI {
  auth: {
    getState: () => Promise<PicoAuthState>
    signInWithChatGPT: () => Promise<{ success: boolean; error?: string }>
    signInWithApiKey: (key: string) => Promise<{ success: boolean; error?: string }>
    signOut: () => Promise<{ success: boolean }>
    onStateChange: (cb: (state: PicoAuthState) => void) => () => void
  }
  deviceAuth: {
    onCode: (cb: (data: { userCode: string; verificationUrl: string }) => void) => () => void
  }
  workspace: {
    pickFolder: () => Promise<string | null>
    getSelectedPath: () => Promise<string | null>
    listFiles: (rootPath?: string | null) => Promise<string[]>
    readFile: (params: { rootPath?: string | null; relativePath: string }) => Promise<string | null>
  }
  export: {
    toWorkspace: (files: Record<string, string>) => Promise<{ success: boolean; error?: string }>
  }
  preview: {
    refreshBaseline: (params: { runId: string; code: string; workspacePath?: string | null }) => Promise<void>
    runCommand: (params: { command: string; cwd?: string | null; side?: 'baseline' | 'improved' }) => Promise<void>
    onTerminalOutput: (cb: (text: string) => void) => () => void
  }
  codex: {
    run: (prompt: string, workspacePath: string) => Promise<string>
    onProgress: (cb: (event: { type: string; data?: unknown }) => void) => () => void
  }
  run: {
    start: (params: { prompt: string; directionCount?: 1 | 2 | 4; workspacePath?: string; seedpack?: string }) => Promise<{ runId: string }>
    improve: (params: { runId: string; baselineCode: string; prompt: string; instruction?: string; seedpack?: string }) => Promise<{ success: boolean; error?: string }>
    cancel: (runId: string) => Promise<void>
    onEvent: (cb: (event: { runId: string; ts: number; source: string; kind: string; stage: string; message?: string; meta?: Record<string, unknown> }) => void) => () => void
  }
  menu: {
    onAction: (cb: (action: string) => void) => () => void
  }
}

declare global {
  interface Window {
    pico?: PicoAPI
  }
}
