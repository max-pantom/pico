/**
 * Secure credential storage.
 * Uses electron-store (app data dir). For production, migrate to keytar/OS keychain.
 */

import Store from 'electron-store'

interface AuthData {
  mode: 'chatgpt' | 'apiKey'
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  apiKey?: string
}

const store = new Store<{ auth: AuthData | null }>({
  name: 'pico-auth',
  encryptionKey: 'pico-credentials-v1',
})

export function getAuth(): AuthData | null {
  return store.get('auth') ?? null
}

export function setAuthChatGPT(accessToken: string, refreshToken: string, expiresIn: number): void {
  store.set('auth', {
    mode: 'chatgpt',
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  })
}

export function setAuthApiKey(apiKey: string): void {
  store.set('auth', {
    mode: 'apiKey',
    apiKey,
  })
}

export function clearAuth(): void {
  store.delete('auth')
}
