/**
 * Safe IPC send - avoids "Render frame was disposed" when window is closed
 * or refreshed while child processes (Codex, terminal) are still emitting.
 */

import { BrowserWindow } from 'electron'

export function safeSend(channel: string, ...args: unknown[]): boolean {
  const win = BrowserWindow.getAllWindows()[0] ?? null
  if (!win || win.isDestroyed()) return false
  const wc = win.webContents
  if (wc.isDestroyed()) return false
  try {
    wc.send(channel, ...args)
    return true
  } catch {
    return false
  }
}
