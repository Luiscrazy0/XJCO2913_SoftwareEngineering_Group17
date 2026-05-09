import axiosClient from '../utils/axiosClient';
import { ApiResponse } from '../types';

export interface WeeklyRevenueByHireType {
  hireType: string;
  hireTypeName: string;
  totalRevenue: number;
  bookingCount: number;
  averageRevenue: number;
}

export interface WeeklyRevenueResponse {
  startDate: string;
  endDate: string;
  data: WeeklyRevenueByHireType[];
  totalRevenue: number;
  totalBookings: number;
}

export interface DailyRevenueHireType {
  hireType: string;
  hireTypeName: string;
  revenue: number;
}

export interface DailyRevenue {
  date: string;
  totalRevenue: number;
  bookingCount: number;
  hireTypes: DailyRevenueHireType[];
}

export interface DailyRevenueResponse {
  startDate: string;
  endDate: string;
  data: DailyRevenue[];
  totalRevenue: number;
  totalBookings: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  chartType: string;
  period: string;
}

export interface ChartDataResponse {
  labels: string[];
  datasets: ChartDataset[];
  chartType: string;
  period: string;
}

/**
 * 获取周收入统计
 */
export async function getWeeklyRevenue(startDate: string, endDate: string): Promise<WeeklyRevenueResponse> {
  const response = await axiosClient.get<ApiResponse<WeeklyRevenueResponse>>('/statistics/revenue/weekly', {
    params: { startDate, endDate }
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch weekly revenue');
  }
  
  return response.data.data!;
}

/**
 * 获取每日收入统计
 */
export async function getDailyRevenue(startDate: string, endDate: string): Promise<DailyRevenueResponse> {
  const response = await axiosClient.get<ApiResponse<DailyRevenueResponse>>('/statistics/revenue/daily', {
    params: { startDate, endDate }
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch daily revenue');
  }
  
  return response.data.data!;
}

/**
 * 获取图表数据
 */
export async function getRevenueChartData(period: string = 'week', type: string = 'bar'): Promise<ChartData> {
  const response = await axiosClient.get<ApiResponse<ChartDataResponse>>('/statistics/revenue/chart', {
    params: { period, type }
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch chart data');
  }
  
  return response.data.data!;
}

export interface DashboardSummary {
  todayOrders: number;
  todayRevenue: number;
  rentedScooters: number;
  totalUsers: number;
}

/**
 * 获取管理后台首页实时概览数据
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await axiosClient.get<ApiResponse<DashboardSummary>>('/statistics/dashboard-summary');
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch dashboard summary');
  }
  
  return response.data.data!;
}