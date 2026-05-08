import { useEffect, useCallback, useRef } from 'react'

interface ImagePreviewModalProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
}

function ImagePreviewModal({ isOpen, imageUrl, onClose }: ImagePreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const stateRef = useRef({ scale: 1, x: 0, y: 0, isDragging: false, lastX: 0, lastY: 0 })

  const updateTransform = useCallback(() => {
    const s = stateRef.current
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${s.x}px, ${s.y}px) scale(${s.scale})`
    }
  }, [])

  // 处理 ESC 键关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const s = stateRef.current
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    s.scale = Math.min(5, Math.max(0.1, s.scale * delta))
    updateTransform()
  }, [updateTransform])

  // 鼠标拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const s = stateRef.current
    s.isDragging = true
    s.lastX = e.clientX
    s.lastY = e.clientY
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const s = stateRef.current
    if (!s.isDragging) return
    const dx = e.clientX - s.lastX
    const dy = e.clientY - s.lastY
    s.x += dx
    s.y += dy
    s.lastX = e.clientX
    s.lastY = e.clientY
    updateTransform()
  }, [updateTransform])

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false
    if (containerRef.current) containerRef.current.style.cursor = 'grab'
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      // 重置状态
      stateRef.current = { scale: 1, x: 0, y: 0, isDragging: false, lastX: 0, lastY: 0 }
      if (imgRef.current) {
        imgRef.current.style.transform = 'translate(0px, 0px) scale(1)'
      }
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="关闭 (ESC)"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* 缩放提示 */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-white/70 text-xs">
        {Math.round(stateRef.current.scale * 100)}%
      </div>

      {/* 图片容器 */}
      <div
        ref={containerRef}
        className="relative w-[90vw] h-[85vh] flex items-center justify-center overflow-hidden animate-modal"
        style={{ cursor: 'grab' }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="预览图片"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-none select-none"
          draggable={false}
          style={{ transform: 'translate(0px, 0px) scale(1)' }}
        />
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        滚轮缩放 · 拖拽平移 · 点击外部或按 ESC 关闭
      </div>
    </div>
  )
}

export default ImagePreviewModal
