/**
 * 格式化货币金额
 * @param amount 金额（单位：元）
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期时间字符串 (YYYY-MM-DD HH:MM)
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toISOString().split('T')[0];
  const timeStr = d.toTimeString().split(' ')[0].substring(0, 5);
  return `${dateStr} ${timeStr}`;
}

/**
 * 格式化租赁类型
 * @param hireType 租赁类型
 * @returns 中文名称
 */
export function formatHireType(hireType: string): string {
  const hireTypeMap: Record<string, string> = {
    'HOUR_1': '1小时租赁',
    'HOUR_4': '4小时租赁',
    'DAY_1': '1天租赁',
    'WEEK_1': '1周租赁',
  };
  return hireTypeMap[hireType] || hireType;
}

/**
 * 格式化预订状态
 * @param status 预订状态
 * @returns 中文状态
 */
export function formatBookingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING_PAYMENT': '待支付',
    'CONFIRMED': '已确认',
    'CANCELLED': '已取消',
    'COMPLETED': '已完成',
    'EXTENDED': '已续租',
  };
  return statusMap[status] || status;
}

/**
 * 格式化滑板车状态
 * @param status 滑板车状态
 * @returns 中文状态
 */
export function formatScooterStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'AVAILABLE': '可用',
    'UNAVAILABLE': '不可用',
    'RENTED': '已租出',
  };
  return statusMap[status] || status;
}