import React from 'react'

const BookingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 统计区域骨架屏 */}
      <div className="mb-8">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-xl shadow-[var(--shadow-card)] border border-[var(--border-line)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <div className="w-6 h-6"></div>
                </div>
                <div className="text-right">
                  <div className="h-8 bg-white/10 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                </div>
              </div>
              <div className="h-3 bg-white/10 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 预约卡片骨架屏 */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-xl shadow-[var(--shadow-card)] border border-[var(--border-line)] overflow-hidden">
            {/* 头部 */}
            <div className="px-6 py-4 border-b border-[var(--border-line)]">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-6 bg-white/10 rounded-full w-24"></div>
                  <div className="h-4 bg-white/10 rounded w-32"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-24"></div>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-6">
              {/* 时间信息 */}
              <div className="mb-6">
                <div className="h-6 bg-white/10 rounded w-32 mb-3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-input)] rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 bg-white/10 rounded mr-2"></div>
                      <div className="h-4 bg-white/10 rounded w-16"></div>
                    </div>
                    <div className="h-5 bg-white/10 rounded w-40"></div>
                  </div>
                  <div className="bg-[var(--bg-input)] rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-5 h-5 bg-white/10 rounded mr-2"></div>
                      <div className="h-4 bg-white/10 rounded w-16"></div>
                    </div>
                    <div className="h-5 bg-white/10 rounded w-40"></div>
                  </div>
                </div>
              </div>

              {/* 车辆信息 */}
              <div className="mb-6">
                <div className="h-6 bg-white/10 rounded w-32 mb-3"></div>
                <div className="bg-[var(--bg-input)] rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-5 h-5 bg-white/10 rounded mt-0.5 mr-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded w-64"></div>
                      <div className="h-3 bg-white/10 rounded w-48"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 价格信息 */}
              <div className="mb-6">
                <div className="h-6 bg-white/10 rounded w-32 mb-3"></div>
                <div className="bg-[var(--bg-input)] rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-white/10 rounded mr-2"></div>
                      <div className="h-4 bg-white/10 rounded w-16"></div>
                    </div>
                    <div className="h-8 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <div className="flex-1 h-12 bg-white/10 rounded-lg"></div>
                <div className="flex-1 h-12 bg-white/10 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookingSkeleton
