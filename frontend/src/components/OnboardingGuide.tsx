import { useState, useCallback } from 'react'

const ONBOARDING_KEY = 'onboarding_complete'

const steps = [
  {
    step: 1,
    title: '选择车辆',
    desc: '浏览附近的可用电动车，选择适合您行程的车型和租赁时长。支持按小时、按天、按周多种方案。',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: '确认支付',
    desc: '确认订单详情和费用明细，选择支付方式完成付款。支持多种支付方式，安全快捷。',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: '开始骑行',
    desc: '支付成功后到指定站点取车，一键解锁即可出发。骑行结束在任意站点归还，系统自动结算费用。',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

interface Props {
  onComplete: () => void
}

export default function OnboardingGuide({ onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const [exiting, setExiting] = useState(false)

  const handleComplete = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      markOnboardingComplete()
      onComplete()
    }, 300)
  }, [onComplete])

  const isLast = current === steps.length - 1

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="新手指引"
    >
      <div className="w-full max-w-md mx-4 animate-fade-in-up">
        <div className="glass-card p-8 md:p-10 rounded-3xl text-center">
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-[var(--mclaren-orange)]' : i < current ? 'w-4 bg-[var(--mclaren-orange)]/50' : 'w-4 bg-[var(--border-line)]'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6 text-[var(--mclaren-orange)]">
            {steps[current].icon}
          </div>

          {/* Content */}
          <div className="mb-8">
            <div className="text-xs font-medium text-[var(--mclaren-orange)] mb-2">
              步骤 {steps[current].step}/3
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3">
              {steps[current].title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {steps[current].desc}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={isLast ? handleComplete : () => setCurrent((c) => c + 1)}
              className="mclaren-btn-3d w-full py-3 text-base"
            >
              {isLast ? '开始使用' : '下一步'}
            </button>
            <button
              onClick={handleComplete}
              className="w-full py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            >
              跳过指引
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
