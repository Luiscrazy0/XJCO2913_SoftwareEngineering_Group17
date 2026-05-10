import { Link } from 'react-router-dom'

interface SidePromoProps {
  className?: string
}

const promos: never[] = []

export default function SidePromo({ className = '' }: SidePromoProps) {
  if (promos.length === 0) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {promos.map((promo) => {
        const Content = (
          <div className={`bg-gradient-to-br ${promo.color} p-5 text-white relative`}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {promo.icon}
              </div>
              <h3 className="font-bold text-sm mb-1">{promo.title}</h3>
              <p className="text-white/70 text-xs">{promo.description}</p>
              <span className="inline-block mt-3 text-xs font-medium bg-white/20 rounded-full px-3 py-1 group-hover:bg-white/30 transition-colors">
                {promo.link ? '了解详情 →' : '敬请期待'}
              </span>
            </div>
          </div>
        )

        if (!promo.link) {
          return (
            <button
              key={promo.title}
              className="block w-full rounded-2xl overflow-hidden group text-left"
              type="button"
            >
              {Content}
            </button>
          )
        }

        return (
          <Link
            key={promo.title}
            to={promo.link}
            className="block rounded-2xl overflow-hidden group"
          >
            {Content}
          </Link>
        )
      })}
    </div>
  )
}
