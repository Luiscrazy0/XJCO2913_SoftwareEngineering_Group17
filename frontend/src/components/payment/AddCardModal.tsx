import { useState, useCallback, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { paymentCardApi, SaveCardPayload } from '../../api/paymentCards'
import { luhnCheck, detectCardBrand } from '../../utils/luhn'
import { useToast } from '../ToastProvider'

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CURRENT_YEAR = new Date().getFullYear()

export default function AddCardModal({ isOpen, onClose, onSuccess }: AddCardModalProps) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const brand = useMemo(() => detectCardBrand(cardNumber), [cardNumber])
  const digitsOnly = useMemo(() => cardNumber.replace(/\s/g, ''), [cardNumber])

  const resetForm = useCallback(() => {
    setCardNumber('')
    setExpiryMonth('')
    setExpiryYear('')
    setCardholderName('')
    setErrors({})
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const maxLen = brand === 'Amex' ? 15 : 16
    const truncated = raw.slice(0, maxLen)
    const formatted = truncated.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: '' }))
  }

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    if (!digitsOnly) newErrors.cardNumber = '请输入卡号'
    else if (!luhnCheck(digitsOnly)) newErrors.cardNumber = '卡号无效，请检查后重试'

    const month = parseInt(expiryMonth, 10)
    if (!expiryMonth || isNaN(month) || month < 1 || month > 12) newErrors.expiryMonth = '请输入有效月份 (01-12)'

    const yearNum = parseInt(expiryYear, 10)
    const fullYear = expiryYear.length === 2 ? 2000 + yearNum : yearNum
    if (!expiryYear || isNaN(fullYear) || fullYear < CURRENT_YEAR) newErrors.expiryYear = `请输入有效年份 (≥${CURRENT_YEAR})`

    if (!cardholderName.trim()) newErrors.cardholderName = '请输入持卡人姓名'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [digitsOnly, expiryMonth, expiryYear, cardholderName])

  const saveMutation = useMutation({
    mutationFn: (payload: SaveCardPayload) => paymentCardApi.saveCard(payload),
    onSuccess: () => {
      showToast('银行卡添加成功', 'success')
      queryClient.invalidateQueries({ queryKey: ['payment-cards'] })
      resetForm()
      onSuccess()
      onClose()
    },
    onError: (error: unknown) => {
      showToast(error instanceof Error ? error.message : '添加银行卡失败', 'error')
    },
  })

  const doSubmit = useCallback(() => {
    if (!validate()) return
    saveMutation.mutate({
      cardNumber: digitsOnly,
      expiryMonth: parseInt(expiryMonth, 10),
      expiryYear: expiryYear.length === 2 ? 2000 + parseInt(expiryYear, 10) : parseInt(expiryYear, 10),
      cardholderName: cardholderName.trim(),
      brand,
    })
  }, [validate, digitsOnly, expiryMonth, expiryYear, cardholderName, brand, saveMutation])

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={handleClose} disabled={saveMutation.isPending}>取消</Button>
      <Button variant="primary" onClick={doSubmit} isLoading={saveMutation.isPending}>添加</Button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="添加银行卡" size="md" footer={footer}>
      <form onSubmit={(e) => { e.preventDefault(); doSubmit() }} className="space-y-4">
        <Input label="卡号" placeholder="请输入卡号" value={cardNumber} onChange={handleCardNumberChange} error={errors.cardNumber} inputMode="numeric" autoComplete="cc-number" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="有效期 (月)" placeholder="MM" value={expiryMonth} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); setExpiryMonth(v); if (errors.expiryMonth) setErrors(p => ({...p, expiryMonth: ''})) }} error={errors.expiryMonth} maxLength={2} inputMode="numeric" autoComplete="cc-exp-month" />
          <Input label="有效期 (年)" placeholder="YYYY" value={expiryYear} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setExpiryYear(v); if (errors.expiryYear) setErrors(p => ({...p, expiryYear: ''})) }} error={errors.expiryYear} maxLength={4} inputMode="numeric" autoComplete="cc-exp-year" />
        </div>
        <Input label="持卡人姓名" placeholder="请输入持卡人姓名" value={cardholderName} onChange={(e) => { setCardholderName(e.target.value); if (errors.cardholderName) setErrors(p => ({...p, cardholderName: ''})) }} error={errors.cardholderName} autoComplete="cc-name" />
      </form>
    </Modal>
  )
}
