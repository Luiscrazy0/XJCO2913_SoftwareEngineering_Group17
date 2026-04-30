import PageLayout from '../components/PageLayout'
import SidePromo from '../components/SidePromo'

const packages = [
  {
    id: 'single',
    name: '单次骑行',
    price: '15',
    unit: '/次起',
    desc: '按次付费，灵活出行',
    features: ['按时长计费', '支持续租', '全城任意站点取还'],
    gradient: 'from-slate-600 to-slate-800',
    popular: false,
  },
  {
    id: 'ten',
    name: '10次骑行卡',
    price: '129',
    unit: '/10次',
    desc: '相当于每次¥12.9，省14%',
    features: ['10次骑行额度', '有效期90天', '可转赠好友', '优先预约'],
    gradient: 'from-blue-600 to-indigo-700',
    popular: false,
  },
  {
    id: 'monthly',
    name: '月卡畅骑',
    price: '199',
    unit: '/月',
    desc: '每天不到¥7，无限骑行',
    features: ['30天无限次骑行', '每次最长2小时', '专属客服通道', '免费取消预约'],
    gradient: 'from-[var(--mclaren-orange)] to-orange-700',
    popular: true,
  },
  {
    id: 'season',
    name: '季度畅骑',
    price: '499',
    unit: '/季',
    desc: '相当于每月¥166，省17%',
    features: ['90天无限次骑行', '每次最长4小时', '优先使用新车', '专属客服+道路救援', '赠送安全头盔'],
    gradient: 'from-emerald-600 to-teal-700',
    popular: false,
  },
]

export default function RidePackagesPage() {
  return (
    <PageLayout title="骑行套餐" subtitle="选择最适合您的骑行方案" showFooter>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content: packages grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-stagger">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative surface-card overflow-hidden flex flex-col ${
                  pkg.popular ? 'ring-2 ring-[var(--mclaren-orange)]' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-[var(--mclaren-orange)] text-white shadow-lg">
                      最受欢迎
                    </span>
                  </div>
                )}

                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${pkg.gradient} p-6 text-white`}>
                  <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">¥{pkg.price}</span>
                    <span className="text-sm text-white/70">{pkg.unit}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">{pkg.desc}</p>
                </div>

                {/* Features */}
                <div className="p-6 flex flex-col flex-1">
                  <ul className="space-y-3 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mt-6 w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                      pkg.popular
                        ? 'bg-[var(--mclaren-orange)] text-white hover:brightness-110 shadow-lg shadow-[var(--mclaren-orange)]/25'
                        : 'bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-line)] hover:border-[var(--mclaren-orange)]'
                    }`}
                  >
                    {pkg.id === 'single' ? '按次骑行' : '立即购买'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mt-12 surface-card overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border-line)]">
              <h2 className="text-xl font-bold text-[var(--text-main)]">套餐对比</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">详细对比各套餐权益</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-line)] text-[var(--text-secondary)]">
                    <th className="text-left py-4 px-6 font-medium">权益</th>
                    <th className="text-center py-4 px-4 font-medium">单次</th>
                    <th className="text-center py-4 px-4 font-medium">10次卡</th>
                    <th className="text-center py-4 px-4 font-medium text-[var(--mclaren-orange)]">月卡</th>
                    <th className="text-center py-4 px-4 font-medium">季卡</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-line)]">
                  {[
                    ['每次时长', '按套餐', '2小时', '2小时', '4小时'],
                    ['可转赠', '—', '✓', '—', '✓'],
                    ['优先预约', '—', '✓', '✓', '✓'],
                    ['客服通道', '标准', '标准', '专属', '专属'],
                    ['道路救援', '—', '—', '—', '✓'],
                    ['免费取消', '—', '—', '✓', '✓'],
                    ['安全头盔', '—', '—', '—', '✓'],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-6 text-[var(--text-main)] font-medium">{row[0]}</td>
                      {row.slice(1).map((cell, j) => (
                        <td
                          key={j}
                          className={`py-3.5 px-4 text-center ${
                            j === 2 ? 'text-[var(--mclaren-orange)] font-medium bg-[var(--mclaren-orange)]/5' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 surface-card p-6 md:p-8">
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-6">常见问题</h2>
            <div className="space-y-4">
              {[
                { q: '套餐可以退款吗？', a: '未使用的骑行卡支持7天内全额退款。月卡/季卡按剩余天数比例退款。' },
                { q: '月卡可以同时租多辆车吗？', a: '月卡每次限租一辆车。如需多辆车，请购买多张骑行卡。' },
                { q: '套餐会自动续费吗？', a: '目前所有套餐均为一次性购买，不会自动续费。到期前我们会提醒您。' },
              ].map((faq) => (
                <details key={faq.q} className="group">
                  <summary className="cursor-pointer py-3 text-[var(--text-main)] font-medium hover:text-[var(--mclaren-orange)] transition-colors list-none flex items-center justify-between">
                    {faq.q}
                    <svg className="w-4 h-4 text-[var(--text-secondary)] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="pb-3 text-sm text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar promos - desktop only */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <SidePromo />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
