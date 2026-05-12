import { contextBridge, ipcRenderer } from 'electron'

export interface TextItem {
  id: string
  content: string
  charCount: number
  timestamp: string
}

export interface ImageItem {
  id: string
  dataUrl: string
  width: number
  height: number
  timestamp: string
}

export interface ClipboardData {
  textItems: TextItem[]
  imageItems: ImageItem[]
}

const electronAPI = {
  getClipboardData: (): Promise<ClipboardData> => ipcRenderer.invoke('get-clipboard-data'),
  addTextItem: (content: string): Promise<TextItem> => ipcRenderer.invoke('add-text-item', content),
  addImageItem: (dataUrl: string, width: number, height: number): Promise<ImageItem> =>
    ipcRenderer.invoke('add-image-item', dataUrl, width, height),
  deleteTextItem: (id: string): Promise<boolean> => ipcRenderer.invoke('delete-text-item', id),
  deleteImageItem: (id: string): Promise<boolean> => ipcRenderer.invoke('delete-image-item', id),
  clearAll: (): Promise<boolean> => ipcRenderer.invoke('clear-all'),
  copyToClipboard: (type: 'text' | 'image', content: string): Promise<boolean> =>
    ipcRenderer.invoke('copy-to-clipboard', type, content),
  onClipboardText: (callback: (text: string) => void) => {
    const listener = (_: any, text: string) => callback(text)
    ipcRenderer.on('clipboard-text', listener)
    return () => ipcRenderer.removeListener('clipboard-text', listener)
  },
  onClipboardImage: (callback: (dataUrl: string) => void) => {
    const listener = (_: any, dataUrl: string) => callback(dataUrl)
    ipcRenderer.on('clipboard-image', listener)
    return () => ipcRenderer.removeListener('clipboard-image', listener)
  },
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  getSettings: (): Promise<{ shortcut: string; closeBehavior: string; alwaysOnTop: boolean; theme: string }> => ipcRenderer.invoke('get-settings'),
  setShortcut: (shortcut: string): Promise<boolean> => ipcRenderer.invoke('set-shortcut', shortcut),
  setCloseBehavior: (behavior: string): Promise<boolean> => ipcRenderer.invoke('set-close-behavior', behavior),
  setAlwaysOnTop: (alwaysOnTop: boolean): Promise<boolean> => ipcRenderer.invoke('set-always-on-top', alwaysOnTop),
  setTheme: (theme: string): Promise<boolean> => ipcRenderer.invoke('set-theme', theme),
  getPlatform: (): Promise<string> => ipcRenderer.invoke('get-platform')
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
