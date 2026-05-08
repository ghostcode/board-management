export type TabType = 'all' | 'text' | 'image'

export interface ClipboardItem {
  id: string
  timestamp: string
}

export interface TextItem extends ClipboardItem {
  content: string
  charCount: number
}

export interface ImageItem extends ClipboardItem {
  dataUrl: string
  width: number
  height: number
}

export interface ClipboardData {
  textItems: TextItem[]
  imageItems: ImageItem[]
}
