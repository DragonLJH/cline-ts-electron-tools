import component from './page';

export const routeConfig = {
    path: '/form',
    name: 'form',
    title: '📝 表单演示',
    emoji: '📝',
    requiresAuth: false,
    layout: 'main',
    description: 'CustomForm组件的完整演示，展示各种表单字段和验证功能',
    keywords: ['表单', '演示', 'CustomForm', '验证', '组件'],
    windowMode: 'inline',
    singleWindow: false,
    showInMenu: true,
};

export default component;
