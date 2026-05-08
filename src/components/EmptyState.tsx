interface EmptyStateProps {
  type: 'text' | 'image'
}

function EmptyState({ type }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      {type === 'text' ? (
        <svg className="w-20 h-20 text-gray-300 mb-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"/>
        </svg>
      ) : (
        <svg className="w-20 h-20 text-gray-300 mb-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.5L14.5 12L19 18H5L8.5 13.5ZM19 19V5H5V19H19Z"/>
        </svg>
      )}
      <p className="text-gray-500 text-sm">
        暂无{type === 'text' ? '文本' : '图片'}记录
      </p>
      <p className="text-gray-400 text-xs mt-2 max-w-xs">
        {type === 'text'
          ? '复制文本后会自动保存到这里'
          : '复制图片后会自动保存到这里'
        }
      </p>
    </div>
  )
}

export default EmptyState
