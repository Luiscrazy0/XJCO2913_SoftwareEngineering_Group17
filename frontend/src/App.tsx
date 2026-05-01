import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { queryClient } from './utils/queryClient'
import AppRouter from "./router/AppRouter"
import { ToastProvider } from './components/ToastProvider'
import SplashScreen from './components/SplashScreen'
import GlobalLoadingBar from './components/ui/GlobalLoadingBar'
import ErrorBoundary from './components/ui/ErrorBoundary'

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
              <div
                className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--mclaren-orange)]/[0.03] blur-3xl"
                style={{ animation: 'pulse 8s ease-in-out infinite' }}
              />
              <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[var(--mclaren-orange)]/[0.02] blur-3xl" />
            </div>
            <GlobalLoadingBar />
            <ErrorBoundary showRetry onRetry={() => window.location.reload()}>
              <AppRouter />
            </ErrorBoundary>
            <SplashScreen />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
