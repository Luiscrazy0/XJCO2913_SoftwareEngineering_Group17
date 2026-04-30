import { useQuery } from '@tanstack/react-query'
import { priceApi } from '../../api/price'
import { HireType } from '../../types'

interface Props {
  hireType: HireType
}

export default function PriceEstimate({ hireType }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['price-estimate', hireType],
    queryFn: () => priceApi.estimate(hireType),
    staleTime: 30000,
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-6 w-32 rounded bg-white/10" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">费用估算暂不可用</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-input)] p-4">
      <p className="text-xs font-medium text-[var(--text-secondary)] mb-3">费用明细</p>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">
            基本费用 ({data.durationHours}小时)
          </span>
          <span className="text-[var(--text-main)]">¥{data.baseCost.toFixed(2)}</span>
        </div>
        {data.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">
              {data.discountReason}
            </span>
            <span className="text-emerald-400">-¥{data.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-[var(--border-line)] pt-2 flex justify-between">
          <span className="text-sm font-semibold text-[var(--text-main)]">应付金额</span>
          <span className="text-lg font-bold text-[var(--mclaren-orange)]">
            ¥{data.discountedPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
