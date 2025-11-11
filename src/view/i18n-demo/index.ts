import I18nDemo from './page';
import './index.scss';

// 路由配置
export const routeConfig = {
  path: '/i18n-demo',
  name: 'i18n-demo',
  title: '国际化演示',
  emoji: '🌐',
  requiresAuth: false,
  layout: 'default',
  description: '展示语言切换和翻译功能的演示页面',
  keywords: ['i18n', '国际化', '翻译', '多语言', '演示'],
  windowMode: 'inline' as const,
  singleWindow: false,
  showInMenu: true,
};

export default I18nDemo;
