//Provider 链接，提供全局状态管理和功能支持
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { queryClient } from './utils/queryClient'
import AppRouter from "./router/AppRouter"
import { ToastProvider } from './components/ToastProvider'
import { ErrorBoundaryProvider } from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundaryProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  )
}

export default App
