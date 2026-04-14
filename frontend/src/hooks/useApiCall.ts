import { useState, useCallback, useRef } from 'react'
import { ApiResponse } from '../types'

interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  immediate?: boolean
}

interface UseApiCallReturn<T, P extends any[]> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: P) => Promise<T | null>
  reset: () => void
}

/**
 * 统一的API调用hook，封装loading、error状态管理
 * @param apiFunction 异步API函数
 * @param options 配置选项
 * @returns API调用状态和执行函数
 */
export function useApiCall<T, P extends any[] = any[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallReturn<T, P> {
  const { onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // 创建新的AbortController
      abortControllerRef.current = new AbortController()

      setLoading(true)
      setError(null)

      try {
        const result = await apiFunction(...args)
        setData(result)
        onSuccess?.(result)
        return result
      } catch (err) {
        // 忽略取消请求的错误
        if (err instanceof Error && err.name === 'AbortError') {
          return null
        }

        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    
    // 取消进行中的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * 处理API响应数据的hook，支持分页
 * @param apiFunction 返回ApiResponse的API函数
 * @param options 配置选项
 * @returns API调用状态和执行函数
 */
export function useApiResponse<T, P extends any[] = any[]>(
  apiFunction: (...args: P) => Promise<ApiResponse<T>>,
  options: UseApiCallOptions<T> = {}
) {
  const { onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setLoading(true)
      setError(null)
      setMessage(null)

      try {
        const response = await apiFunction(...args)
        
        if (response.success && response.data) {
          setData(response.data)
          setMessage(response.message || null)
          onSuccess?.(response.data)
          return response.data
        } else {
          const error = new Error(response.error || response.message || 'API请求失败')
          setError(error)
          setMessage(response.message || null)
          onError?.(error)
          return null
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setMessage(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    message,
    execute,
    reset,
  }
}