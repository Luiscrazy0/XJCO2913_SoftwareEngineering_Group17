import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { priceApi, PricingItem, DiscountItem } from '../api/price'
import PageLayout from '../components/PageLayout'
import { useToast } from '../components/ToastProvider'

const HIRE_TYPE_LABELS: Record<string, string> = { HOUR_1: '1 小时', HOUR_4: '4 小时', DAY_1: '1 天', WEEK_1: '1 周' }
const HIRE_TYPE_ORDER = ['HOUR_1', 'HOUR_4', 'DAY_1', 'WEEK_1']
const DISCOUNT_LABELS: Record<string, string> = {
  STUDENT: '学生', SENIOR: '老年人', FREQUENT_50H: '高频用户 (50h+)', FREQUENT_20H: '活跃用户 (20h+)',
}
const DISCOUNT_ORDER = ['STUDENT', 'SENIOR', 'FREQUENT_50H', 'FREQUENT_20H']

export default function AdminPricingPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({})
  const [discountInputs, setDiscountInputs] = useState<Record<string, string>>({})
  const [pricingDirty, setPricingDirty] = useState(false)
  const [discountDirty, setDiscountDirty] = useState(false)

  const pricingQuery = useQuery({ queryKey: ['config', 'pricing'], queryFn: priceApi.getPricing })
  const discountsQuery = useQuery({ queryKey: ['config', 'discounts'], queryFn: priceApi.getDiscounts })

  useEffect(() => {
    if (pricingQuery.data) {
      const map: Record<string, string> = {}
      pricingQuery.data.forEach((item: PricingItem) => (map[item.hireType] = String(item.price)))
      setPriceInputs(map)
      setPricingDirty(false)
    }
  }, [pricingQuery.data])

  useEffect(() => {
    if (discountsQuery.data) {
      const map: Record<string, string> = {}
      discountsQuery.data.forEach((item: DiscountItem) => (map[item.userType] = String(Math.round(item.rate * 100))))
      setDiscountInputs(map)
      setDiscountDirty(false)
    }
  }, [discountsQuery.data])

  const savePricingMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(Object.entries(priceInputs).map(([hireType, priceStr]) => priceApi.updatePricing(hireType, Number(priceStr))))
    },
    onSuccess: () => { showToast('价格已更新', 'success'); queryClient.invalidateQueries({ queryKey: ['config', 'pricing'] }); setPricingDirty(false) },
    onError: () => showToast('价格更新失败', 'error'),
  })

  const resetPricingMutation = useMutation({
    mutationFn: priceApi.resetPricing,
    onSuccess: () => { showToast('价格已重置', 'success'); queryClient.invalidateQueries({ queryKey: ['config', 'pricing'] }) },
    onError: () => showToast('价格重置失败', 'error'),
  })

  const saveDiscountsMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(Object.entries(discountInputs).map(([userType, rateStr]) => priceApi.updateDiscount(userType, Number(rateStr) / 100)))
    },
    onSuccess: () => { showToast('折扣已更新', 'success'); queryClient.invalidateQueries({ queryKey: ['config', 'discounts'] }); setDiscountDirty(false) },
    onError: () => showToast('折扣更新失败', 'error'),
  })

  const handlePriceChange = (hireType: string, value: string) => { setPriceInputs((prev) => ({ ...prev, [hireType]: value })); setPricingDirty(true) }
  const handleDiscountChange = (userType: string, value: string) => { setDiscountInputs((prev) => ({ ...prev, [userType]: value })); setDiscountDirty(true) }

  const loading = (pricingQuery.isLoading && !pricingQuery.data) || (discountsQuery.isLoading && !discountsQuery.data)

  if (loading) {
    return <PageLayout title="价格配置" subtitle="加载中..."><div className="flex justify-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--mclaren-orange)] border-t-transparent" /></div></PageLayout>
  }

  return (
    <PageLayout title="定价与折扣配置" subtitle="管理租赁价格与用户折扣率" showFooter={false}>
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Pricing Section */}
        <section className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Pricing</p>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">租赁价格</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetPricingMutation.mutate()} disabled={resetPricingMutation.isPending} className="rounded-lg border border-[var(--border-line)] px-3 py-1.5 text-sm font-semibold text-[var(--text-main)] hover:bg-white/5 disabled:opacity-60">重置</button>
              <button onClick={() => savePricingMutation.mutate()} disabled={!pricingDirty || savePricingMutation.isPending} className="rounded-lg bg-[var(--mclaren-orange)] px-4 py-1.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">{savePricingMutation.isPending ? '保存中...' : '保存价格'}</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border-line)]">
            <table className="min-w-full divide-y divide-[var(--border-line)]">
              <thead className="bg-[var(--bg-input)]">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  <th className="px-6 py-4">租赁类型</th><th className="px-6 py-4">价格 (元)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-line)] text-sm text-[var(--text-main)]">
                {HIRE_TYPE_ORDER.map((hireType) => (
                  <tr key={hireType} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-medium">{HIRE_TYPE_LABELS[hireType] || hireType}</td>
                    <td className="px-6 py-4">
                      <input type="number" min="0" step="0.01" value={priceInputs[hireType] ?? ''} onChange={(e) => handlePriceChange(hireType, e.target.value)}
                        className="w-28 rounded-lg border border-[var(--border-line)] bg-[var(--bg-card)] px-3 py-1.5 text-sm text-[var(--text-main)] focus:border-[var(--mclaren-orange)] focus:outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Discount Section */}
        <section className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Discounts</p>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">用户折扣</h2>
            </div>
            <button onClick={() => saveDiscountsMutation.mutate()} disabled={!discountDirty || saveDiscountsMutation.isPending} className="rounded-lg bg-[var(--mclaren-orange)] px-4 py-1.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">{saveDiscountsMutation.isPending ? '保存中...' : '保存折扣'}</button>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border-line)]">
            <table className="min-w-full divide-y divide-[var(--border-line)]">
              <thead className="bg-[var(--bg-input)]">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  <th className="px-6 py-4">用户类型</th><th className="px-6 py-4">折扣率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-line)] text-sm text-[var(--text-main)]">
                {DISCOUNT_ORDER.map((userType) => (
                  <tr key={userType} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-medium">{DISCOUNT_LABELS[userType] || userType}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" max="100" step="1" value={discountInputs[userType] ?? ''} onChange={(e) => handleDiscountChange(userType, e.target.value)}
                          className="w-20 rounded-lg border border-[var(--border-line)] bg-[var(--bg-card)] px-3 py-1.5 text-sm text-[var(--text-main)] focus:border-[var(--mclaren-orange)] focus:outline-none" />
                        <span className="text-[var(--text-secondary)]">%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
