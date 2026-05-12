interface TitleBarProps {
  onOpenSettings: () => void
  alwaysOnTop: boolean
  onToggleAlwaysOnTop: () => void
}

function TitleBar({ onOpenSettings, alwaysOnTop, onToggleAlwaysOnTop }: TitleBarProps) {

  const handleMinimize = () => {
    window.electronAPI?.windowMinimize()
  }

  const handleClose = () => {
    window.electronAPI?.windowClose()
  }

  return (
    <div
      className="flex items-center justify-between h-8 bg-white dark:bg-gray-900 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-1.5 px-3">
        <img
          src="./clipboard_flat.png"
          alt="ClipBoard"
          className="w-4 h-4"
          draggable={false}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">粘贴板管理</span>
      </div>

      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={onToggleAlwaysOnTop}
          className={`flex items-center justify-center w-10 h-8 transition-colors ${
            alwaysOnTop
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
              : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
          }`}
          title={alwaysOnTop ? '取消置顶' : '置顶窗口'}
        >
          {alwaysOnTop ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
            </svg>
          )}
        </button>
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center w-10 h-8 text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          title="设置"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-10 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="最小化"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-8 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
          title="关闭"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TitleBar
