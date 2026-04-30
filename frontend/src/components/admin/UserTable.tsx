import { AdminUser } from '../../api/users'
import { UserTypeDropdown, UserTypeOption } from './UserTypeDropdown'

interface UserTableProps {
  users: AdminUser[]
  isLoading: boolean
  updatingUserId: string | null
  onUpdateUserType: (userId: string, newType: UserTypeOption) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const ROLE_LABELS: Record<string, string> = { CUSTOMER: '普通用户', MANAGER: '管理员' }

export function UserTable({ users, isLoading, updatingUserId, onUpdateUserType, searchQuery, onSearchChange }: UserTableProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text" placeholder="搜索用户邮箱..." value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-[var(--border-line)] bg-[var(--bg-card)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] placeholder-[var(--text-secondary)] focus:border-[var(--mclaren-orange)] focus:outline-none"
        />
      </div>

      <div className="surface-card overflow-hidden rounded-2xl border border-[var(--border-line)]">
        <table className="min-w-full divide-y divide-[var(--border-line)]">
          <thead className="bg-[var(--bg-input)]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              <th className="px-6 py-4">邮箱</th><th className="px-6 py-4">角色</th><th className="px-6 py-4">用户类型</th><th className="px-6 py-4">注册时间</th><th className="px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-line)] text-sm text-[var(--text-main)]">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mclaren-orange)] border-t-transparent" /></div>
                <p className="mt-2">加载中...</p>
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">{searchQuery ? '没有匹配的用户' : '暂无用户数据'}</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-main)]">{user.email}</div>
                    <div className="mt-0.5 text-xs text-[var(--text-secondary)]">ID: {user.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4"><span className="text-[var(--text-secondary)]">{ROLE_LABELS[user.role] || user.role}</span></td>
                  <td className="px-6 py-4">
                    <UserTypeDropdown userId={user.id} currentType={user.userType} onUpdate={onUpdateUserType} isUpdating={updatingUserId === user.id} />
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—'}
                  </td>
                  <td className="px-6 py-4">{updatingUserId === user.id && <span className="text-xs text-[var(--mclaren-orange)]">更新中...</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
