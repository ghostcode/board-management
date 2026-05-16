import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import confetti from 'canvas-confetti'
import TitleBar from './components/TitleBar'

import TabBar from './components/TabBar'
import TextItemCard from './components/TextItem'
import ImageItemCard from './components/ImageItem'
import EmptyState from './components/EmptyState'
import StatusBar from './components/StatusBar'
import SettingsPage from './components/SettingsPage'
import { TabType, TextItem, ImageItem } from './types'

type ItemData = (TextItem & { type: 'text' }) | (ImageItem & { type: 'image' })

function BackToTopButton({ mainRef, activeTab, scrollPositions }: { 
  mainRef: React.RefObject<HTMLElement>
  activeTab: TabType
  scrollPositions: React.MutableRefObject<Record<TabType, number>>
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const onScroll = () => setShow(el.scrollTop > 200)
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [mainRef])

  if (!show) return null

  return (
    <button
      onClick={() => {
        if (mainRef.current) {
          mainRef.current.scrollTo({ top: 0, behavior: 'smooth' })
          scrollPositions.current[activeTab] = 0
        }
      }}
      className="absolute bottom-14 right-4 z-40 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      title="回到顶部"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [tabState, setTabState] = useState<Record<TabType, { selectedId: string | null }>>({
    all: { selectedId: null },
    text: { selectedId: null },
    image: { selectedId: null },
  })
  const scrollPositions = useRef<Record<TabType, number>>({ all: 0, text: 0, image: 0 })
  const prevTabRef = useRef<TabType>(activeTab)

  const selectedId = tabState[activeTab].selectedId
  const setSelectedId = useCallback((id: string | null) => {
    setTabState(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], selectedId: id } }))
  }, [activeTab])
  
  const handleTabChange = useCallback((tab: TabType) => {
    if (mainRef.current) {
      scrollPositions.current[activeTab] = mainRef.current.scrollTop
    }
    setActiveTab(tab)
  }, [activeTab])
  
  const [toast, setToast] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [currentView, setCurrentView] = useState<'home' | 'settings'>('home')
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getSettings().then((settings) => {
        if (settings?.alwaysOnTop !== undefined) {
          setAlwaysOnTop(settings.alwaysOnTop)
        }
        if (settings?.theme) {
          setIsDarkMode(settings.theme === 'dark')
        }
      })
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

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

  const loadData = useCallback(async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const data = await window.electronAPI.getClipboardData()
      setTextItems(data.textItems.map(item => ({ ...item, type: 'text' as const })))
      setImageItems(data.imageItems.map(item => ({ ...item, type: 'image' as const })))
    }
  }, [])

  const triggerConfetti = useCallback(() => {
    const count = 200
    const defaults: confetti.Options = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }, [])

  const handleCopyText = useCallback(async (item: TextItem) => {
    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard('text', item.content)
      triggerConfetti()
    }
  }, [triggerConfetti])

  const handleCopyImage = useCallback(async (item: ImageItem) => {
    if (window.electronAPI) {
      await window.electronAPI.copyToClipboard('image', item.dataUrl)
      triggerConfetti()
    }
  }, [triggerConfetti])

  const handleDeleteText = useCallback(async (id: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteTextItem(id)
      setTextItems(prev => prev.filter(item => item.id !== id))
      showToast('已删除')
    }
  }, [showToast])

  const handleDeleteImage = useCallback(async (id: string) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteImageItem(id)
      setImageItems(prev => prev.filter(item => item.id !== id))
      showToast('已删除')
    }
  }, [showToast])

  const handleClearAll = useCallback(async () => {
    if (window.electronAPI) {
      await window.electronAPI.clearAll()
      setTextItems([])
      setImageItems([])
      showToast('已清空全部')
    }
  }, [showToast])

  // 根据当前标签筛选项目
  const displayItems = useMemo(() => {
    if (activeTab === 'all') return allItems
    return allItems.filter(item => item.type === activeTab)
  }, [activeTab, allItems])

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
  }, [showToast, loadData])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在主页视图响应快捷键
      if (currentView !== 'home') return

      const tabs: TabType[] = ['all', 'text', 'image']
      const currentTabIndex = tabs.indexOf(activeTab)

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const nextIndex = (currentTabIndex + 1) % tabs.length
        handleTabChange(tabs[nextIndex])
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const prevIndex = (currentTabIndex - 1 + tabs.length) % tabs.length
        handleTabChange(tabs[prevIndex])
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (displayItems.length === 0) return
        if (!selectedId) {
          setSelectedId(displayItems[0].id)
        } else {
          const currentIndex = displayItems.findIndex(i => i.id === selectedId)
          const nextIndex = Math.min(currentIndex + 1, displayItems.length - 1)
          setSelectedId(displayItems[nextIndex].id)
        }
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (displayItems.length === 0) return
        if (!selectedId) {
          setSelectedId(displayItems[0].id)
        } else {
          const currentIndex = displayItems.findIndex(i => i.id === selectedId)
          const prevIndex = Math.max(currentIndex - 1, 0)
          setSelectedId(displayItems[prevIndex].id)
        }
        return
      }

      if (e.key === 'Enter' && selectedId) {
        e.preventDefault()
        const item = displayItems.find(i => i.id === selectedId)
        if (item) {
          if (item.type === 'text') {
            handleCopyText(item)
          } else {
            handleCopyImage(item)
          }
        }
        return
      }

      if (e.key === 'Delete' && selectedId) {
        const item = displayItems.find(i => i.id === selectedId)
        if (item) {
          if (item.type === 'text') {
            handleDeleteText(item.id)
          } else {
            handleDeleteImage(item.id)
          }
          // 删除后自动选中下一个项目
          const currentIndex = displayItems.findIndex(i => i.id === selectedId)
          const nextItem = displayItems[currentIndex + 1] || displayItems[currentIndex - 1]
          setSelectedId(nextItem ? nextItem.id : null)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, displayItems, activeTab, currentView, handleTabChange, handleCopyText, handleCopyImage, handleDeleteText, handleDeleteImage, setSelectedId])

  // Tab 切换时保存/恢复滚动位置
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      if (mainRef.current) {
        scrollPositions.current[prevTabRef.current] = mainRef.current.scrollTop
        mainRef.current.scrollTop = scrollPositions.current[activeTab]
      }
      prevTabRef.current = activeTab
    }
  }, [activeTab])

  // 选中项变化时滚动到可视区域
  useEffect(() => {
    if (!selectedId) return
    const el = document.querySelector(`[data-item-id="${selectedId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedId])

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {currentView === 'home' ? (
        <>
          <TitleBar
            onOpenSettings={() => setCurrentView('settings')}
            alwaysOnTop={alwaysOnTop}
            onToggleAlwaysOnTop={() => {
              const newValue = !alwaysOnTop
              setAlwaysOnTop(newValue)
              if (window.electronAPI) {
                window.electronAPI.setAlwaysOnTop(newValue)
              }
            }}
          />

          <TabBar activeTab={activeTab} onTabChange={handleTabChange} counts={{ all: allItems.length, text: textItems.length, image: imageItems.length }} />

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
                    onSelect={setSelectedId}
                    onCopy={handleCopyText}
                    onDelete={handleDeleteText}
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
                    onSelect={setSelectedId}
                    onCopy={handleCopyImage}
                    onDelete={handleDeleteImage}
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
                      onSelect={setSelectedId}
                      onCopy={handleCopyText}
                      onDelete={handleDeleteText}
                    />
                  ) : (
                    <ImageItemCard
                      key={item.id}
                      item={item as ImageItem}
                      isSelected={selectedId === item.id}
                      onSelect={setSelectedId}
                      onCopy={handleCopyImage}
                      onDelete={handleDeleteImage}
                    />
                  )
                ))}
              </div>
            )}
          </main>

          <BackToTopButton mainRef={mainRef} activeTab={activeTab} scrollPositions={scrollPositions} />

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
        </>
      ) : (
        <SettingsPage
          onBack={() => setCurrentView('home')}
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
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => {
            const newValue = !isDarkMode
            setIsDarkMode(newValue)
            if (window.electronAPI) {
              window.electronAPI.setTheme(newValue ? 'dark' : 'light')
            }
          }}
        />
      )}
    </div>
  )
}

export default App
