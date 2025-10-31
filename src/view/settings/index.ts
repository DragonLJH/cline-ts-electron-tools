import component from './page';
import './index.scss';

// 页面路由配置信息
export const routeConfig = {
  path: '/settings',
  name: 'settings',
  title: '设置',
  emoji: '⚙️',
  requiresAuth: false,
  layout: 'main',
  windowMode: 'inline',
  singleWindow: false,
  description: '应用程序的设置页面，配置主题、偏好等',
  keywords: ['设置', '配置', '主题']
};

export default component;
