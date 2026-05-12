import { TabType } from '../types'

interface TabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  counts: {
    all: number
    text: number
    image: number
  }
}

function TabBar({ activeTab, onTabChange, counts }: TabBarProps) {
  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'text', label: '文本' },
    { key: 'image', label: '图片' }
  ]

  return (
    <div className="flex bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab.key
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {counts[tab.key]}
            </span>
          </span>
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      ))}
    </div>
  )
}

export default TabBar
