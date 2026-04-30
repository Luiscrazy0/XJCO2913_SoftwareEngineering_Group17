import { Link } from 'react-router-dom'

interface SidePromoProps {
  className?: string
}

const promos = [
  {
    title: '升级月卡',
    description: '不限次数，每天低至¥6.6',
    link: '/ride-packages',
    color: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: '邀请好友',
    description: '双方各得¥15优惠券',
    link: '/my-feedbacks',
    color: 'from-purple-500 to-pink-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

export default function SidePromo({ className = '' }: SidePromoProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {promos.map((promo) => (
        <Link
          key={promo.title}
          to={promo.link}
          className="block rounded-2xl overflow-hidden group"
        >
          <div className={`bg-gradient-to-br ${promo.color} p-5 text-white relative`}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {promo.icon}
              </div>
              <h3 className="font-bold text-sm mb-1">{promo.title}</h3>
              <p className="text-white/70 text-xs">{promo.description}</p>
              <span className="inline-block mt-3 text-xs font-medium bg-white/20 rounded-full px-3 py-1 group-hover:bg-white/30 transition-colors">
                了解详情 →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
