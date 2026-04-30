import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentCardApi } from '../../api/paymentCards'
import CardItem from './CardItem'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ToastProvider'

interface CardListProps {
  onAddCard: () => void
}

export default function CardList({ onAddCard }: CardListProps) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { user } = useAuth()

  const { data: cards = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['payment-cards', user?.id],
    queryFn: paymentCardApi.getCards,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: paymentCardApi.deleteCard,
    onSuccess: () => {
      showToast('银行卡已删除', 'success')
      queryClient.invalidateQueries({ queryKey: ['payment-cards'] })
    },
    onError: (err: unknown) => {
      showToast(err instanceof Error ? err.message : '删除银行卡失败', 'error')
    },
  })

  const handleDelete = () => {
    if (window.confirm('确定要删除这张银行卡吗？')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-line)] rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded-md bg-[var(--bg-main)]" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded bg-[var(--bg-main)]" />
                <div className="h-4 w-32 rounded bg-[var(--bg-main)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-secondary)] mb-4">{error instanceof Error ? error.message : '无法加载银行卡信息'}</p>
        <Button variant="secondary" onClick={() => refetch()}>重试</Button>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--bg-card)] border border-[var(--border-line)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-main)] mb-2">尚未添加银行卡</h3>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">添加银行卡后即可在租车时快速完成支付</p>
        <Button variant="primary" size="lg" onClick={onAddCard}>添加银行卡</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-main)]">
          已保存的银行卡 <span className="text-[var(--text-secondary)] font-normal">({cards.length})</span>
        </h2>
        <Button variant="primary" size="sm" onClick={onAddCard}>+ 添加</Button>
      </div>
      <div className="space-y-4">
        {cards.map((card) => (
          <CardItem key={card.id} card={card} onDelete={handleDelete} isDeleting={deleteMutation.isPending} />
        ))}
      </div>
    </div>
  )
}
