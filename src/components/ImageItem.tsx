import { useState } from 'react'
import { ImageItem as ImageItemType } from '../types'
import ImagePreviewModal from './ImagePreviewModal'

interface ImageItemProps {
  item: ImageItemType
  isSelected: boolean
  onSelect: () => void
  onCopy: () => void
  onDelete: () => void
}

function ImageItem({ item, isSelected, onSelect, onCopy, onDelete }: ImageItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleImageClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮区域，不触发预览
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    setIsPreviewOpen(true)
  }

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

  return (
    <>
      <div
        className={`bg-white rounded-lg border overflow-hidden transition-all cursor-pointer animate-fade-in ${
          isSelected
            ? 'border-indigo-500 shadow-md'
            : 'border-transparent hover:border-gray-200 hover:shadow-sm'
        }`}
      >
        <div onClick={onSelect} className="p-2 pb-0">
          <div
            className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden rounded"
            onClick={handleImageClick}
            title="点击预览图片"
          >
            <img
              src={item.dataUrl}
              alt="粘贴图片"
              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>

      <div className="p-2" onClick={onSelect}>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(item.timestamp)}</span>
            <span>{item.width}×{item.height}</span>
          </div>

          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="预览"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCopy(); }}
              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="复制"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0 0,1-2-2V6M8,6V4a2,2,0 0 1 2-2h4a2,2,0 0 1 2,2V6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        imageUrl={item.dataUrl}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  )
}

export default ImageItem
