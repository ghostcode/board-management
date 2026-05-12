import { useState, useEffect } from 'react'

interface SettingsPageProps {
  onBack: () => void
  isMonitoring: boolean
  onToggleMonitor: () => void
  onClearAll: () => void
  alwaysOnTop: boolean
  onToggleAlwaysOnTop: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

const PLATFORM_MODIFIER = {
  win32: 'Win',
  darwin: 'Command',
  linux: 'Super'
} as const

function SettingsPage({ onBack, isMonitoring, onToggleMonitor, onClearAll, alwaysOnTop, onToggleAlwaysOnTop, isDarkMode, onToggleDarkMode }: SettingsPageProps) {
  const [shortcut, setShortcut] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [platform, setPlatform] = useState('win32')
  const [closeBehavior, setCloseBehavior] = useState('minimize')
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getSettings().then((settings) => {
        if (settings?.shortcut) {
          setShortcut(settings.shortcut)
        }
        if (settings?.closeBehavior) {
          setCloseBehavior(settings.closeBehavior)
        }
      })
      window.electronAPI.getPlatform().then((p) => setPlatform(p))
    }
  }, [])

  useEffect(() => {
    if (!isRecording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const keys: string[] = []
      if (e.metaKey) keys.push('Command')
      if (e.ctrlKey) keys.push('Ctrl')
      if (e.altKey) keys.push('Alt')
      if (e.shiftKey) keys.push('Shift')

      const key = e.key
      if (key && !['Control', 'Alt', 'Shift', 'Meta', 'Tab'].includes(key)) {
        keys.push(key.length === 1 ? key.toUpperCase() : key)
      }

      if (keys.length >= 2) {
        const newShortcut = keys.join('+')
        setShortcut(newShortcut)
        setIsRecording(false)
        if (window.electronAPI) {
          window.electronAPI.setShortcut(newShortcut)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRecording])

  const modifierKey = PLATFORM_MODIFIER[platform as keyof typeof PLATFORM_MODIFIER] || 'Win'
  const defaultShortcut = `${modifierKey}+V`

  const handleReset = () => {
    setShortcut(defaultShortcut)
    if (window.electronAPI) {
      window.electronAPI.setShortcut(defaultShortcut)
    }
  }

  const handleCloseBehaviorChange = (behavior: string) => {
    setCloseBehavior(behavior)
    if (window.electronAPI) {
      window.electronAPI.setCloseBehavior(behavior)
    }
  }

  const handleAlwaysOnTopChange = () => {
    onToggleAlwaysOnTop()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* 顶部导航栏 */}
      <div className="flex items-center h-10 px-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 dark:text-gray-100 mr-16">设置</h1>
      </div>

      {/* 设置内容 */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              全局快捷键
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg text-left transition-colors ${
                  isRecording
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-800 dark:text-gray-200'
                }`}
              >
                {isRecording ? '按下快捷键组合...' : (shortcut || defaultShortcut)}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                重置
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              点击按钮后按下快捷键组合（如 {modifierKey}+V）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              关闭窗口行为
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleCloseBehaviorChange('minimize')}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  closeBehavior === 'minimize'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                }`}
              >
                最小化到托盘
              </button>
              <button
                onClick={() => handleCloseBehaviorChange('quit')}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  closeBehavior === 'quit'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                }`}
              >
                直接退出应用
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              点击关闭按钮时的默认行为
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              窗口置顶
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleAlwaysOnTopChange()}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  alwaysOnTop
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                }`}
              >
                {alwaysOnTop ? '已开启置顶' : '未开启置顶'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              开启后窗口将始终保持在最前面
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              主题外观
            </label>
            <div className="flex gap-2">
              <button
                onClick={onToggleDarkMode}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  isDarkMode
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                }`}
              >
                {isDarkMode ? '暗黑模式' : '浅色模式'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              切换应用整体外观风格
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              粘贴板监听
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{isMonitoring ? '监听中' : '已暂停'}</span>
              </div>
              <button
                onClick={onToggleMonitor}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isMonitoring
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                }`}
              >
                {isMonitoring ? '暂停监听' : '开始监听'}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              数据管理
            </label>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
            >
              清空全部粘贴板内容
            </button>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              此操作不可恢复，请谨慎操作
            </p>
          </div>
        </div>
      </main>

      {/* 清空确认弹窗 */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50">
          <div className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">确认清空</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">确定要清空全部粘贴板内容吗？此操作不可恢复。</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onClearAll()
                  setShowConfirmClear(false)
                }}
                className="flex-1 px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
