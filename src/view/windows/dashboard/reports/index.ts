import component from './page';

// 页面路由配置信息
export const routeConfig = {
  path: '/windows/dashboard/reports',
  name: 'windows-dashboard-reports',
  title: '报告',
  emoji: '📋',
  requiresAuth: false,
  layout: 'main',
  description: '窗口管理系统的报告页面，提供各种详细报告和导出功能',
  keywords: ['报告', '导出', '统计', '日志', '系统状态']
};

export default component;
