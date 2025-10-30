import React from 'react';
import component from './page';
import './index.scss';

// 动态导入子路由组件
const Analytics = React.lazy(() => import('./analytics'));
const Reports = React.lazy(() => import('./reports'));

// 页面路由配置信息
export const routeConfig = {
  path: '/windows/dashboard',
  name: 'windows-dashboard',
  title: '仪表盘',
  emoji: '📊',
  requiresAuth: false,
  layout: 'main',
  windowMode: 'popup' as const, // 仪表盘可以作为独立子窗口
  singleWindow: true, // 只允许一个仪表盘窗口
  description: '窗口管理的仪表盘页面，显示各种统计信息和快速链接',
  keywords: ['仪表盘', '统计', '窗口管理', '数据分析'],
  // 子路由配置 - 这些路由在仪表盘中作为子路由，但也可以独立打开
  children: [
    {
      path: 'analytics',
      name: 'analytics',
      title: '数据分析',
      emoji: '📈',
      component: Analytics,
      requiresAuth: false,
      layout: 'main',
      windowMode: 'popup' as const, // 数据分析页也可单独作为子窗口
      singleWindow: false,
      description: '窗口管理的数据分析页面，显示详细的统计信息和趋势图表',
      keywords: ['数据分析', '统计', '图表', '窗口使用情况']
    },
    {
      path: 'reports',
      name: 'reports',
      title: '报告',
      emoji: '📋',
      component: Reports,
      requiresAuth: false,
      layout: 'main',
      windowMode: 'popup' as const, // 报告页也可单独作为子窗口
      singleWindow: false,
      description: '窗口管理系统的报告页面，提供各种详细报告和导出功能',
      keywords: ['报告', '导出', '统计', '日志', '系统状态']
    }
  ]
};

export default component;
