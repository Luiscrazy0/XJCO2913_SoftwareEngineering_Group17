import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { queryClient } from './utils/queryClient'
import AppRouter from "./router/AppRouter"
import { ToastProvider } from './components/ToastProvider'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
