import component from './page';
import './index.scss';

// 页面路由配置信息
export const routeConfig = {
  path: '/windows',
  name: 'windows',
  title: '窗口管理',
  emoji: '🖼️',
  requiresAuth: false,
  layout: 'main',
  windowMode: 'popup' as const, // 窗口管理可以作为子窗口打开
  singleWindow: false, // 允许多个窗口管理页面
  description: '测试和演示Electron窗口管理的各种功能，包括新窗口、子窗口、窗口状态控制等',
  keywords: ['窗口管理', 'Electron窗口', '子窗口', '窗口控制']
};

export default component;
