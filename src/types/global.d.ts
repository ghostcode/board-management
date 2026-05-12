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

export interface ElectronAPI {
  getClipboardData: () => Promise<ClipboardData>
  addTextItem: (content: string) => Promise<TextItem>
  addImageItem: (dataUrl: string, width: number, height: number) => Promise<ImageItem>
  deleteTextItem: (id: string) => Promise<boolean>
  deleteImageItem: (id: string) => Promise<boolean>
  clearAll: () => Promise<boolean>
  copyToClipboard: (type: 'text' | 'image', content: string) => Promise<boolean>
  onClipboardText: (callback: (text: string) => void) => () => void
  onClipboardImage: (callback: (dataUrl: string) => void) => () => void
  windowMinimize: () => Promise<boolean>
  windowClose: () => Promise<boolean>
  getSettings: () => Promise<{ shortcut: string; closeBehavior: string; alwaysOnTop: boolean; theme: string }>
  setShortcut: (shortcut: string) => Promise<boolean>
  setCloseBehavior: (behavior: string) => Promise<boolean>
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<boolean>
  setTheme: (theme: string) => Promise<boolean>
  getPlatform: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
