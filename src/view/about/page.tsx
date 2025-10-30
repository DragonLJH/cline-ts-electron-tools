import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
    const electronAPI = (window as any).electronAPI;

    const handleOpenChildWindow = async (route: string) => {
        if (electronAPI) {
            try {
                const result = await electronAPI.openChildWindow(route);
                alert(`子窗口操作: ${result.message}`);
            } catch (error) {
                console.error('打开子窗口失败:', error);
                alert('打开子窗口失败');
            }
        } else {
            alert('Electron API 未加载');
        }
    };

    return (
        <div className="p-5">
            <h1 className="text-gray-800 mb-2.5">关于我们</h1>
            <p className="text-gray-600 text-base mb-5">这是一个基于Electron和React开发的桌面应用程序示例。</p>

            <div className="mb-5 flex gap-3.75">
                <Link to="/" className="text-decoration-none py-2.5 px-3.75 bg-gray-600 text-white rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg">
                    ← 返回主页
                </Link>
                <Link to="/windows" className="text-decoration-none py-2.5 px-3.75 bg-blue-600 text-white rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg">
                    窗口管理
                </Link>
            </div>

            <div>
                <div className="mb-7.5">
                    <h3 className="m-0 mb-3.75 text-gray-800 text-lg">技术栈：</h3>
                    <ul className="m-0 pl-5">
                        <li className="mb-2 text-gray-600"><strong className="text-blue-600">Electron:</strong> 用于创建跨平台桌面应用</li>
                        <li className="mb-2 text-gray-600"><strong className="text-blue-600">React:</strong> 用于构建用户界面</li>
                        <li className="mb-2 text-gray-600"><strong className="text-blue-600">TypeScript:</strong> 提供类型安全的开发体验</li>
                        <li className="mb-2 text-gray-600"><strong className="text-blue-600">React Router:</strong> 用于页面间的路由导航</li>
                        <li className="mb-2 text-gray-600"><strong className="text-blue-600">Preload Script:</strong> 安全地在渲染进程中暴露主进程API</li>
                        <li className="mb-2 text-gray-600"><strong className="text-blue-600">Webpack:</strong> 用于构建和打包应用程序</li>
                    </ul>
                </div>

                <div className="mb-7.5">
                    <h3 className="m-0 mb-3.75 text-gray-800 text-lg">试试子窗口功能：</h3>
                    <div className="flex gap-2.5 flex-wrap mt-2.5 mb-5">
                        <button onClick={() => handleOpenChildWindow('/')} className="py-2 px-3 border-none bg-blue-600 text-white text-sm rounded cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5">
                            🖼️ 主页窗口
                        </button>
                        <button onClick={() => handleOpenChildWindow('/windows')} className="py-2 px-3 border-none bg-cyan-600 text-white text-sm rounded cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5">
                            🖼️ 窗口管理窗口
                        </button>
                        <button onClick={() => handleOpenChildWindow('/about')} className="py-2 px-3 border-none bg-green-600 text-white text-sm rounded cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5">
                            🖼️ 关于页面窗口
                        </button>
                    </div>
                </div>

            <div className="feature-card">
                <h3>🎉 项目特点：</h3>
                <div className="feature-grid">
                    <div className="feature-item">
                        ✅ 多窗口支持
                    </div>
                    <div className="feature-item">
                        ✅ 安全IPC通信
                    </div>
                    <div className="feature-item">
                        ✅ React路由
                    </div>
                    <div className="feature-item">
                        ✅ TypeScript类型安全
                    </div>
                    <div className="feature-item">
                        ✅ 热重载开发
                    </div>
                    <div className="feature-item">
                        ✅ 自动编译
                    </div>
                </div>
            </div>

            <div className="route-table-card">
                <h3>📋 路由配置表：</h3>
                <div className="route-table-container">
                    <p><strong>总共路由：</strong> 6个 (包含子路由) | <strong>需要权限：</strong> 0个 | <strong>公开路由：</strong> 6个</p>
                    <p><strong>可用布局：</strong> main | <strong>窗口模式：</strong> 内嵌 1个 | <strong>弹窗：</strong> 5个</p>
                    <p><strong>单实例路由：</strong> 1个 | <strong>多实例路由：</strong> 5个</p>

                    <div className="table-responsive">
                        <table className="route-table">
                            <thead>
                                <tr>
                                    <th>路径</th>
                                    <th>名称</th>
                                    <th>标题</th>
                                    <th>窗口模式</th>
                                    <th>多实例</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>/</td>
                                    <td>home</td>
                                    <td>🏠 主页</td>
                                    <td className="window-mode inline">内嵌</td>
                                    <td>×</td>
                                    <td>Electron应用程序的主页，展示基本信息和系统功能</td>
                                </tr>
                                <tr>
                                    <td>/windows</td>
                                    <td>windows</td>
                                    <td>🖼️ 窗口管理</td>
                                    <td className="window-mode popup">弹窗</td>
                                    <td>✓</td>
                                    <td>测试和演示Electron窗口管理的各种功能，包括新窗口、子窗口、窗口状态控制等</td>
                                </tr>
                                <tr>
                                    <td>/windows/dashboard</td>
                                    <td>dashboard</td>
                                    <td>📊 仪表盘</td>
                                    <td className="window-mode popup">弹窗</td>
                                    <td>×</td>
                                    <td>窗口管理的仪表盘页面，显示各种统计信息和快速链接</td>
                                </tr>
                                <tr>
                                    <td>/windows/dashboard/analytics</td>
                                    <td>analytics</td>
                                    <td>📈 数据分析</td>
                                    <td className="window-mode popup">弹窗</td>
                                    <td>✓</td>
                                    <td>窗口管理的数据分析页面，显示详细的统计信息和趋势图表</td>
                                </tr>
                                <tr>
                                    <td>/windows/dashboard/reports</td>
                                    <td>reports</td>
                                    <td>📋 报告</td>
                                    <td className="window-mode popup">弹窗</td>
                                    <td>✓</td>
                                    <td>窗口管理系统的报告页面，提供各种详细报告和导出功能</td>
                                </tr>
                                <tr>
                                    <td>/about</td>
                                    <td>about</td>
                                    <td>ℹ️ 关于</td>
                                    <td className="window-mode popup">弹窗</td>
                                    <td>✓</td>
                                    <td>关于Electron应用程序，介绍技术和功能特性</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default About;
