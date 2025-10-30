import component from './page';
import './index.scss';

// 页面路由配置信息
export const routeConfig = {
  path: '/',
  name: 'home',
  title: '主页',
  emoji: '🏠',
  requiresAuth: false,
  layout: 'main',
  windowMode: 'inline' as const, // 主页强制在当前窗口
  singleWindow: false,
  description: 'Electron应用程序的主页，展示基本信息和系统功能',
  keywords: ['Electron', 'React', '桌面应用', '主页']
};

export default component;
