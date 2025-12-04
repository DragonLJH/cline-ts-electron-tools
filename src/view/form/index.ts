import component from './page';
import './index.scss';

// 页面路由配置信息
export const routeConfig = {
    path: '/form',
    name: 'form',
    title: 'MyApp 用户权限管理系统',
    emoji: '📋',
    requiresAuth: false,
    layout: 'main',
    windowMode: 'inline',
    singleWindow: false,
    description: '基于 FastAPI 的用户权限管理系统表单界面',
    keywords: ['用户管理', '角色管理', '权限管理', '表单', 'API']
};

export default component;
