import PageLayout from '../components/PageLayout'

interface FAQItem {
  category: string
  questions: { q: string; a: string }[]
}

const faqData: FAQItem[] = [
  {
    category: '预约',
    questions: [
      {
        q: '如何预约电动车？',
        a: '在"发现车辆"页面选择可用的电动车 → 选择租赁类型（1小时/4小时/1天/1周）和时间 → 确认费用并支付 → 预约成功。',
      },
      {
        q: '如何取消预约？',
        a: '前往"我的预约"页面 → 找到对应订单 → 点击"取消预约"。仅 PENDING_PAYMENT（待支付）和 CONFIRMED（已确认）状态的预约可以取消。',
      },
      {
        q: '可以一次租多辆车吗？',
        a: '当前每次限租一辆电动车。如需多辆，请联系管理员协调。',
      },
    ],
  },
  {
    category: '价格',
    questions: [
      {
        q: '租赁费用是多少？',
        a: '默认价格：1小时 ¥5 / 4小时 ¥15 / 1天 ¥30 / 1周 ¥90。实际价格以系统价格配置页面显示为准，管理员可动态调整。',
      },
      {
        q: '有哪些折扣？',
        a: '学生认证享 8 折优惠、老年用户享 7 折优惠、高频用户（月骑行 20 小时以上）最高可享 7.5 折。认证身份需联系管理员。',
      },
    ],
  },
  {
    category: '骑行',
    questions: [
      {
        q: '如何取车？',
        a: '支付成功后前往取车站点 → 确认车辆外观完好 → 在预约详情页点击"开始骑行" → 开始计费。',
      },
      {
        q: '如何还车？',
        a: '骑行中点击"结束骑行"按钮 → 选择还车站点 → 确认车辆完好 → 还车完成，系统自动结算费用。',
      },
      {
        q: '可以续租吗？',
        a: '可以。骑行过程中可在预约详情页点击"续租"，每次续租 1-24 小时，按 ¥5/小时 计费。',
      },
    ],
  },
  {
    category: '反馈',
    questions: [
      {
        q: '如何报告车辆故障？',
        a: '在"我的反馈"页面提交反馈 → 选择"故障"或"损坏"类别 → 描述具体问题 → 提交。管理员会尽快处理。',
      },
    ],
  },
  {
    category: '账户',
    questions: [
      {
        q: '如何修改密码？',
        a: '当前版本暂未开放自助修改密码功能。如需修改，请联系管理员协助处理。',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <PageLayout title="常见问题" subtitle="关于AAA电动车租赁的常见疑问解答" showFooter={true} showBottomNav={true}>
      <div className="max-w-3xl mx-auto space-y-8">
        {faqData.map((section) => (
          <section key={section.category}>
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-4 pb-2 border-b border-[var(--border-line)]">
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-lg border border-[var(--border-line)] bg-[var(--bg-card)]"
                >
                  <summary className="px-5 py-4 cursor-pointer font-medium text-[var(--text-main)] hover:text-[var(--mclaren-orange)] transition-colors list-none [&::-webkit-details-marker]:hidden flex items-center justify-between">
                    <span>{item.q}</span>
                    <svg className="w-5 h-5 ml-2 flex-shrink-0 text-[var(--text-secondary)] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-[var(--text-secondary)] text-sm leading-relaxed border-t border-[var(--border-line)]/50 pt-3">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}
