import component from './page';
import './index.scss';

// 页面路由配置信息
export const routeConfig = {
  path: '/about',
  name: 'about',
  title: '关于',
  emoji: 'ℹ️',
  requiresAuth: false,
  layout: 'main',
  windowMode: 'popup' as const, // 关于页面可以作为子窗口打开
  singleWindow: false, // 允许多个关于页面
  description: '关于Electron应用程序，介绍技术和功能特性',
  keywords: ['关于', '技术栈', 'Electron', 'React', '应用介绍']
};

export default component;
