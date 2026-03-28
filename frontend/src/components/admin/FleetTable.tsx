import { Scooter } from '../../types'
import { StatusBadge } from './StatusBadge'

interface FleetTableProps {
  scooters: Scooter[]
  onToggleStatus: (scooter: Scooter) => void
  updatingId?: string | null
}

export function FleetTable({ scooters, onToggleStatus, updatingId }: FleetTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            <th className="px-6 py-4">位置</th>
            <th className="px-6 py-4">状态</th>
            <th className="px-6 py-4 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
          {scooters.map((scooter) => (
            <tr key={scooter.id} className="hover:bg-slate-50/60">
              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900">{scooter.location}</div>
                <div className="text-xs text-slate-500 mt-1">ID: {scooter.id.slice(0, 8)}…</div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={scooter.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onToggleStatus(scooter)}
                  disabled={updatingId === scooter.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updatingId === scooter.id ? '更新中…' : scooter.status === 'AVAILABLE' ? '标记不可用' : '恢复可用'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
