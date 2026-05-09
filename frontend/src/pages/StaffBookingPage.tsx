import { useState } from 'react'
import dayjs from 'dayjs'
import PageLayout from '../components/PageLayout'
import GuestBookingForm, { HIRE_TYPE_LABELS } from '../components/admin/GuestBookingForm'
import { Booking } from '../types'
import Button from '../components/ui/Button'

export default function StaffBookingPage() {
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null)

  if (createdBooking) {
    const b = createdBooking as Booking & { guestEmail?: string; guestName?: string }
    return (
      <PageLayout title="代客预约" subtitle="预约创建成功" showFooter={false}>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-main)]">预约创建成功</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">已成功为游客创建代客预约。</p>
          </div>
          <div className="mt-6 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6">
            <div className="mb-4 border-b border-[var(--border-line)] pb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">预订编号</p>
              <p className="mt-1 font-mono text-sm text-[var(--text-main)]">{b.id}</p>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-[var(--text-secondary)]">客人姓名</dt><dd className="mt-1 text-sm font-semibold text-[var(--text-main)]">{b.guestName ?? '-'}</dd></div>
              <div><dt className="text-xs uppercase text-[var(--text-secondary)]">客人邮箱</dt><dd className="mt-1 text-sm text-[var(--text-main)]">{b.guestEmail ?? '-'}</dd></div>
              <div><dt className="text-xs uppercase text-[var(--text-secondary)]">车辆</dt><dd className="mt-1 text-sm text-[var(--text-main)]">{b.scooter?.location ?? '-'}</dd></div>
              <div><dt className="text-xs uppercase text-[var(--text-secondary)]">租用时长</dt><dd className="mt-1 text-sm text-[var(--text-main)]">{HIRE_TYPE_LABELS[b.hireType] ?? b.hireType}</dd></div>
              <div><dt className="text-xs uppercase text-[var(--text-secondary)]">开始时间</dt><dd className="mt-1 text-sm text-[var(--text-main)]">{dayjs(b.startTime).format('YYYY-MM-DD HH:mm')}</dd></div>
              <div><dt className="text-xs uppercase text-[var(--text-secondary)]">结束时间</dt><dd className="mt-1 text-sm text-[var(--text-main)]">{dayjs(b.endTime).format('YYYY-MM-DD HH:mm')}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs uppercase text-[var(--text-secondary)]">总费用</dt><dd className="mt-1 text-xl font-bold text-[var(--mclaren-orange)]">¥{b.totalCost.toFixed(2)}</dd></div>
            </dl>
          </div>
          <div className="mt-6 text-center">
            <Button variant="primary" size="lg" onClick={() => setCreatedBooking(null)} className="w-full sm:w-auto">创建新预约</Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="代客预约" subtitle="为游客创建预约" showFooter={false}>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-[var(--border-line)] bg-[var(--bg-card)] p-6">
          <div className="mb-6 border-b border-[var(--border-line)] pb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Staff Booking</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--text-main)]">填写预约信息</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">为无法自行操作的游客创建AAA电动车租赁预约</p>
          </div>
          <GuestBookingForm onSuccess={(booking) => setCreatedBooking(booking)} />
        </div>
      </div>
    </PageLayout>
  )
}
