import { useState, useMemo, memo, useCallback, useEffect } from 'react'
import { TextItem as TextItemType } from '../types'
import { formatTime } from '../utils/time'

interface TextItemProps {
  item: TextItemType
  isSelected: boolean
  onSelect: (id: string) => void
  onCopy: (item: TextItemType) => void
  onDelete: (id: string) => void
}

function TextItem({ item, isSelected, onSelect, onCopy, onDelete }: TextItemProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  const { isCode, previewContent } = useMemo(() => {
    const isCode = /[`{}()\[\];]/.test(item.content) || item.content.includes('\n')
    const previewContent = item.content.length > 500
      ? item.content.slice(0, 500) + '...'
      : item.content
    return { isCode, previewContent }
  }, [item.content])

  // 使用精简版 highlight.js（仅注册常用语言），中文内容自动作为普通文本处理
  useEffect(() => {
    if (!isCode) {
      setHighlightedHtml(null)
      return
    }
    let cancelled = false
    import('../utils/highlightCode').then(({ highlightCode }) => {
      if (cancelled) return
      const result = highlightCode(previewContent)
      setHighlightedHtml(result)
    })
    return () => { cancelled = true }
  }, [isCode, previewContent])

  const handleCopyClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy(item)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [onCopy, item])

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(item.id)
  }, [onDelete, item.id])

  // 监听键盘回车触发的复制事件，同步复制按钮状态
  useEffect(() => {
    const handleCopied = (e: Event) => {
      if ((e as CustomEvent).detail === item.id) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
    window.addEventListener('item-copied', handleCopied)
    return () => window.removeEventListener('item-copied', handleCopied)
  }, [item.id])

  return (
    <div
      onClick={() => onSelect(item.id)}
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
            onClick={handleCopyClick}
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
            onClick={handleDeleteClick}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="删除"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1 2-2h4a2,2,0,0,1 2,2V6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(TextItem)
