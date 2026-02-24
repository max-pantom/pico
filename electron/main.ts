import 'dotenv/config'
import { app, BrowserWindow, Menu, clipboard, ipcMain, shell, type MenuItemConstructorOptions } from 'electron'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import Store from 'electron-store'
import { registerAuthHandlers } from './auth'
import { registerWorkspaceHandlers } from './workspace'
import { registerCodexHandlers } from './codex'
import { registerRunHandlers } from './run'

const isDev = process.env.NODE_ENV === 'development' || !!process.env.VITE_DEV_SERVER_URL
const isMac = process.platform === 'darwin'
const __dirname = dirname(fileURLToPath(import.meta.url))

interface WindowBounds {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

interface MainStore {
  windowBounds: WindowBounds
}

const mainStore = new Store<MainStore>({
  name: 'main-preferences',
  defaults: {
    windowBounds: {
      width: 1400,
      height: 900,
      isMaximized: false,
    },
  },
})

function getMainWindow(): BrowserWindow | null {
  return BrowserWindow.getAllWindows()[0] ?? null
}

function notifyRendererMenuAction(action: string): void {
  getMainWindow()?.webContents.send('menu:action', action)
}

function buildAppMenu(): Menu {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Pico',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => notifyRendererMenuAction('preferences'),
        },
        { type: 'separator' },
        { role: 'services' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Pick Output Folder',
          accelerator: 'CmdOrCtrl+O',
          click: () => notifyRendererMenuAction('pick-output-folder'),
        },
        {
          label: 'Export Output',
          accelerator: 'CmdOrCtrl+S',
          click: () => notifyRendererMenuAction('export'),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'Run',
      submenu: [
        {
          label: 'Generate',
          accelerator: 'CmdOrCtrl+Enter',
          click: () => notifyRendererMenuAction('generate'),
        },
        {
          label: 'Improve',
          accelerator: 'CmdOrCtrl+Shift+Enter',
          click: () => notifyRendererMenuAction('improve'),
        },
        {
          label: 'Cancel Run',
          accelerator: 'CmdOrCtrl+.',
          click: () => notifyRendererMenuAction('cancel'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }],
    },
  ]

  return Menu.buildFromTemplate(template)
}

function attachContextMenu(win: BrowserWindow): void {
  win.webContents.on('context-menu', (_, params) => {
    const hasTextSelection = Boolean(params.selectionText?.trim())
    const menu = Menu.buildFromTemplate([
      { role: 'undo', enabled: params.editFlags.canUndo },
      { role: 'redo', enabled: params.editFlags.canRedo },
      { type: 'separator' },
      { role: 'cut', enabled: params.isEditable },
      { role: 'copy', enabled: hasTextSelection },
      { role: 'paste', enabled: params.isEditable },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Copy Link',
        enabled: Boolean(params.linkURL),
        click: () => {
          if (params.linkURL) clipboard.writeText(params.linkURL)
        },
      },
      {
        label: 'Open Link in Browser',
        enabled: Boolean(params.linkURL),
        click: () => {
          if (params.linkURL) void shell.openExternal(params.linkURL)
        },
      },
      {
        label: 'Inspect Element',
        enabled: isDev,
        click: () => {
          win.webContents.inspectElement(params.x, params.y)
        },
      },
    ])

    menu.popup({ window: win })
  })
}

function persistWindowBounds(win: BrowserWindow): void {
  if (win.isDestroyed()) return
  const bounds = win.getBounds()
  mainStore.set('windowBounds', {
    width: Math.max(900, bounds.width),
    height: Math.max(600, bounds.height),
    x: bounds.x,
    y: bounds.y,
    isMaximized: win.isMaximized(),
  })
}

function getRuntimeWindowIconPath(): string | undefined {
  const iconPath = join(process.cwd(), 'build', 'icons', 'icon.png')
  return existsSync(iconPath) ? iconPath : undefined
}

function createWindow(): void {
  const persisted = mainStore.get('windowBounds')
  const win = new BrowserWindow({
    width: persisted.width,
    height: persisted.height,
    x: persisted.x,
    y: persisted.y,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: isMac ? { x: 14, y: 12 } : undefined,
    icon: getRuntimeWindowIconPath(),
    show: false,
  })

  if (persisted.isMaximized) {
    win.maximize()
  }

  attachContextMenu(win)

  win.on('resize', () => persistWindowBounds(win))
  win.on('move', () => persistWindowBounds(win))
  win.on('close', () => persistWindowBounds(win))
  win.on('maximize', () => persistWindowBounds(win))
  win.on('unmaximize', () => persistWindowBounds(win))

  win.once('ready-to-show', () => win.show())

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildAppMenu())
  registerAuthHandlers(ipcMain)
  registerWorkspaceHandlers(ipcMain)
  registerCodexHandlers(ipcMain)
  registerRunHandlers(ipcMain)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
