import { useState } from 'react'
import { TextItem as TextItemType } from '../types'
import hljs from 'highlight.js'

interface TextItemProps {
  item: TextItemType
  isSelected: boolean
  onSelect: () => void
  onCopy: () => void
  onDelete: () => void
}

function TextItem({ item, isSelected, onSelect, onCopy, onDelete }: TextItemProps) {
  const [copied, setCopied] = useState(false)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isCode = /[`{}()\[\];]/.test(item.content) || item.content.includes('\n')
  const previewContent = item.content.length > 500
    ? item.content.slice(0, 500) + '...'
    : item.content

  const highlightedHtml = isCode
    ? hljs.highlightAuto(previewContent).value
    : null

  return (
    <div
      onClick={onSelect}
      data-item-id={item.id}
      className={`p-3 bg-white dark:bg-gray-800 rounded-lg border transition-all cursor-pointer animate-fade-in ${
        isSelected
          ? 'border-indigo-500 shadow-md'
          : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
    >
      {isCode && highlightedHtml ? (
        <pre className="hljs text-xs font-mono p-2 rounded max-h-40 overflow-y-auto">
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </pre>
      ) : (
        <div className="text-sm text-gray-800 dark:text-gray-200 max-h-32 overflow-y-auto whitespace-pre-wrap break-words">
          {previewContent}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span>{formatTime(item.timestamp)}</span>
          <span>{item.charCount} 字符</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCopy()
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className={`p-1.5 rounded transition-colors ${
              copied
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}
            title={copied ? '已复制' : '复制'}
          >
            {copied ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="删除"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TextItem
