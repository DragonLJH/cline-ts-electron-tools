import component from './page';

// 页面路由配置信息
export const routeConfig = {
  path: '/windows/dashboard/analytics',
  name: 'windows-dashboard-analytics',
  title: '数据分析',
  emoji: '📈',
  requiresAuth: false,
  layout: 'main',
  description: '窗口管理的数据分析页面，显示详细的统计信息和趋势图表',
  keywords: ['数据分析', '统计', '图表', '窗口使用情况']
};

export default component;
