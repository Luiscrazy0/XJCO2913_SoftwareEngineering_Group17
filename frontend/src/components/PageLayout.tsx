import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showFooter?: boolean
  showBottomNav?: boolean
  className?: string
}

export default function PageLayout({
  children,
  title,
  subtitle,
  showFooter = false,
  showBottomNav = true,
  className = '',
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
      <Navbar />
      <main id="main-content" className={`flex-1 animate-fade-in-up ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          {title && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-main)]">{title}</h1>
              {subtitle && (
                <p className="text-[var(--text-secondary)] mt-2">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
      {showBottomNav && <MobileBottomNav />}
    </div>
  )
}
