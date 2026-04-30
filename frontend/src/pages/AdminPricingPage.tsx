import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { priceApi, PricingConfig, DiscountItem } from '../api/price'
import PageLayout from '../components/PageLayout'
import { useToast } from '../components/ToastProvider'

const HIRE_TYPE_LABELS: Record<string, string> = {
  HOUR_1: '1小时',
  HOUR_4: '4小时',
  DAY_1: '1天',
  WEEK_1: '1周',
}

const DEFAULT_PRICES: PricingConfig = {
  HOUR_1: 5,
  HOUR_4: 15,
  DAY_1: 30,
  WEEK_1: 90,
}

export default function AdminPricingPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const { data: pricing, isLoading, isError, refetch } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: priceApi.getPricing,
  })

  const updateMutation = useMutation({
    mutationFn: ({ hireType, price }: { hireType: string; price: number }) =>
      priceApi.updatePricing(hireType, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-config'] })
      showToast('价格更新成功', 'success')
      setEditingType(null)
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || err.message || '更新失败', 'error')
    },
  })

  const resetMutation = useMutation({
    mutationFn: priceApi.resetPricing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-config'] })
      showToast('已重置为默认价格', 'success')
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || err.message || '重置失败', 'error')
    },
  })

  const handleStartEdit = (hireType: string, currentPrice: number) => {
    setEditingType(hireType)
    setEditValue(String(currentPrice))
  }

  const handleSave = (hireType: string) => {
    const price = parseFloat(editValue)
    if (isNaN(price) || price <= 0) {
      showToast('请输入有效的正数价格', 'warning')
      return
    }
    updateMutation.mutate({ hireType, price })
  }

  const handleCancelEdit = () => {
    setEditingType(null)
    setEditValue('')
  }

  // Discount config
  const [discountInputs, setDiscountInputs] = useState<Record<string, string>>({})
  const [discountDirty, setDiscountDirty] = useState(false)

  const discountsQuery = useQuery({
    queryKey: ['config', 'discounts'],
    queryFn: priceApi.getDiscounts,
  })

  useEffect(() => {
    if (discountsQuery.data) {
      const map: Record<string, string> = {}
      discountsQuery.data.forEach((item: DiscountItem) => (map[item.userType] = String(Math.round(item.rate * 100))))
      setDiscountInputs(map)
      setDiscountDirty(false)
    }
  }, [discountsQuery.data])

  const saveDiscountsMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(Object.entries(discountInputs).map(([userType, rateStr]) =>
        priceApi.updateDiscount(userType, Number(rateStr) / 100)))
    },
    onSuccess: () => { showToast('折扣已更新', 'success'); queryClient.invalidateQueries({ queryKey: ['config', 'discounts'] }); setDiscountDirty(false) },
    onError: () => showToast('折扣更新失败', 'error'),
  })

  const handleDiscountChange = (userType: string, value: string) => {
    setDiscountInputs((prev) => ({ ...prev, [userType]: value }))
    setDiscountDirty(true)
  }

  const DISCOUNT_LABELS: Record<string, string> = {
    STUDENT: '学生', SENIOR: '老年人', FREQUENT_50H: '高频用户 (50h+)', FREQUENT_20H: '活跃用户 (20h+)',
  }
  const DISCOUNT_ORDER = ['STUDENT', 'SENIOR', 'FREQUENT_50H', 'FREQUENT_20H']

  const currentPricing = pricing ?? DEFAULT_PRICES

  if (isLoading) {
    return (
      <PageLayout title="价格配置" subtitle="管理各租赁类型的定价">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--mclaren-orange)] border-t-transparent" />
        </div>
      </PageLayout>
    )
  }

  if (isError) {
    return (
      <PageLayout title="价格配置" subtitle="数据加载失败">
        <div className="text-center py-16">
          <p className="text-[var(--text-secondary)] mb-4">无法加载价格配置</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-[var(--mclaren-orange)] text-white rounded-lg font-medium hover:brightness-110">重试</button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="价格配置" subtitle="配置各租赁类型的单价（仅管理员）" showFooter>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Current pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-stagger">
          {(Object.keys(currentPricing) as Array<keyof PricingConfig>).map((key) => {
            const isEditing = editingType === key
            const isDefault = currentPricing[key] === DEFAULT_PRICES[key]

            return (
              <div key={key} className="surface-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[var(--text-main)]">{HIRE_TYPE_LABELS[key]}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isDefault ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                    {isDefault ? '默认' : '已调整'}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-secondary)] text-sm">¥</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-line)] text-[var(--text-main)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20 focus:border-[var(--mclaren-orange)] text-lg font-bold"
                        min="1"
                        step="0.01"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(key)
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                      />
                      <span className="text-[var(--text-secondary)] text-sm">/次</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(key)}
                        disabled={updateMutation.isPending}
                        className="flex-1 py-2 bg-[var(--mclaren-orange)] text-white rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-colors"
                      >
                        {updateMutation.isPending ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-2 border border-[var(--border-line)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-[var(--mclaren-orange)] mb-3">¥{currentPricing[key]}</p>
                    <button
                      onClick={() => handleStartEdit(key, currentPricing[key])}
                      className="w-full py-2 border border-[var(--border-line)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:border-[var(--mclaren-orange)] hover:text-[var(--mclaren-orange)] transition-colors"
                    >
                      调整价格
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Price preview / summary */}
        <div className="surface-card p-6">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">价格预览</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-secondary)] border-b border-[var(--border-line)]">
                  <th className="text-left py-3 px-4 font-medium">租赁类型</th>
                  <th className="text-right py-3 px-4 font-medium">单价</th>
                  <th className="text-right py-3 px-4 font-medium">默认价</th>
                  <th className="text-center py-3 px-4 font-medium">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-line)]">
                {(Object.keys(currentPricing) as Array<keyof PricingConfig>).map((key) => {
                  const changed = currentPricing[key] !== DEFAULT_PRICES[key]
                  const diff = currentPricing[key] - DEFAULT_PRICES[key]
                  return (
                    <tr key={key} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-[var(--text-main)] font-medium">{HIRE_TYPE_LABELS[key]}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${changed ? 'text-[var(--mclaren-orange)]' : 'text-[var(--text-main)]'}`}>
                          ¥{currentPricing[key]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--text-secondary)]">¥{DEFAULT_PRICES[key]}</td>
                      <td className="py-3 px-4 text-center">
                        {changed ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                            {diff > 0 ? `+¥${diff}` : `-¥${Math.abs(diff)}`}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-secondary)]">默认</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              if (window.confirm('确定要重置所有价格为默认值吗？此操作不可撤销。')) {
                resetMutation.mutate()
              }
            }}
            disabled={resetMutation.isPending}
            className="px-4 py-2.5 border border-rose-500/40 text-rose-300 rounded-lg text-sm font-medium hover:bg-rose-500/10 disabled:opacity-50 transition-colors"
          >
            {resetMutation.isPending ? '重置中...' : '重置为默认价格'}
          </button>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 border border-[var(--border-line)] text-[var(--text-secondary)] rounded-lg text-sm font-medium hover:border-[var(--mclaren-orange)] transition-colors"
          >
            刷新
          </button>
        </div>

        {/* Discount Section */}
        <div className="surface-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Discounts</p>
              <h3 className="text-lg font-semibold text-[var(--text-main)]">用户折扣率</h3>
            </div>
            <button
              onClick={() => saveDiscountsMutation.mutate()}
              disabled={!discountDirty || saveDiscountsMutation.isPending}
              className="rounded-lg bg-[var(--mclaren-orange)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              {saveDiscountsMutation.isPending ? '保存中...' : '保存折扣'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-secondary)] border-b border-[var(--border-line)]">
                  <th className="text-left py-3 px-4 font-medium">用户类型</th>
                  <th className="text-right py-3 px-4 font-medium">折扣率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-line)]">
                {DISCOUNT_ORDER.map((userType) => (
                  <tr key={userType} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-[var(--text-main)] font-medium">{DISCOUNT_LABELS[userType] || userType}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number" min="0" max="100" step="1"
                          value={discountInputs[userType] ?? ''}
                          onChange={(e) => handleDiscountChange(userType, e.target.value)}
                          className="w-20 rounded-lg border border-[var(--border-line)] bg-[var(--bg-input)] px-3 py-1.5 text-sm text-[var(--text-main)] focus:border-[var(--mclaren-orange)] focus:outline-none text-right"
                        />
                        <span className="text-[var(--text-secondary)]">%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
