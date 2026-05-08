import { useState, useEffect } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  isMonitoring: boolean
  onToggleMonitor: () => void
  onClearAll: () => void
  alwaysOnTop: boolean
  onToggleAlwaysOnTop: () => void
}

const PLATFORM_MODIFIER = {
  win32: 'Win',
  darwin: 'Command',
  linux: 'Super'
} as const

function SettingsModal({ isOpen, onClose, isMonitoring, onToggleMonitor, onClearAll, alwaysOnTop, onToggleAlwaysOnTop }: SettingsModalProps) {
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
  }, [isOpen])

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

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-80 bg-white rounded-xl shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">设置</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              全局快捷键
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg text-left transition-colors ${
                  isRecording
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-800'
                }`}
              >
                {isRecording ? '按下快捷键组合...' : (shortcut || defaultShortcut)}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                重置
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              点击按钮后按下快捷键组合（如 {modifierKey}+V）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关闭窗口行为
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleCloseBehaviorChange('minimize')}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  closeBehavior === 'minimize'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                最小化到托盘
              </button>
              <button
                onClick={() => handleCloseBehaviorChange('quit')}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  closeBehavior === 'quit'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                直接退出应用
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              点击关闭按钮时的默认行为
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              窗口置顶
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleAlwaysOnTopChange()}
                className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  alwaysOnTop
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {alwaysOnTop ? '已开启置顶' : '未开启置顶'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              开启后窗口将始终保持在最前面
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              粘贴板监听
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">{isMonitoring ? '监听中' : '已暂停'}</span>
              </div>
              <button
                onClick={onToggleMonitor}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isMonitoring
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isMonitoring ? '暂停监听' : '开始监听'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数据管理
            </label>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
            >
              清空全部粘贴板内容
            </button>
            <p className="mt-1.5 text-xs text-gray-400">
              此操作不可恢复，请谨慎操作
            </p>
          </div>
        </div>

        {showConfirmClear && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-center">
              <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">确认清空</h3>
              <p className="text-xs text-gray-500 mb-4">确定要清空全部粘贴板内容吗？此操作不可恢复。</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
    </div>
  )
}

export default SettingsModal
