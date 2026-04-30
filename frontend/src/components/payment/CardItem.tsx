import { PaymentCard } from '../../api/paymentCards'

interface CardItemProps {
  card: PaymentCard
  onDelete: () => void
  isDeleting?: boolean
}

const brandConfig: Record<string, { label: string; bg: string; text: string }> = {
  Visa: { label: 'VISA', bg: 'bg-blue-700', text: 'text-white' },
  Mastercard: { label: 'MC', bg: 'bg-orange-500', text: 'text-white' },
  Amex: { label: 'AMEX', bg: 'bg-blue-500', text: 'text-white' },
  Discover: { label: 'DISC', bg: 'bg-orange-400', text: 'text-white' },
  Unknown: { label: 'CARD', bg: 'bg-[var(--bg-main)]', text: 'text-[var(--text-secondary)]' },
}

export default function CardItem({ card, onDelete, isDeleting }: CardItemProps) {
  const brand = brandConfig[card.brand] ?? brandConfig.Unknown

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-line)] rounded-xl p-5 transition hover:border-[var(--mclaren-orange)]/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-12 h-8 shrink-0 rounded-md flex items-center justify-center text-[11px] font-bold tracking-wide ${brand.bg} ${brand.text} border border-[var(--border-line)]`}>
            {brand.label}
          </div>
          <div className="min-w-0">
            <p className="text-[var(--text-main)] font-mono text-lg tracking-wider">
              **** **** **** {card.last4}
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5 truncate">
              {card.cardholderName}
              <span className="mx-1.5">|</span>
              有效期 {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
            </p>
          </div>
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="ml-4 p-2 shrink-0 text-[var(--text-secondary)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="删除银行卡"
        >
          {isDeleting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
