import { useState, useCallback, ChangeEvent, FormEvent } from 'react'



interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => void | Promise<void>
}

interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (e: FormEvent) => Promise<void>
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  setFieldError: <K extends keyof T>(field: K, error: string) => void
  resetForm: () => void
}

/**
 * 统一的表单处理hook
 * @param options 表单配置
 * @returns 表单状态和处理函数
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 验证表单
  const validateForm = useCallback(
    (valuesToValidate: T = values): boolean => {
      if (!validate) return true

      const newErrors = validate(valuesToValidate)
      setErrors(newErrors)
      
      return Object.keys(newErrors).length === 0
    },
    [validate, values]
  )

  // 处理字段变化
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      
      let processedValue: any = value
      
      // 处理不同类型的输入
      if (type === 'number') {
        processedValue = value === '' ? '' : Number(value)
      } else if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement
        processedValue = checkbox.checked
      }

      const newValues = {
        ...values,
        [name]: processedValue,
      }

      setValues(newValues)

      // 如果字段已经被触摸过，立即验证
      if (touched[name as keyof T]) {
        validateForm(newValues)
      }
    },
    [values, touched, validateForm]
  )

  // 处理字段失去焦点
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target
      
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }))

      // 验证当前字段
      if (validate) {
        const fieldErrors = validate(values)
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name as keyof T],
        }))
      }
    },
    [validate, values]
  )

  // 设置字段值
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      const newValues = {
        ...values,
        [field]: value,
      }
      
      setValues(newValues)

      // 如果字段已经被触摸过，立即验证
      if (touched[field]) {
        validateForm(newValues)
      }
    },
    [values, touched, validateForm]
  )

  // 设置字段错误
  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string) => {
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }))
    },
    []
  )

  // 处理表单提交
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      
      // 标记所有字段为已触摸
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true
        return acc
      }, {} as Partial<Record<keyof T, boolean>>)
      
      setTouched(allTouched)

      // 验证表单
      const isValid = validateForm()
      if (!isValid) {
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validateForm, onSubmit]
  )

  // 重置表单
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  // 计算表单是否有效
  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
  }
}

/**
 * 创建表单验证规则的工具函数
 */
export const validationRules = {
  required: (message = '此字段为必填项') => (value: any) => {
    if (value === undefined || value === null || value === '') {
      return message
    }
    return undefined
  },

  email: (message = '请输入有效的邮箱地址') => (value: string) => {
    if (!value) return undefined
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? undefined : message
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (!value) return undefined
    const msg = message || `至少需要${min}个字符`
    return value.length >= min ? undefined : msg
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (!value) return undefined
    const msg = message || `不能超过${max}个字符`
    return value.length <= max ? undefined : msg
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!value) return undefined
    return regex.test(value) ? undefined : message
  },

  number: (message = '请输入有效的数字') => (value: any) => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }
    return !isNaN(Number(value)) ? undefined : message
  },

  min: (min: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) {
      return undefined
    }
    const msg = message || `最小值不能小于${min}`
    return value >= min ? undefined : msg
  },

  max: (max: number, message?: string) => (value: number) => {
    if (value === undefined || value === null) {
      return undefined
    }
    const msg = message || `最大值不能超过${max}`
    return value <= max ? undefined : msg
  },
}