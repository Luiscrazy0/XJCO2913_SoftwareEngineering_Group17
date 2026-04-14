import { useState, useCallback, useEffect } from 'react'
import { PaginatedResponse } from '../types'

interface UsePaginationOptions<T> {
  initialPage?: number
  initialLimit?: number
  totalItems?: number
  fetchData?: (page: number, limit: number) => Promise<PaginatedResponse<T> | T[]>
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
}

interface UsePaginationReturn<T> {
  // 数据状态
  items: T[]
  total: number
  loading: boolean
  error: Error | null
  
  // 分页状态
  page: number
  limit: number
  totalPages: number
  
  // 分页控制
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setLimit: (limit: number) => void
  
  // 实用函数
  hasNextPage: boolean
  hasPrevPage: boolean
  getPageNumbers: () => number[]
  
  // 重新加载
  reload: () => Promise<void>
}

/**
 * 统一的分页逻辑hook
 * @param options 分页配置
 * @returns 分页状态和控制函数
 */
export function usePagination<T>({
  initialPage = 1,
  initialLimit = 10,
  totalItems = 0,
  fetchData,
  onPageChange,
  onLimitChange,
}: UsePaginationOptions<T> = {}): UsePaginationReturn<T> {
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(totalItems)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 计算总页数
  const totalPages = Math.max(1, Math.ceil(total / limit))

  // 获取页面数据
  const loadPage = useCallback(async () => {
    if (!fetchData) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchData(page, limit)
      
      if (Array.isArray(result)) {
        // 如果是数组，假设是全部数据，需要手动分页
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        setItems(result.slice(startIndex, endIndex))
        setTotal(result.length)
      } else {
        // 如果是PaginatedResponse
        setItems(result.items)
        setTotal(result.total)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      console.error('分页数据加载失败:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchData, page, limit])

  // 初始化加载数据
  useEffect(() => {
    if (fetchData) {
      loadPage()
    }
  }, [fetchData, loadPage])

  // 页面变化处理
  const goToPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages))
      setPage(validPage)
      onPageChange?.(validPage)
    },
    [totalPages, onPageChange]
  )

  // 下一页
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      goToPage(page + 1)
    }
  }, [page, totalPages, goToPage])

  // 上一页
  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1)
    }
  }, [page, goToPage])

  // 设置每页数量
  const handleSetLimit = useCallback(
    (newLimit: number) => {
      const validLimit = Math.max(1, newLimit)
      setLimit(validLimit)
      setPage(1) // 重置到第一页
      onLimitChange?.(validLimit)
    },
    [onLimitChange]
  )

  // 重新加载当前页
  const reload = useCallback(async () => {
    await loadPage()
  }, [loadPage])

  // 是否有下一页/上一页
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  // 获取显示的页码数组（用于分页器）
  const getPageNumbers = useCallback(() => {
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    let startPage = Math.max(1, page - halfVisible)
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    // 调整起始页码，确保显示足够的页码
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    const pages: number[] = []
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }, [page, totalPages])

  return {
    // 数据状态
    items,
    total,
    loading,
    error,
    
    // 分页状态
    page,
    limit,
    totalPages,
    
    // 分页控制
    goToPage,
    nextPage,
    prevPage,
    setLimit: handleSetLimit,
    
    // 实用函数
    hasNextPage,
    hasPrevPage,
    getPageNumbers,
    
    // 重新加载
    reload,
  }
}

/**
 * 创建分页配置的预设
 */
export const paginationPresets = {
  small: {
    limits: [5, 10, 20],
    defaultLimit: 10,
  },
  medium: {
    limits: [10, 25, 50],
    defaultLimit: 25,
  },
  large: {
    limits: [20, 50, 100],
    defaultLimit: 50,
  },
}

/**
 * 分页工具函数
 */
export const paginationUtils = {
  // 计算起始索引
  getStartIndex: (page: number, limit: number): number => (page - 1) * limit,
  
  // 计算结束索引
  getEndIndex: (page: number, limit: number): number => page * limit,
  
  // 检查是否在范围内
  isInRange: (index: number, page: number, limit: number): boolean => {
    const start = (page - 1) * limit
    const end = page * limit
    return index >= start && index < end
  },
  
  // 格式化分页信息
  formatPaginationInfo: (page: number, limit: number, total: number): string => {
    const start = Math.min((page - 1) * limit + 1, total)
    const end = Math.min(page * limit, total)
    return `显示 ${start}-${end} 条，共 ${total} 条`
  },
}