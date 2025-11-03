import component from './page';
import './index.scss';

// 页面路由配置信息
export const routeConfig = {
    path: '/form',
    name: 'form',
    title: '表单展示',
    emoji: '📝',
    requiresAuth: false,
    layout: 'main',
    windowMode: 'inline',
    singleWindow: false,
    description: '展示自定义输入框组件的功能和使用方法',
    keywords: ['表单', '输入框', 'Input', '组件展示']
};

export default component;
