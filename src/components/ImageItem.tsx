import { useState, memo, useCallback, useEffect } from 'react'
import { ImageItem as ImageItemType } from '../types'
import ImagePreviewModal from './ImagePreviewModal'
import { formatTime } from '../utils/time'

interface ImageItemProps {
  item: ImageItemType
  isSelected: boolean
  onSelect: (id: string) => void
  onCopy: (item: ImageItemType) => void
  onDelete: (id: string) => void
}

function ImageItem({ item, isSelected, onSelect, onCopy, onDelete }: ImageItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    setIsPreviewOpen(true)
  }, [])

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPreviewOpen(true)
  }, [])

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
    <>
      <div
        data-item-id={item.id}
        className={`bg-white rounded-lg border overflow-hidden transition-all cursor-pointer animate-fade-in ${
          isSelected
            ? 'border-indigo-500 shadow-md'
            : 'border-transparent hover:border-gray-200 hover:shadow-sm'
        }`}
      >
        <div onClick={() => onSelect(item.id)} className="p-2 pb-0">
          <div
            className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden rounded"
            onClick={handleImageClick}
            title="点击预览图片"
          >
            <img
              src={item.dataUrl}
              alt="粘贴图片"
              loading="lazy"
              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>

        <div className="p-2" onClick={() => onSelect(item.id)}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(item.timestamp)}</span>
            <span>{item.width}×{item.height}</span>
          </div>

          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handlePreview}
              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="预览"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button
              onClick={handleCopyClick}
              className={`p-1 rounded transition-colors ${
                copied
                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
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
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0 0,1-2-2V6M8,6V4a2,2,0 0,1 2-2h4a2,2,0 0,1 2,2V6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          imageUrl={item.dataUrl}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  )
}

export default memo(ImageItem)
