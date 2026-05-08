import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'clipboard-manager-data'
const MAX_ITEMS = 100

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

interface StoredData {
  textItems: TextItem[]
  imageItems: ImageItem[]
}

function getStoredData(): StoredData {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : { textItems: [], imageItems: [] }
  } catch {
    return { textItems: [], imageItems: [] }
  }
}

function setStoredData(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export function useClipboard() {
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 初始化加载数据
  useEffect(() => {
    const data = getStoredData()
    setTextItems(data.textItems)
    setImageItems(data.imageItems)
  }, [])

  // 保存数据
  useEffect(() => {
    setStoredData({ textItems, imageItems })
  }, [textItems, imageItems])

  // 添加文本项
  const addTextItem = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return null

    const newItem: TextItem = {
      id: Date.now().toString(),
      content: trimmed,
      charCount: trimmed.length,
      timestamp: new Date().toISOString()
    }

    setTextItems(prev => {
      // 去重
      const filtered = prev.filter(item => item.content !== trimmed)
      return [newItem, ...filtered].slice(0, MAX_ITEMS)
    })

    return newItem
  }, [])

  // 添加图片项
  const addImageItem = useCallback((dataUrl: string, width: number, height: number) => {
    const newItem: ImageItem = {
      id: Date.now().toString(),
      dataUrl,
      width,
      height,
      timestamp: new Date().toISOString()
    }

    setImageItems(prev => [newItem, ...prev].slice(0, MAX_ITEMS))
    return newItem
  }, [])

  // 删除文本项
  const deleteTextItem = useCallback((id: string) => {
    setTextItems(prev => prev.filter(item => item.id !== id))
  }, [])

  // 删除图片项
  const deleteImageItem = useCallback((id: string) => {
    setImageItems(prev => prev.filter(item => item.id !== id))
  }, [])

  // 清空所有
  const clearAll = useCallback(() => {
    setTextItems([])
    setImageItems([])
  }, [])

  // 复制到粘贴板
  const copyToClipboard = useCallback(async (type: 'text' | 'image', content: string): Promise<boolean> => {
    try {
      if (type === 'text') {
        await navigator.clipboard.writeText(content)
      } else {
        const blob = await fetch(content).then(r => r.blob())
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ])
      }
      return true
    } catch (e) {
      console.error('Copy failed:', e)
      return false
    }
  }, [])

  // 从粘贴板读取
  const readFromClipboard = useCallback(async (): Promise<{ type: 'text' | 'image' | null; content: string }> => {
    try {
      const items = await navigator.clipboard.read()
      
      for (const item of items) {
        // 检查图片
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                  resolve({
                    type: 'image',
                    content: e.target?.result as string
                  })
                }
                img.onerror = () => {
                  resolve({ type: null, content: '' })
                }
                img.src = e.target?.result as string
              }
              reader.onerror = () => resolve({ type: null, content: '' })
              reader.readAsDataURL(blob)
            })
          }
        }
      }
      
      // 检查文本
      const text = await navigator.clipboard.readText()
      if (text) {
        return { type: 'text', content: text }
      }
      
      return { type: null, content: '' }
    } catch {
      return { type: null, content: '' }
    }
  }, [])

  return {
    textItems,
    imageItems,
    isMonitoring,
    setIsMonitoring,
    addTextItem,
    addImageItem,
    deleteTextItem,
    deleteImageItem,
    clearAll,
    copyToClipboard,
    readFromClipboard
  }
}
