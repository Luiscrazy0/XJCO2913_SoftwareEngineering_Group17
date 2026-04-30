import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';
import { getWeeklyRevenue, getDailyRevenue, getRevenueChartData } from '../api/statistics';
import type { WeeklyRevenueResponse, DailyRevenueResponse, ChartData } from '../api/statistics';
import { formatCurrency } from '../utils/formatters';
import { LoadingSpinner } from '../components/ui';
import PageLayout from '../components/PageLayout';

const RevenueStatisticsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenueResponse | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueResponse | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  
  const [activeTab, setActiveTab] = useState<'weekly' | 'daily' | 'chart'>('weekly');
  
  const loadData = async () => {
    if (!user || user.role !== 'MANAGER') {
      showToast('只有管理员可以查看收入统计', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const [weeklyData, dailyData, chart] = await Promise.all([
        getWeeklyRevenue(startDate, endDate),
        getDailyRevenue(startDate, endDate),
        getRevenueChartData('week', 'bar')
      ]);
      
      setWeeklyRevenue(weeklyData);
      setDailyRevenue(dailyData);
      setChartData(chart);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      showToast('加载统计数据失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // 等待身份验证加载完成
    if (authLoading) {
      return;
    }
    
    loadData();
  }, [authLoading]);
  
  const handleDateChange = () => {
    loadData();
  };
  
  const renderWeeklyRevenue = () => {
    if (!weeklyRevenue) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-[var(--bg-card)] rounded-lg shadow border border-[var(--border-line)] p-6">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">统计概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-line)]">
              <p className="text-sm text-[var(--text-secondary)]">统计周期</p>
              <p className="text-lg font-semibold text-[var(--text-main)]">
                {weeklyRevenue.startDate} 至 {weeklyRevenue.endDate}
              </p>
            </div>
            <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-line)]">
              <p className="text-sm text-[var(--text-secondary)]">总收入</p>
              <p className="text-2xl font-bold text-[var(--mclaren-orange)]">
                {formatCurrency(weeklyRevenue.totalRevenue)}
              </p>
            </div>
            <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-line)]">
              <p className="text-sm text-[var(--text-secondary)]">总预订数</p>
              <p className="text-2xl font-bold text-[var(--mclaren-orange)]">
                {weeklyRevenue.totalBookings} 次
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--bg-card)] rounded-lg shadow border border-[var(--border-line)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-line)]">
            <h3 className="text-lg font-semibold text-[var(--text-main)]">按租赁类型统计</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border-line)]">
              <thead className="bg-[var(--bg-input)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    租赁类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    预订数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    总收入
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    平均收入
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-line)]">
                {weeklyRevenue.data.map((item, index) => (
                  <tr key={item.hireType} className={index % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-input)]'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--text-main)]">{item.hireTypeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-main)]">{item.bookingCount} 次</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[var(--mclaren-orange)]">
                        {formatCurrency(item.totalRevenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--text-main)]">
                        {formatCurrency(item.averageRevenue)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  const renderDailyRevenue = () => {
    if (!dailyRevenue) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-[var(--bg-card)] rounded-lg shadow border border-[var(--border-line)] p-6">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">每日收入统计</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-line)]">
              <p className="text-sm text-[var(--text-secondary)]">统计周期总收入</p>
              <p className="text-2xl font-bold text-[var(--mclaren-orange)]">
                {formatCurrency(dailyRevenue.totalRevenue)}
              </p>
            </div>
            <div className="bg-[var(--bg-input)] p-4 rounded-lg border border-[var(--border-line)]">
              <p className="text-sm text-[var(--text-secondary)]">统计周期总预订数</p>
              <p className="text-2xl font-bold text-[var(--mclaren-orange)]">
                {dailyRevenue.totalBookings} 次
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {dailyRevenue.data.map((day) => (
              <div key={day.date} className="border border-[var(--border-line)] rounded-lg p-4 hover:bg-[var(--bg-input)]">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-[var(--text-main)]">{day.date}</h4>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[var(--mclaren-orange)]">
                      {formatCurrency(day.totalRevenue)}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">{day.bookingCount} 个预订</div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="text-sm text-[var(--text-secondary)] mb-1">收入构成：</div>
                  <div className="flex flex-wrap gap-2">
                    {day.hireTypes.map((hireType) => (
                      <div key={hireType.hireType} className="bg-[var(--mclaren-orange)]/20 text-[var(--mclaren-orange)] px-3 py-1 rounded-full text-sm">
                        {hireType.hireTypeName}: {formatCurrency(hireType.revenue)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderChart = () => {
    if (!chartData) return null;
    
    return (
      <div className="bg-[var(--bg-card)] rounded-lg shadow border border-[var(--border-line)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text-main)] mb-4">收入趋势图表</h3>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-[var(--text-secondary)]">图表类型：</span>
              <span className="font-medium ml-2 text-[var(--text-main)]">{chartData.chartType === 'bar' ? '柱状图' : chartData.chartType === 'line' ? '折线图' : '饼图'}</span>
            </div>
            <div>
              <span className="text-sm text-[var(--text-secondary)]">统计周期：</span>
              <span className="font-medium ml-2 text-[var(--text-main)]">
                {chartData.period === 'week' ? '最近一周' : chartData.period === 'month' ? '最近一月' : '最近一年'}
              </span>
            </div>
          </div>
          
          {/* 简单的图表展示 - 使用表格形式 */}
          <div className="border border-[var(--border-line)] rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-[var(--border-line)]">
              <thead className="bg-[var(--bg-input)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    收入金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    可视化
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-card)] divide-y divide-[var(--border-line)]">
                {chartData.labels.map((label, index) => (
                  <tr key={label} className={index % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-input)]'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--text-main)]">{label}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[var(--mclaren-orange)]">
                        {formatCurrency(chartData.datasets[0].data[index])}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="h-4 bg-[var(--bg-input)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--mclaren-orange)] rounded-full"
                            style={{ 
                              width: `${Math.min(100, (chartData.datasets[0].data[index] / Math.max(...chartData.datasets[0].data)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-[var(--mclaren-orange)]/10 border border-[var(--mclaren-orange)]/20 rounded-lg">
            <p className="text-sm text-[var(--mclaren-orange)]">
              <span className="font-medium">提示：</span> 这里展示了收入趋势的可视化数据。实际项目中可以集成图表库（如 Recharts、Chart.js）来展示更丰富的图表。
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <PageLayout title="收入统计分析" subtitle="查看和管理系统收入统计数据">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </PageLayout>
    );
  }
  
  if (user?.role !== 'MANAGER') {
    return (
      <PageLayout title="收入统计分析" subtitle="权限不足">
        <div className="bg-[var(--bg-card)] rounded-lg shadow border border-[var(--border-line)] p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-4">权限不足</h2>
          <p className="text-[var(--text-secondary)] mb-6">只有管理员可以查看收入统计页面。</p>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="收入统计分析" subtitle="查看和管理系统收入统计数据">
        
        {/* 日期选择器 */}
        <div className="bg-[var(--bg-card)] rounded-lg shadow border border-[var(--border-line)] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">选择统计周期</h3>
              <p className="text-sm text-[var(--text-secondary)]">选择开始和结束日期查看对应期间的收入统计</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-main)] mb-1">开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-line)] text-[var(--text-main)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)] focus:border-[var(--mclaren-orange)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-main)] mb-1">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-line)] text-[var(--text-main)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)] focus:border-[var(--mclaren-orange)]"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleDateChange}
                  className="px-4 py-2 bg-[var(--mclaren-orange)] text-white rounded-md hover:bg-[var(--mclaren-orange-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--mclaren-orange)] focus:ring-offset-2"
                >
                  更新数据
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 标签页 */}
        <div className="mb-6">
          <div className="border-b border-[var(--border-line)]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'weekly'
                    ? 'border-[var(--mclaren-orange)] text-[var(--mclaren-orange)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--border-line)]'
                }`}
              >
                按类型统计
              </button>
              <button
                onClick={() => setActiveTab('daily')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'daily'
                    ? 'border-[var(--mclaren-orange)] text-[var(--mclaren-orange)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--border-line)]'
                }`}
              >
                每日统计
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chart'
                    ? 'border-[var(--mclaren-orange)] text-[var(--mclaren-orange)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:border-[var(--border-line)]'
                }`}
              >
                趋势图表
              </button>
            </nav>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="mt-6">
          {activeTab === 'weekly' && renderWeeklyRevenue()}
          {activeTab === 'daily' && renderDailyRevenue()}
          {activeTab === 'chart' && renderChart()}
        </div>
        
        {/* 统计说明 */}
        <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border-line)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">统计说明</h3>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li className="flex items-start">
              <span className="mr-2 text-[var(--mclaren-orange)]">•</span>
              <span>统计仅包含状态为"已确认"、"已完成"和"已续租"的预订</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[var(--mclaren-orange)]">•</span>
              <span>收入金额为预订的总费用（已包含支付记录）</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[var(--mclaren-orange)]">•</span>
              <span>平均收入 = 总收入 / 预订数量</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[var(--mclaren-orange)]">•</span>
              <span>数据实时更新，反映最新的预订和支付状态</span>
            </li>
          </ul>
        </div>
    </PageLayout>
  );
};

export default RevenueStatisticsPage;