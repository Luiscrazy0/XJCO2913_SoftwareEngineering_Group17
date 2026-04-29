import { useEffect, useState } from 'react'

interface Props {
  show: boolean
  message?: string
}

export default function SuccessAnimation({ show, message = '操作成功！' }: Props) {
  const [visible, setVisible] = useState(show)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      requestAnimationFrame(() => setAnimate(true))
      const timer = setTimeout(() => {
        setAnimate(false)
        setTimeout(() => setVisible(false), 300)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={`rounded-2xl bg-emerald-600 px-8 py-6 shadow-2xl transition-all duration-300 ${
          animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              className={animate ? 'animate-scale-check' : ''}
            />
          </svg>
          <p className="mt-2 text-white font-semibold">{message}</p>
        </div>
      </div>
    </div>
  )
}
