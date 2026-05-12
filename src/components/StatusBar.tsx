import { TabType } from '../types'

interface StatusBarProps {
  textCount: number
  imageCount: number
  activeTab: TabType
  isMonitoring: boolean
}

function StatusBar({ textCount, imageCount, activeTab, isMonitoring }: StatusBarProps) {
  const currentCount = activeTab === 'all' 
    ? textCount + imageCount 
    : activeTab === 'text' ? textCount : imageCount

  const label = activeTab === 'all' ? '全部' : activeTab === 'text' ? '文本' : '图片'

  return (
    <footer className="flex items-center justify-between px-4 h-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
      <div className="flex items-center gap-4">
        <span className={isMonitoring ? 'text-green-500' : ''}>
          {isMonitoring && '● '}
          {label}: {currentCount} 条
        </span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span>文本: {textCount} · 图片: {imageCount}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400">
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Del</kbd>
        <span>删除</span>
      </div>
    </footer>
  )
}

export default StatusBar
