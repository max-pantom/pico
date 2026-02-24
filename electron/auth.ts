/**
 * AuthService - Sign in with ChatGPT (device code) or API key.
 * Based on OpenAI Codex device auth flow.
 */

import { ipcMain, BrowserWindow } from 'electron'
import { getAuth, setAuthChatGPT, setAuthApiKey, clearAuth } from './secureStore'

const API_BASE = 'https://auth.openai.com/api/accounts'
const BASE_URL = 'https://auth.openai.com'
const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'

export type AuthState =
  | { status: 'signedOut' }
  | { status: 'pendingDeviceAuth' }
  | { status: 'signedIn'; mode: 'chatgpt' | 'apiKey' }
  | { status: 'error'; message: string }

function getAuthState(): AuthState {
  const auth = getAuth()
  if (!auth) return { status: 'signedOut' }
  if (auth.mode === 'apiKey') return { status: 'signedIn', mode: 'apiKey' }
  if (auth.mode === 'chatgpt' && auth.accessToken) {
    const expired = auth.expiresAt && auth.expiresAt < Date.now()
    if (expired) {
      clearAuth()
      return { status: 'signedOut' }
    }
    return { status: 'signedIn', mode: 'chatgpt' }
  }
  return { status: 'signedOut' }
}

function notifyStateChange(): void {
  const win = BrowserWindow.getAllWindows()[0] ?? null
  if (win && !win.isDestroyed()) {
    win.webContents.send('auth:stateChanged', getAuthState())
  }
}

async function requestDeviceCode(): Promise<{
  device_auth_id: string
  user_code: string
  interval: number
} | null> {
  const res = await fetch(`${API_BASE}/deviceauth/usercode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Pico/1.0.0',
      Accept: 'application/json',
    },
    body: JSON.stringify({ client_id: CLIENT_ID }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { device_auth_id: string; user_code?: string; usercode?: string; interval: string | number }
  const userCode = data.user_code ?? data.usercode
  if (!userCode) return null
  const interval = typeof data.interval === 'string' ? parseInt(data.interval, 10) : (data.interval ?? 5)
  return {
    device_auth_id: data.device_auth_id,
    user_code: userCode,
    interval: interval || 5,
  }
}

async function pollForAuthorization(
  deviceAuthId: string,
  userCode: string,
  intervalSec: number,
  onProgress: () => void
): Promise<{ authorization_code: string; code_verifier: string } | null> {
  const maxWaitMs = 15 * 60 * 1000
  const start = Date.now()

  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, intervalSec * 1000))
    onProgress()

    const res = await fetch(`${API_BASE}/deviceauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Pico/1.0.0',
        Accept: 'application/json',
      },
      body: JSON.stringify({ device_auth_id: deviceAuthId, user_code: userCode }),
    })

    if (res.ok) {
      const data = (await res.json()) as { authorization_code: string; code_verifier: string }
      return data
    }
    if (res.status !== 403 && res.status !== 404) return null
  }
  return null
}

async function exchangeCodeForTokens(
  authorizationCode: string,
  codeVerifier: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number } | null> {
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code: authorizationCode,
      code_verifier: codeVerifier,
      redirect_uri: `${BASE_URL}/deviceauth/callback`,
    }).toString(),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number }
  return data
}

async function validateApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    })
    return res.ok
  } catch {
    return false
  }
}

export function registerAuthHandlers(ipc: typeof ipcMain): void {
  ipc.handle('auth:getState', () => getAuthState())

  ipc.handle('auth:signInWithChatGPT', async () => {
    const win = BrowserWindow.getAllWindows()[0] ?? null
    clearAuth()

    const codeResp = await requestDeviceCode()
    if (!codeResp) {
      return { success: false, error: 'Failed to get device code. Enable device code auth in ChatGPT settings.' }
    }

    const verificationUrl = `${BASE_URL}/codex/device`
    win?.webContents.send('auth:deviceCode', {
      userCode: codeResp.user_code,
      verificationUrl,
    })

    const codeResp2 = await pollForAuthorization(
      codeResp.device_auth_id,
      codeResp.user_code,
      codeResp.interval,
      () => {}
    )

    if (!codeResp2) {
      return { success: false, error: 'Authorization timed out or was cancelled.' }
    }

    const tokens = await exchangeCodeForTokens(
      codeResp2.authorization_code,
      codeResp2.code_verifier
    )
    if (!tokens) {
      return { success: false, error: 'Failed to exchange code for tokens.' }
    }

    setAuthChatGPT(tokens.access_token, tokens.refresh_token, tokens.expires_in)
    notifyStateChange()
    return { success: true }
  })

  ipc.handle('auth:signInWithApiKey', async (_: unknown, key: string) => {
    if (!key || typeof key !== 'string') {
      return { success: false, error: 'API key is required.' }
    }

    const valid = await validateApiKey(key.trim())
    if (!valid) {
      return { success: false, error: 'Invalid API key. Check your key at platform.openai.com.' }
    }

    setAuthApiKey(key.trim())
    notifyStateChange()
    return { success: true }
  })

  ipc.handle('auth:signOut', () => {
    clearAuth()
    notifyStateChange()
    return { success: true }
  })
}
