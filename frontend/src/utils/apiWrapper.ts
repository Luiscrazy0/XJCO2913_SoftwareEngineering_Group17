import axios, { AxiosResponse, AxiosError } from 'axios'
import { ApiResponse } from '../types'

/**
 * API响应包装器
 * 将原始API响应转换为统一的ApiResponse格式
 */
export class ApiWrapper {
  /**
   * 包装API调用，返回统一的ApiResponse格式
   */
  static async wrap<T>(
    apiCall: () => Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiCall()
      return {
        success: true,
        data: response.data,
        message: response.statusText,
      }
    } catch (error) {
      return this.handleError<T>(error)
    }
  }

  /**
   * 处理错误，转换为统一的ApiResponse格式
   */
  private static handleError<T>(error: unknown): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      
      // 提取错误信息
      let errorMessage = '请求失败'
      let errorDetail = ''

      if (axiosError.response) {
        // 服务器返回了错误状态码
        const status = axiosError.response.status
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = axiosError.response.data as Record<string, unknown>

        errorMessage = this.getErrorMessage(status)
        
        if (data?.message) {
          errorDetail = data.message
        } else if (data?.error) {
          errorDetail = data.error
        } else if (typeof data === 'string') {
          errorDetail = data
        }
      } else if (axiosError.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络连接失败'
        errorDetail = '请检查网络连接'
      } else {
        // 请求配置出错
        errorMessage = '请求配置错误'
        errorDetail = axiosError.message
      }

      return {
        success: false,
        error: errorDetail || errorMessage,
        message: errorMessage,
      }
    }

    // 非Axios错误
    const err = error as Error
    return {
      success: false,
      error: err.message || '未知错误',
      message: '系统错误',
    }
  }

  /**
   * 根据HTTP状态码获取错误消息
   */
  private static getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return '请求参数错误'
      case 401:
        return '未授权访问'
      case 403:
        return '访问被拒绝'
      case 404:
        return '资源不存在'
      case 409:
        return '资源冲突'
      case 422:
        return '数据验证失败'
      case 429:
        return '请求过于频繁'
      case 500:
        return '服务器内部错误'
      case 502:
        return '网关错误'
      case 503:
        return '服务不可用'
      case 504:
        return '网关超时'
      default:
        return '请求失败'
    }
  }

  /**
   * 创建API调用函数，自动包装响应
   */
  static createApiCall<T, P extends any[] = any[]>(
    apiFunction: (...args: P) => Promise<AxiosResponse<T>>
  ): (...args: P) => Promise<ApiResponse<T>> {
    return async (...args: P): Promise<ApiResponse<T>> => {
      return this.wrap(() => apiFunction(...args))
    }
  }
}

/**
 * API工具函数
 */
export const apiUtils = {
  /**
   * 延迟函数（用于模拟加载）
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * 重试API调用
   */
  retry: async <T>(
    apiCall: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> => {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall()
      } catch (error) {
        lastError = error as Error
        
        // 如果不是最后一次重试，等待后继续
        if (i < maxRetries - 1) {
          await apiUtils.delay(delayMs * (i + 1)) // 指数退避
        }
      }
    }

    throw lastError!
  },

  /**
   * 并行执行多个API调用
   */
  parallel: async <T>(apiCalls: Array<() => Promise<T>>): Promise<T[]> => {
    return Promise.all(apiCalls.map(call => call()))
  },

  /**
   * 顺序执行多个API调用
   */
  sequential: async <T>(apiCalls: Array<() => Promise<T>>): Promise<T[]> => {
    const results: T[] = []
    for (const call of apiCalls) {
      results.push(await call())
    }
    return results
  },

  /**
   * 防抖API调用
   */
  debounce: <T extends (...args: any[]) => Promise<any>>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    let resolvePromise: ((value: ReturnType<T>) => void) | null = null

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve) => {
        if (timeout) {
          clearTimeout(timeout)
        }

        resolvePromise = resolve

        timeout = setTimeout(async () => {
          const result = await func(...args)
          if (resolvePromise) {
            resolvePromise(result)
          }
        }, wait)
      })
    }
  },

  /**
   * 节流API调用
   */
  throttle: <T extends (...args: any[]) => Promise<any>>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    let inThrottle: boolean = false
    let lastResult: ReturnType<T> | null = null

    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      if (!inThrottle) {
        inThrottle = true
        lastResult = await func(...args)
        
        setTimeout(() => {
          inThrottle = false
        }, limit)
        
        return lastResult!
      }
      
      return lastResult!
    }
  },
}