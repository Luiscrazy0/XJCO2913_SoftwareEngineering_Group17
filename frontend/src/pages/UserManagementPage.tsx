import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import { UserTable } from '../components/admin/UserTable'
import { UserTypeOption } from '../components/admin/UserTypeDropdown'
import PageLayout from '../components/PageLayout'
import { useToast } from '../components/ToastProvider'

export default function UserManagementPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', 'list', { page, limit, search: searchQuery }],
    queryFn: () => usersApi.getUsers({ page, limit, search: searchQuery || undefined }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ userId, userType }: { userId: string; userType: string }) => usersApi.updateUserType(userId, userType),
    onMutate: ({ userId }) => setUpdatingId(userId),
    onSuccess: () => {
      showToast('用户类型已更新', 'success')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => showToast('更新失败，请重试', 'error'),
    onSettled: () => setUpdatingId(null),
  })

  const handleUpdateUserType = useCallback((userId: string, newType: UserTypeOption) => {
    updateMutation.mutate({ userId, userType: newType })
  }, [updateMutation])

  if (isLoading && !data) {
    return <PageLayout title="用户管理" subtitle="加载中..."><div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--mclaren-orange)] border-t-transparent" /></div></PageLayout>
  }

  if (isError) {
    return (
      <PageLayout title="用户管理" subtitle="加载失败">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/15 p-6 text-center">
          <p className="text-rose-200">{error instanceof Error ? error.message : '未知错误'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">重试</button>
        </div>
      </PageLayout>
    )
  }

  const users = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <PageLayout title="用户管理" subtitle="查看用户列表、修改用户类型、管理折扣权限" showFooter={false}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">User List</p>
          <h2 className="text-xl font-semibold text-[var(--text-main)]">用户列表</h2>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          共 <span className="font-semibold text-[var(--text-main)]">{data?.total ?? 0}</span> 位用户
        </div>
      </div>

      <UserTable users={users} isLoading={isLoading} updatingUserId={updatingId} onUpdateUserType={handleUpdateUserType}
        searchQuery={searchQuery} onSearchChange={(q) => { setSearchQuery(q); setPage(1) }} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-[var(--border-line)] pt-4">
          <div className="text-sm text-[var(--text-secondary)]">第 {page} / {totalPages} 页</div>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="rounded-lg border border-[var(--border-line)] px-3 py-1.5 text-sm text-[var(--text-main)] hover:bg-white/5 disabled:opacity-40">上一页</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="rounded-lg border border-[var(--border-line)] px-3 py-1.5 text-sm text-[var(--text-main)] hover:bg-white/5 disabled:opacity-40">下一页</button>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
