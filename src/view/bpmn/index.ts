import component from './page';
import './index.scss';

// 页面路由配置信息
export const routeConfig = {
    path: '/bpmn',
    name: 'bpmn',
    title: 'BPMN 流程设计器',
    emoji: '🎯',
    requiresAuth: false,
    layout: 'main',
    windowMode: 'inline',
    singleWindow: false,
    description: '可视化 BPMN 流程图设计和编辑工具',
    keywords: ['BPMN', '流程设计', '工作流', '流程图', '工作流引擎']
};

export default component;
