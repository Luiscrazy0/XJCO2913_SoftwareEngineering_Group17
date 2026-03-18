import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type AuthTab = 'login' | 'register'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // 表单验证
      if (!email || !password) {
        throw new Error('邮箱和密码不能为空')
      }

      if (activeTab === 'register') {
        if (password !== confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }
        if (password.length < 6) {
          throw new Error('密码长度至少6位')
        }
        await register(email, password)
      } else {
        await login(email, password)
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab)
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo/Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>电动滑板车租赁系统</h1>
          <p style={styles.subtitle}>欢迎使用我们的租赁服务</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'login' ? styles.tabActive : {}),
            }}
            onClick={() => handleTabChange('login')}
          >
            登录
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'register' ? styles.tabActive : {}),
            }}
            onClick={() => handleTabChange('register')}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
              style={styles.input}
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              style={styles.input}
              disabled={isLoading}
              required
            />
          </div>

          {/* Confirm Password Input (Register only) */}
          {activeTab === 'register' && (
            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                style={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : activeTab === 'login' ? '登录' : '注册'}
          </button>

          {/* Help Text */}
          <div style={styles.helpText}>
            {activeTab === 'login' ? (
              <p style={styles.text}>
                还没有账号？{' '}
                <button
                  type="button"
                  style={styles.link}
                  onClick={() => handleTabChange('register')}
                >
                  立即注册
                </button>
              </p>
            ) : (
              <p style={styles.text}>
                已有账号？{' '}
                <button
                  type="button"
                  style={styles.link}
                  onClick={() => handleTabChange('login')}
                >
                  立即登录
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// Styles using CSS variables from the design document
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--auth-bg, #f8fafc)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'var(--auth-card-bg, #FFFFFF)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: 'var(--auth-text-main, #0F172A)',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--auth-text-secondary, #64748B)',
    margin: 0,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--auth-input-border, #E2E8F0)',
    marginBottom: '24px',
  },
  tab: {
    flex: 1,
    padding: '12px 0',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500' as const,
    color: 'var(--auth-tab-inactive, #64748B)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  },
  tabActive: {
    color: 'var(--auth-tab-active, #22C55E)',
    fontWeight: '600' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'var(--auth-text-main, #0F172A)',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid var(--auth-input-border, #E2E8F0)',
    borderRadius: '8px',
    fontSize: '16px',
    color: 'var(--auth-input-text, #0F172A)',
    backgroundColor: 'var(--auth-input-bg, #FFFFFF)',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  inputFocus: {
    borderColor: 'var(--auth-input-focus, #22C55E)',
    boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
  },
  inputError: {
    borderColor: 'var(--auth-input-error, #EF4444)',
  },
  error: {
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--auth-error, #EF4444)',
    borderRadius: '8px',
    color: 'var(--auth-error, #EF4444)',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  button: {
    padding: '14px',
    backgroundColor: 'var(--auth-button-primary, #22C55E)',
    color: 'var(--auth-button-text, #FFFFFF)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonHover: {
    backgroundColor: 'var(--auth-button-primary-hover, #16A34A)',
  },
  buttonActive: {
    backgroundColor: 'var(--auth-button-primary-active, #15803D)',
  },
  buttonDisabled: {
    backgroundColor: 'var(--auth-button-disabled, #86EFAC)',
    cursor: 'not-allowed',
  },
  helpText: {
    textAlign: 'center' as const,
    marginTop: '16px',
  },
  text: {
    fontSize: '14px',
    color: 'var(--auth-text-secondary, #64748B)',
    margin: 0,
  },
  link: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--auth-link, #3B82F6)',
    fontSize: '14px',
    fontWeight: '500' as const,
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  },
}