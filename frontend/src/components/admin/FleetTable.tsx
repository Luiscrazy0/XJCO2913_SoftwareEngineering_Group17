
import { Scooter } from '../../types'
import { StatusBadge } from './StatusBadge'

interface FleetTableProps {
  scooters: Scooter[]
  onToggleStatus: (scooter: Scooter) => void
  onDelete: (scooter: Scooter) => void
  updatingId?: string | null
  deletingId?: string | null
}

export function FleetTable({ scooters, onToggleStatus, onDelete, updatingId, deletingId }: FleetTableProps) {
  return (
    <div className="surface-card overflow-hidden">
      <table className="min-w-full divide-y divide-[var(--border-line)]">
        <thead className="bg-[var(--bg-input)]">
          <tr className="text-left text-xs font-semibold text-[var(--text-secondary)]">
            <th className="px-6 py-4">位置</th>
            <th className="px-6 py-4">状态</th>
            <th className="px-6 py-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-line)] text-sm text-[var(--text-main)]">
          {scooters.map((scooter) => (
            <tr key={scooter.id} className="hover:bg-white/5">
              <td className="px-6 py-4">
                <div className="font-semibold text-[var(--text-main)]">{scooter.location}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">ID: {scooter.id.slice(0, 8)}…</div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={scooter.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(scooter)}
                    disabled={updatingId === scooter.id || deletingId === scooter.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-line)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--mclaren-orange)] hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updatingId === scooter.id ? '更新中…' : scooter.status === 'AVAILABLE' ? '标记不可用' : '恢复可用'}
                  </button>
                  <button
                    onClick={() => onDelete(scooter)}
                    disabled={deletingId === scooter.id || updatingId === scooter.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-200 hover:border-rose-400 hover:bg-rose-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingId === scooter.id ? '删除中…' : '删除'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
