import { app, BrowserWindow, ipcMain, clipboard, nativeImage, globalShortcut, Tray, Menu } from 'electron'
import path from 'path'
import log from 'electron-log'
import Store from 'electron-store'

// 配置日志
log.transports.file.level = 'info'
log.info('应用启动中...')

// 初始化存储
const store = new Store({
  name: 'clipboard-data',
  defaults: {
    textItems: [],
    imageItems: [],
    settings: {
      shortcut: process.platform === 'darwin' ? 'Command+V' : 'Super+V',
      closeBehavior: 'minimize',
      alwaysOnTop: false,
      theme: 'light'
    }
  }
})

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let clipboardWatcher: NodeJS.Timeout | null = null
let lastTextContent = ''
let lastImageHash = ''
let currentShortcut = ''

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

function createWindow() {
  const winIconPath = VITE_DEV_SERVER_URL
    ? path.join(__dirname, '../public/clipboard_flat_256.png')
    : path.join(__dirname, '../dist/clipboard_flat_256.png')

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 400,
    minHeight: 600,
    maxWidth: 400,
    maxHeight: 600,
    frame: false,
    resizable: false,
    transparent: true,
    backgroundColor: undefined,
    roundedCorners: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: winIconPath,
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    const settings = store.get('settings', { alwaysOnTop: false }) as any
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(settings.alwaysOnTop || false)
      mainWindow.show()
    }
    log.info('主窗口已显示')
  })

  // 最小化到托盘
  mainWindow.on('minimize', (event: Event) => {
    event.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      const settings = store.get('settings', { closeBehavior: 'minimize' }) as any
      if (settings.closeBehavior === 'quit') {
        app.isQuitting = true
        app.quit()
      } else {
        mainWindow?.hide()
      }
    }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  log.info('窗口创建完成')
}

function createTray() {
  const iconName = 'clipboard_flat.png'
  const iconPath = VITE_DEV_SERVER_URL
    ? path.join(__dirname, '../public', iconName)
    : path.join(__dirname, '../dist', iconName)

  let trayIcon = nativeImage.createFromPath(iconPath)

  if (trayIcon.isEmpty()) {
    log.warn('托盘图标加载失败，路径:', iconPath)
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('ClipBoard Manager')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })

  log.info('托盘创建完成')
}

function startClipboardWatcher() {
  lastTextContent = clipboard.readText()

  clipboardWatcher = setInterval(() => {
    try {
      // 检查文本变化
      const currentText = clipboard.readText()
      if (currentText && currentText !== lastTextContent) {
        lastTextContent = currentText
        mainWindow?.webContents.send('clipboard-text', currentText)
        log.info('检测到新文本内容')
      }

      // 检查图片变化
      const currentImage = clipboard.readImage()
      if (!currentImage.isEmpty()) {
        const dataUrl = currentImage.toDataURL()
        const hash = hashString(dataUrl)
        if (hash !== lastImageHash) {
          lastImageHash = hash
          mainWindow?.webContents.send('clipboard-image', dataUrl)
          log.info('检测到新图片内容')
        }
      }
    } catch (error) {
      log.error('粘贴板监听错误:', error)
    }
  }, 500)
}

function stopClipboardWatcher() {
  if (clipboardWatcher) {
    clearInterval(clipboardWatcher)
    clipboardWatcher = null
  }
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

function normalizeShortcut(shortcut: string): string {
  return shortcut
    .replace(/Command/gi, 'CommandOrControl')
    .replace(/Ctrl/gi, 'CommandOrControl')
    .replace(/Super/gi, 'CommandOrControl')
    .replace(/Win/gi, 'CommandOrControl')
    .replace(/Meta/gi, 'CommandOrControl')
}

function registerShortcuts() {
  const settings = store.get('settings', { shortcut: process.platform === 'darwin' ? 'Command+V' : 'Super+V' }) as any
  const shortcut = normalizeShortcut(settings.shortcut)
  currentShortcut = shortcut

  globalShortcut.register(shortcut, () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })

  log.info('快捷键注册完成:', shortcut)
}

function updateShortcut(newShortcut: string) {
  globalShortcut.unregisterAll()
  const normalized = normalizeShortcut(newShortcut)
  currentShortcut = normalized

  globalShortcut.register(normalized, () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })

  store.set('settings.shortcut', newShortcut)
  log.info('快捷键更新:', normalized)
}

// IPC 处理器
ipcMain.handle('get-clipboard-data', () => {
  return {
    textItems: store.get('textItems', []),
    imageItems: store.get('imageItems', [])
  }
})

ipcMain.handle('add-text-item', (_, content: string) => {
  const items = store.get('textItems', []) as any[]
  const newItem = {
    id: Date.now().toString(),
    content,
    timestamp: new Date().toISOString(),
    charCount: content.length
  }

  const existingIndex = items.findIndex(item => item.content === content)
  if (existingIndex !== -1) {
    items.splice(existingIndex, 1)
  }

  items.unshift(newItem)

  if (items.length > 100) {
    items.pop()
  }

  store.set('textItems', items)
  return newItem
})

ipcMain.handle('add-image-item', (_, dataUrl: string, width: number, height: number) => {
  const items = store.get('imageItems', []) as any[]
  const newItem = {
    id: Date.now().toString(),
    dataUrl,
    timestamp: new Date().toISOString(),
    width,
    height
  }

  items.unshift(newItem)

  if (items.length > 100) {
    items.pop()
  }

  store.set('imageItems', items)
  return newItem
})

ipcMain.handle('delete-text-item', (_, id: string) => {
  const items = store.get('textItems', []) as any[]
  const filtered = items.filter(item => item.id !== id)
  store.set('textItems', filtered)
  return true
})

ipcMain.handle('delete-image-item', (_, id: string) => {
  const items = store.get('imageItems', []) as any[]
  const filtered = items.filter(item => item.id !== id)
  store.set('imageItems', filtered)
  return true
})

ipcMain.handle('clear-all', () => {
  store.set('textItems', [])
  store.set('imageItems', [])
  return true
})

ipcMain.handle('copy-to-clipboard', (_, type: 'text' | 'image', content: string) => {
  try {
    if (type === 'text') {
      clipboard.writeText(content)
      lastTextContent = content
    } else {
      const image = nativeImage.createFromDataURL(content)
      clipboard.writeImage(image)
      lastImageHash = hashString(content)
    }
    return true
  } catch (error) {
    log.error('复制到粘贴板失败:', error)
    return false
  }
})

ipcMain.handle('window-minimize', () => {
  mainWindow?.hide()
  return true
})

ipcMain.handle('window-close', () => {
  const settings = store.get('settings', { closeBehavior: 'minimize' }) as any
  if (settings.closeBehavior === 'quit') {
    app.isQuitting = true
    app.quit()
  } else {
    mainWindow?.hide()
  }
  return true
})

ipcMain.handle('get-settings', () => {
  return store.get('settings', { shortcut: process.platform === 'darwin' ? 'Command+V' : 'Super+V' })
})

ipcMain.handle('set-shortcut', (_, shortcut: string) => {
  updateShortcut(shortcut)
  return true
})

ipcMain.handle('set-close-behavior', (_, behavior: string) => {
  store.set('settings.closeBehavior', behavior)
  log.info('关闭行为更新:', behavior)
  return true
})

ipcMain.handle('set-always-on-top', (_, alwaysOnTop: boolean) => {
  store.set('settings.alwaysOnTop', alwaysOnTop)
  mainWindow?.setAlwaysOnTop(alwaysOnTop)
  log.info('置顶状态更新:', alwaysOnTop)
  return true
})

ipcMain.handle('set-theme', (_, theme: string) => {
  store.set('settings.theme', theme)
  mainWindow?.webContents.send('theme-changed', theme)
  log.info('主题更新:', theme)
  return true
})

ipcMain.handle('get-platform', () => {
  return process.platform
})

// 扩展 app 类型
declare module 'electron' {
  interface App {
    isQuitting?: boolean
  }
}

app.whenReady().then(() => {
  log.info('应用准备就绪')
  createWindow()
  createTray()
  startClipboardWatcher()
  registerShortcuts()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  stopClipboardWatcher()
  log.info('应用退出')
})
