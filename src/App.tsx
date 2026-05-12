import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import TitleBar from './components/TitleBar'

import TabBar from './components/TabBar'
import TextItemCard from './components/TextItem'
import ImageItemCard from './components/ImageItem'
import EmptyState from './components/EmptyState'
import StatusBar from './components/StatusBar'
import SettingsModal from './components/SettingsModal'
import { TabType, TextItem, ImageItem } from './types'

type ItemData = (TextItem & { type: 'text' }) | (ImageItem & { type: 'image' })

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getSettings().then((settings) => {
        if (settings?.alwaysOnTop !== undefined) {
          setAlwaysOnTop(settings.alwaysOnTop)
        }
      })
    }
  }, [isSettingsOpen])

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }, [])

  // 合并所有项目并按时间排序
  const allItems = useMemo(() => {
    const merged = [
      ...textItems.map(item => ({ ...item, type: 'text' as const })),
      ...imageItems.map(item => ({ ...item, type: 'image' as const }))
    ]
    return merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [textItems, imageItems])

  // 加载数据并监听粘贴板
  useEffect(() => {
    loadData()

    if (typeof window !== 'undefined' && window.electronAPI) {
      const unsubText = window.electronAPI.onClipboardText((text: string) => {
        window.electronAPI.addTextItem(text).then(savedItem => {
          setTextItems(prev => {
            const filtered = prev.filter(item => item.content !== text)
            return [{ ...savedItem, type: 'text' as const }, ...filtered].slice(0, 100)
          })
          showToast('文本已保存')
        })
      })

      const unsubImage = window.electronAPI.onClipboardImage((dataUrl: string) => {
        const img = new Image()
        img.onload = () => {
          window.electronAPI.addImageItem(dataUrl, img.width, img.height).then(savedItem => {
            setImageItems(prev => [{ ...savedItem, type: 'image' as const }, ...prev].slice(0, 100))
            showToast('图片已保存')
          })
        }
        img.src = dataUrl
      })

      return () => {
        unsubText()
        unsubImage()
      }
    }
  }, [showToast])

  const loadData = async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const data = await window.electronAPI.getClipboardData()
      setTextItems(data.textItems.map(item => ({ ...item, type: 'text' as const })))
      setImageItems(data.imageItems.map(item => ({ ...item, type: 'image' as const })))
    }
  }

  const handleCopyText = async (item: TextItem) => {
    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard('text', item.content)
      showToast('已复制到粘贴板')
    }
  }

  const handleCopyImage = async (item: ImageItem) => {
    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard('image', item.dataUrl)
      showToast('已复制到粘贴板')
    }
  }

  const handleDeleteText = async (id: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteTextItem(id)
      setTextItems(prev => prev.filter(item => item.id !== id))
      showToast('已删除')
    }
  }

  const handleDeleteImage = async (id: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteImageItem(id)
      setImageItems(prev => prev.filter(item => item.id !== id))
      showToast('已删除')
    }
  }

  const handleDelete = (item: ItemData) => {
    if (item.type === 'text') {
      handleDeleteText(item.id)
    } else {
      handleDeleteImage(item.id)
    }
  }

  const handleCopy = (item: ItemData) => {
    if (item.type === 'text') {
      handleCopyText(item)
    } else {
      handleCopyImage(item)
    }
  }

  const handleClearAll = async () => {
    if (window.electronAPI) {
      await window.electronAPI.clearAll()
      setTextItems([])
      setImageItems([])
      showToast('已清空全部')
    }
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        const item = allItems.find(i => i.id === selectedId)
        if (item) handleDelete(item)
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, allItems])

  // 根据当前标签筛选项目
  const displayItems = useMemo(() => {
    if (activeTab === 'all') return allItems
    return allItems.filter(item => item.type === activeTab)
  }, [activeTab, allItems])

  // Tab 切换后滚动到顶部
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [activeTab])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <TitleBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={() => {
          const newValue = !alwaysOnTop
          setAlwaysOnTop(newValue)
          if (window.electronAPI) {
            window.electronAPI.setAlwaysOnTop(newValue)
          }
        }}
      />

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} counts={{ all: allItems.length, text: textItems.length, image: imageItems.length }} />

      <main ref={mainRef} className="flex-1 overflow-y-auto p-3">
        {displayItems.length === 0 ? (
          <EmptyState type={activeTab === 'all' ? 'text' : activeTab} />
        ) : activeTab === 'text' ? (
          <div className="space-y-2">
            {displayItems.map(item => (
              <TextItemCard
                key={item.id}
                item={item as TextItem}
                isSelected={selectedId === item.id}
                onSelect={() => setSelectedId(item.id)}
                onCopy={() => handleCopy(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        ) : activeTab === 'image' ? (
          <div className="grid grid-cols-2 gap-2">
            {displayItems.map(item => (
              <ImageItemCard
                key={item.id}
                item={item as ImageItem}
                isSelected={selectedId === item.id}
                onSelect={() => setSelectedId(item.id)}
                onCopy={() => handleCopy(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        ) : (
          // all 类型：混合展示
          <div className="space-y-2">
            {displayItems.map(item => (
              item.type === 'text' ? (
                <TextItemCard
                  key={item.id}
                  item={item as TextItem}
                  isSelected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                  onCopy={() => handleCopy(item)}
                  onDelete={() => handleDelete(item)}
                />
              ) : (
                <ImageItemCard
                  key={item.id}
                  item={item as ImageItem}
                  isSelected={selectedId === item.id}
                  onSelect={() => setSelectedId(item.id)}
                  onCopy={() => handleCopy(item)}
                  onDelete={() => handleDelete(item)}
                />
              )
            ))}
          </div>
        )}
      </main>

      <StatusBar
        textCount={textItems.length}
        imageCount={imageItems.length}
        activeTab={activeTab}
        isMonitoring={isMonitoring}
      />

      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMonitoring={isMonitoring}
        onToggleMonitor={() => setIsMonitoring(!isMonitoring)}
        onClearAll={handleClearAll}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={() => {
          const newValue = !alwaysOnTop
          setAlwaysOnTop(newValue)
          if (window.electronAPI) {
            window.electronAPI.setAlwaysOnTop(newValue)
          }
        }}
      />
    </div>
  )
}

export default App
