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
  }
  codex: {
    run: (prompt: string, workspacePath: string) => Promise<string>
    onProgress: (cb: (event: { type: string; data?: unknown }) => void) => () => void
  }
}

declare global {
  interface Window {
    pico?: PicoAPI
  }
}
