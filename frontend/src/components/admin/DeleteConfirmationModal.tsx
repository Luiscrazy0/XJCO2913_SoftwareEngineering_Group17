import { Scooter } from '../../types'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  scooter: Scooter | null
  isDeleting?: boolean
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  scooter, 
  isDeleting 
}: DeleteConfirmationModalProps) {
  if (!isOpen || !scooter) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl surface-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-line)]">
          <div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">删除确认</p>
            <h3 className="text-lg font-semibold text-[var(--text-main)]">确认删除车辆</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            aria-label="Close modal"
            disabled={isDeleting}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/15 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.598C19.02 15.92 18.277 17 17.264 17H2.736c-1.013 0-1.756-1.08-1.997-2.303L7.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v3a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-rose-200">警告：此操作不可撤销</h4>
                <p className="mt-1 text-sm text-rose-200/80">
                  删除后车辆将从系统中永久移除，相关预约记录也会受到影响。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-line)]">
              <span className="text-sm font-medium text-[var(--text-secondary)]">车辆位置</span>
              <span className="text-sm font-semibold text-[var(--text-main)]">{scooter.location}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-line)]">
              <span className="text-sm font-medium text-[var(--text-secondary)]">当前状态</span>
              <span className={`text-sm font-semibold ${scooter.status === 'AVAILABLE' ? 'text-emerald-300' : 'text-[var(--text-secondary)]'}`}>
                {scooter.status === 'AVAILABLE' ? '可用' : '不可用'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">车辆ID</span>
              <span className="text-xs font-mono text-[var(--text-secondary)]">{scooter.id.slice(0, 8)}…</span>
            </div>
          </div>

          <p className="text-sm text-[var(--text-secondary)] pt-2">
            确定要删除这辆车吗？删除后无法恢复。
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-line)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-[var(--border-line)] text-[var(--text-secondary)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? '删除中…' : '确认删除'}
          </button>
        </div>
      </div>
    </div>
  )
}
