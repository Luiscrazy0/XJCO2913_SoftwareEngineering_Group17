import { useState } from 'react'

export type UserTypeOption = 'NORMAL' | 'STUDENT' | 'SENIOR' | 'FREQUENT'

const USER_TYPE_LABELS: Record<UserTypeOption, string> = {
  NORMAL: '普通', STUDENT: '学生', SENIOR: '老人', FREQUENT: '高频',
}

const USER_TYPE_OPTIONS: UserTypeOption[] = ['NORMAL', 'STUDENT', 'SENIOR', 'FREQUENT']

interface UserTypeDropdownProps {
  userId: string
  currentType: string
  onUpdate: (userId: string, newType: UserTypeOption) => void
  isUpdating?: boolean
}

export function UserTypeDropdown({ userId, currentType, onUpdate, isUpdating }: UserTypeDropdownProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingType, setPendingType] = useState<UserTypeOption | null>(null)

  const handleChange = (newType: string) => {
    if (newType === currentType) return
    setPendingType(newType as UserTypeOption)
    setShowConfirm(true)
  }

  return (
    <>
      <select
        value={currentType}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isUpdating}
        className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-card)] px-3 py-1.5 text-sm text-[var(--text-main)] focus:border-[var(--mclaren-orange)] focus:outline-none disabled:opacity-60"
      >
        {USER_TYPE_OPTIONS.map((type) => (
          <option key={type} value={type}>{USER_TYPE_LABELS[type]}</option>
        ))}
      </select>

      {showConfirm && pendingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirm(false)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--text-main)]">确认更改用户类型</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              确定要将用户类型更改为 <span className="font-semibold text-[var(--text-main)]">{USER_TYPE_LABELS[pendingType]}</span> 吗？
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} disabled={isUpdating} className="rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:bg-white/5">取消</button>
              <button onClick={() => { onUpdate(userId, pendingType); setShowConfirm(false); setPendingType(null) }} disabled={isUpdating} className="rounded-lg bg-[var(--mclaren-orange)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110">{isUpdating ? '更新中...' : '确认'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
