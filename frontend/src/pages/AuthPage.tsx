import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

type AuthTab = 'login' | 'register'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [insuranceAcknowledged, setInsuranceAcknowledged] = useState(false)
  const [emergencyContact, setEmergencyContact] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    emergencyContact?: string
  }>({})

  // 验证邮箱格式
  const validateEmail = (email: string): string | null => {
    if (!email) return '邮箱不能为空'
    if (!email.includes('@') || !email.includes('.')) {
      return '邮箱格式不正确'
    }
    return null
  }

  // 验证密码
  const validatePassword = (password: string): string | null => {
    if (!password) return '密码不能为空'
    if (password.length < 6) return '密码长度至少6位'
    return null
  }

  // 验证确认密码
  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return '请确认密码'
    if (password !== confirmPassword) return '两次输入的密码不一致'
    return null
  }

  // 实时验证表单
  const validateForm = () => {
    const errors: typeof formErrors = {}
    
    const emailError = validateEmail(email)
    if (emailError) errors.email = emailError
    
    const passwordError = validatePassword(password)
    if (passwordError) errors.password = passwordError
    
    if (activeTab === 'register') {
      const confirmError = validateConfirmPassword(password, confirmPassword)
      if (confirmError) errors.confirmPassword = confirmError
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // 表单验证
    if (!validateForm()) {
      return
    }
    
    // 注册时需要确认保险条款
    if (activeTab === 'register' && !insuranceAcknowledged) {
      setError('请阅读并同意保险条款后才能注册')
      return
    }
    
    setIsLoading(true)

    try {
      if (activeTab === 'register') {
        await register(email, password, insuranceAcknowledged, emergencyContact)
      } else {
        await login(email, password)
      }
    } catch (err: any) {
      // 提取后端错误消息
      const errorMessage = err.response?.data?.message || err.message || '操作失败，请重试'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab)
    setError(null)
    setFormErrors({})
    setPassword('')
    setConfirmPassword('')
  }

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value)
        if (formErrors.email) {
          const error = validateEmail(value)
          setFormErrors(prev => ({ ...prev, email: error || undefined }))
        }
        break
      case 'password':
        setPassword(value)
        if (formErrors.password) {
          const error = validatePassword(value)
          setFormErrors(prev => ({ ...prev, password: error || undefined }))
        }
        if (activeTab === 'register' && formErrors.confirmPassword) {
          const error = validateConfirmPassword(value, confirmPassword)
          setFormErrors(prev => ({ ...prev, confirmPassword: error || undefined }))
        }
        break
      case 'confirmPassword':
        setConfirmPassword(value)
        if (formErrors.confirmPassword) {
          const error = validateConfirmPassword(password, value)
          setFormErrors(prev => ({ ...prev, confirmPassword: error || undefined }))
        }
        break
    }
  }

  const handleInputFocus = (field: string) => {
    setFocusedInput(field)
  }

  const handleInputBlur = (field: string) => {
    setFocusedInput(null)
    // 失去焦点时验证
    switch (field) {
      case 'email':
        const emailError = validateEmail(email)
        setFormErrors(prev => ({ ...prev, email: emailError || undefined }))
        break
      case 'password':
        const passwordError = validatePassword(password)
        setFormErrors(prev => ({ ...prev, password: passwordError || undefined }))
        break
      case 'confirmPassword':
        const confirmError = validateConfirmPassword(password, confirmPassword)
        setFormErrors(prev => ({ ...prev, confirmPassword: confirmError || undefined }))
        break
    }
  }

  // 获取输入框样式
  const getInputStyle = (field: string, hasError?: boolean) => {
    const baseStyle = {
      padding: '12px 16px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--auth-input-border, #E2E8F0)',
      borderRadius: '8px',
      fontSize: '16px',
      color: 'var(--auth-input-text, #0F172A)',
      backgroundColor: 'var(--auth-input-bg, #FFFFFF)',
      transition: 'all 0.2s ease',
      outline: 'none',
    }

    if (hasError) {
      return {
        ...baseStyle,
        borderColor: 'var(--auth-input-error, #EF4444)',
      }
    }

    if (focusedInput === field) {
      return {
        ...baseStyle,
        borderColor: 'var(--auth-input-focus, #22C55E)',
        boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
      }
    }

    return baseStyle
  }



  // 获取按钮样式
  const getButtonStyle = () => {
    const baseStyle = {
      padding: '14px',
      backgroundColor: 'var(--auth-button-primary, #22C55E)',
      color: 'var(--auth-button-text, #FFFFFF)',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
    }

    if (isLoading) {
      return {
        ...baseStyle,
        backgroundColor: 'var(--auth-button-disabled, #86EFAC)',
        cursor: 'not-allowed',
      }
    }

    return baseStyle
  }

  return (
    <div style={styles.container} role="main" id="main-content">
      <div style={styles.card} className="auth-card">
        {/* Logo/Header */}
        <div style={styles.header}>
          <h1 style={styles.title} id="auth-page-title">电动滑板车租赁系统</h1>
          <p style={styles.subtitle}>欢迎使用我们的租赁服务</p>
        </div>

        {/* Tabs - 改进可访问性 */}
        <div style={styles.tabs} role="tablist" aria-labelledby="auth-page-title">
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'login' ? styles.tabActive : {}),
            }}
            onClick={() => handleTabChange('login')}
            className={activeTab === 'login' ? 'active-tab' : 'inactive-tab'}
            role="tab"
            aria-selected={activeTab === 'login'}
            aria-controls="login-form"
            id="login-tab"
          >
            登录
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'register' ? styles.tabActive : {}),
            }}
            onClick={() => handleTabChange('register')}
            className={activeTab === 'register' ? 'active-tab' : 'inactive-tab'}
            role="tab"
            aria-selected={activeTab === 'register'}
            aria-controls="register-form"
            id="register-tab"
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          style={styles.form}
          role="tabpanel"
          id={activeTab === 'login' ? 'login-form' : 'register-form'}
          aria-labelledby={activeTab === 'login' ? 'login-tab' : 'register-tab'}
          tabIndex={0}
        >
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              邮箱地址
              <span className="sr-only">（必填）</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onFocus={() => handleInputFocus('email')}
              onBlur={() => handleInputBlur('email')}
              placeholder="请输入邮箱地址"
              style={getInputStyle('email', !!formErrors.email)}
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? "email-error" : undefined}
              className="touch-target"
            />
            {formErrors.email && (
              <div id="email-error" style={styles.fieldError} role="alert">
                {formErrors.email}
              </div>
            )}
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              密码
              <span className="sr-only">（必填）</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onFocus={() => handleInputFocus('password')}
              onBlur={() => handleInputBlur('password')}
              placeholder="请输入密码"
              style={getInputStyle('password', !!formErrors.password)}
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={!!formErrors.password}
              aria-describedby={formErrors.password ? "password-error" : undefined}
              className="touch-target"
            />
            {formErrors.password && (
              <div id="password-error" style={styles.fieldError} role="alert">
                {formErrors.password}
              </div>
            )}
          </div>

          {/* Confirm Password Input (Register only) */}
          {activeTab === 'register' && (
            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                确认密码
                <span className="sr-only">（必填）</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onFocus={() => handleInputFocus('confirmPassword')}
                onBlur={() => handleInputBlur('confirmPassword')}
                placeholder="请再次输入密码"
                style={getInputStyle('confirmPassword', !!formErrors.confirmPassword)}
                disabled={isLoading}
                required
                aria-required="true"
                aria-invalid={!!formErrors.confirmPassword}
                aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
                className="touch-target"
              />
              {formErrors.confirmPassword && (
                <div id="confirm-password-error" style={styles.fieldError} role="alert">
                  {formErrors.confirmPassword}
                </div>
              )}
            </div>
          )}

          {/* Insurance Acknowledgment Checkbox (Register only) */}
          {activeTab === 'register' && (
            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input
                  id="insuranceAcknowledged"
                  type="checkbox"
                  checked={insuranceAcknowledged}
                  onChange={(e) => setInsuranceAcknowledged(e.target.checked)}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  style={{
                    marginTop: '4px',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                  className="touch-target"
                />
                <label htmlFor="insuranceAcknowledged" style={{ ...styles.label, marginBottom: 0, cursor: 'pointer' }}>
                  我已阅读并同意保险条款
                  <span className="sr-only">（必填）</span>
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--auth-text-secondary, #64748B)', margin: '4px 0 0 24px' }}>
                在使用我们的租赁服务前，您需要确认了解并同意我们的保险条款和免责声明。
              </p>
            </div>
          )}

          {/* Emergency Contact Input (Register only) */}
          {activeTab === 'register' && (
            <div style={styles.inputGroup}>
              <label htmlFor="emergencyContact" style={styles.label}>
                紧急联系人（可选）
              </label>
              <input
                id="emergencyContact"
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                onFocus={() => handleInputFocus('emergencyContact')}
                onBlur={() => handleInputBlur('emergencyContact')}
                placeholder="姓名 - 电话号码"
                style={getInputStyle('emergencyContact', !!formErrors.emergencyContact)}
                disabled={isLoading}
                aria-invalid={!!formErrors.emergencyContact}
                aria-describedby={formErrors.emergencyContact ? "emergency-contact-error" : undefined}
                className="touch-target"
              />
              {formErrors.emergencyContact && (
                <div id="emergency-contact-error" style={styles.fieldError} role="alert">
                  {formErrors.emergencyContact}
                </div>
              )}
              <p style={{ fontSize: '12px', color: 'var(--auth-text-secondary, #64748B)', marginTop: '4px' }}>
                请提供紧急联系人的姓名和电话号码，格式如：张三 - 13812345678
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={getButtonStyle()}
            className="auth-button mclaren-btn-3d touch-target"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="sr-only">处理中</span>
                处理中...
              </>
            ) : activeTab === 'login' ? '登录' : '注册'}
          </button>

          {/* Help Text */}
          <div style={styles.helpText}>
            {activeTab === 'login' ? (
              <p style={styles.text}>
                还没有账号？{' '}
                <button
                  type="button"
                  style={styles.link}
                  className="auth-link"
                  onClick={() => handleTabChange('register')}
                  aria-label="切换到注册标签页"
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
                  className="auth-link"
                  onClick={() => handleTabChange('login')}
                  aria-label="切换到登录标签页"
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
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-1px',
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: 'var(--auth-tab-active, #22C55E)',
      transform: 'scaleX(0)',
      transition: 'transform 0.2s ease',
    },
  },
  tabActive: {
    color: 'var(--auth-tab-active, #22C55E)',
    fontWeight: '600' as const,
    '&::after': {
      transform: 'scaleX(1)',
    },
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
  fieldError: {
    fontSize: '12px',
    color: 'var(--auth-error, #EF4444)',
    marginTop: '4px',
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
    transition: 'color 0.2s ease',
  },
}