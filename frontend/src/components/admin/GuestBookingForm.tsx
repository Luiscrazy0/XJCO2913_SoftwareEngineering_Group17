import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { employeeBookingsApi } from '../../api/employeeBookings'
import { HireType, Booking } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'

const HIRE_TYPE_OPTIONS: { value: HireType; label: string }[] = [
  { value: 'HOUR_1', label: '1 小时' },
  { value: 'HOUR_4', label: '4 小时' },
  { value: 'DAY_1', label: '1 天' },
  { value: 'WEEK_1', label: '1 周' },
]

export const HIRE_TYPE_LABELS: Record<HireType, string> = {
  HOUR_1: '1 小时',
  HOUR_4: '4 小时',
  DAY_1: '1 天',
  WEEK_1: '1 周',
}

interface GuestBookingFormProps {
  onSuccess: (booking: Booking) => void
}

interface FormErrors {
  guestEmail?: string
  guestName?: string
  scooterId?: string
  startTime?: string
  submit?: string
}

export default function GuestBookingForm({ onSuccess }: GuestBookingFormProps) {
  const [guestEmail, setGuestEmail] = useState('')
  const [guestName, setGuestName] = useState('')
  const [scooterId, setScooterId] = useState('')
  const [scooterSearch, setScooterSearch] = useState('')
  const [hireType, setHireType] = useState<HireType>('HOUR_1')
  const [startTime, setStartTime] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: scooters = [], isLoading: isScootersLoading, isError: isScootersError, error: scootersError } = useQuery({
    queryKey: ['employee-bookings', 'available-scooters'],
    queryFn: employeeBookingsApi.getAvailableScooters,
    staleTime: 60_000,
  })

  const selectedScooter = useMemo(
    () => scooters.find((s) => s.id === scooterId) ?? null,
    [scooters, scooterId],
  )

  const filteredScooters = useMemo(() => {
    if (!scooterSearch.trim()) return scooters
    const q = scooterSearch.toLowerCase()
    return scooters.filter(
      (s) => (s.location ?? '').toLowerCase().includes(q) || (s.id ?? '').toLowerCase().includes(q),
    )
  }, [scooters, scooterSearch])

  const createMutation = useMutation({
    mutationFn: employeeBookingsApi.create,
    onSuccess: (booking) => onSuccess(booking),
    onError: (err: Error) => {
      setErrors((prev) => ({ ...prev, submit: err.message || '创建预约失败' }))
    },
  })

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    const email = guestEmail.trim()
    if (!email) newErrors.guestEmail = '请输入客人邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.guestEmail = '请输入有效的邮箱地址'
    if (!guestName.trim()) newErrors.guestName = '请输入客人姓名'
    if (!scooterId) newErrors.scooterId = '请选择车辆'
    if (!startTime) newErrors.startTime = '请选择开始时间'
    else {
      const selected = new Date(startTime)
      if (Number.isNaN(selected.getTime())) newErrors.startTime = '请选择有效的开始时间'
      else if (selected <= new Date()) newErrors.startTime = '开始时间必须是将来的时间'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!validate()) return
    createMutation.mutate({
      guestEmail: guestEmail.trim(),
      guestName: guestName.trim(),
      scooterId,
      hireType,
      startTime: new Date(startTime).toISOString(),
    })
  }

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  useEffect(() => { setHighlightedIndex(-1) }, [filteredScooters.length])

  const handleSelectScooter = (id: string, location: string) => {
    setScooterId(id)
    setScooterSearch(location)
    setIsDropdownOpen(false)
    setHighlightedIndex(-1)
  }

  const handleScooterKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsDropdownOpen(true)
      e.preventDefault()
      return
    }
    if (!isDropdownOpen) return
    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) => (prev < filteredScooters.length - 1 ? prev + 1 : 0))
        e.preventDefault()
        break
      case 'ArrowUp':
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredScooters.length - 1))
        e.preventDefault()
        break
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filteredScooters.length) {
          const s = filteredScooters[highlightedIndex]
          handleSelectScooter(s.id, s.location)
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsDropdownOpen(false)
        e.preventDefault()
        break
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="客人邮箱"
        type="email"
        placeholder="guest@example.com"
        value={guestEmail}
        onChange={(e) => setGuestEmail(e.target.value)}
        error={errors.guestEmail}
        aria-required="true"
        autoComplete="email"
        disabled={createMutation.isPending}
      />
      <Input
        label="客人姓名"
        type="text"
        placeholder="请输入客人姓名"
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        error={errors.guestName}
        aria-required="true"
        autoComplete="name"
        disabled={createMutation.isPending}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="scooter-search" className="text-sm font-medium text-[var(--text-main)]">
          选择车辆 <span className="text-rose-400">*</span>
        </label>
        <div ref={dropdownRef} className="relative">
          <input
            id="scooter-search"
            type="text"
            role="combobox"
            aria-required="true"
            aria-expanded={isDropdownOpen}
            aria-controls="scooter-listbox"
            className={`w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--border-line)] bg-[var(--bg-input)] text-[var(--text-main)] focus:border-[var(--mclaren-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20 ${errors.scooterId ? 'border-rose-500/50' : ''} ${createMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder={isScootersLoading ? '正在加载车辆...' : '搜索车辆位置或 ID...'}
            value={selectedScooter ? selectedScooter.location : scooterSearch}
            onChange={(e) => { setScooterSearch(e.target.value); setScooterId(''); setIsDropdownOpen(true) }}
            onKeyDown={handleScooterKeyDown}
            disabled={isScootersLoading || createMutation.isPending}
            autoComplete="off"
          />
          {isDropdownOpen && !isScootersLoading && !isScootersError && (
            <ul id="scooter-listbox" role="listbox" className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-[var(--border-line)] bg-[var(--bg-card)] shadow-lg">
              {filteredScooters.length === 0 ? (
                <li className="px-4 py-3 text-sm text-[var(--text-secondary)]">未找到匹配的车辆</li>
              ) : (
                filteredScooters.map((scooter, index) => (
                  <li
                    key={scooter.id}
                    id={`scooter-option-${index}`}
                    role="option"
                    aria-selected={scooter.id === scooterId}
                    className={`cursor-pointer px-4 py-3 text-sm transition-colors ${
                      index === highlightedIndex ? 'bg-[var(--mclaren-orange)]/15 text-[var(--text-main)]'
                      : scooter.id === scooterId ? 'bg-[var(--mclaren-orange)]/10 text-[var(--text-main)]'
                      : 'text-[var(--text-main)] hover:bg-white/5'
                    }`}
                    onClick={() => handleSelectScooter(scooter.id, scooter.location)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="font-medium">{scooter.location}</div>
                    <div className="mt-0.5 text-xs text-[var(--text-secondary)]">ID: {(scooter.id ?? '').slice(0, 8)}...</div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
          {isScootersError && (
            <p className="text-xs text-rose-400" role="alert">
              {scootersError instanceof Error ? scootersError.message : '无法加载车辆列表，请稍后重试'}
            </p>
          )}
          {errors.scooterId && <span className="text-xs text-rose-400" role="alert">{errors.scooterId}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="hire-type" className="text-sm font-medium text-[var(--text-main)]">
          租用时长 <span className="text-rose-400">*</span>
        </label>
        <select
          id="hire-type"
          value={hireType}
          onChange={(e) => setHireType(e.target.value as HireType)}
          aria-required="true"
          disabled={createMutation.isPending}
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--border-line)] bg-[var(--bg-input)] text-[var(--text-main)] focus:border-[var(--mclaren-orange)] focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)]/20"
        >
          {HIRE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Input
        label="开始时间"
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        error={errors.startTime}
        aria-required="true"
        disabled={createMutation.isPending}
      />

      {errors.submit && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-200" role="alert">
          {errors.submit}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" isLoading={createMutation.isPending} className="w-full">
        创建预约
      </Button>
    </form>
  )
}
