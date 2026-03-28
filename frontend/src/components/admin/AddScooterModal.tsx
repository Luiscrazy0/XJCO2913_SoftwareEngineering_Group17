import { FormEvent, useState } from 'react'

interface AddScooterModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (location: string) => Promise<void>
  isSubmitting?: boolean
}

export function AddScooterModal({ isOpen, onClose, onSubmit, isSubmitting }: AddScooterModalProps) {
  const [location, setLocation] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!location.trim()) {
      setError('请输入车辆位置（不少于 3 个字符）')
      return
    }

    try {
      await onSubmit(location.trim())
      setLocation('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败，请稍后再试')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">新增车辆</p>
            <h3 className="text-lg font-semibold text-slate-900">录入车队位置</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            车辆位置
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              placeholder="例：Liverpool Lime Street - Gate B"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoFocus
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '创建中…' : '确认创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
