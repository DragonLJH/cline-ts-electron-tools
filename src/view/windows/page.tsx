import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Windows: React.FC = () => {
    const electronAPI = (window as any).electronAPI;
    const [windowCount, setWindowCount] = useState(0);

    const handleOpenChildWindow = async (route: string = '/') => {
        if (electronAPI) {
            try {
                const result = await electronAPI.openChildWindow(route);
                console.log('打开子窗口结果:', result);
                setWindowCount(prev => prev + 1);
                alert(`子窗口操作: ${result.message} (总窗口数: ${windowCount + 1})`);
            } catch (error) {
                console.error('打开子窗口失败:', error);
                alert('打开子窗口失败');
            }
        } else {
            alert('Electron API 未加载');
        }
    };

    const handleCloseChildWindow = async () => {
        if (electronAPI) {
            try {
                const result = await electronAPI.closeChildWindow();
                console.log('关闭子窗口结果:', result);
                setWindowCount(prev => Math.max(0, prev - 1));
                alert(`子窗口操作: ${result.message}`);
            } catch (error) {
                console.error('关闭子窗口失败:', error);
                alert('关闭子窗口失败');
            }
        } else {
            alert('Electron API 未加载');
        }
    };

    const handleMinimizeWindow = () => {
        if (electronAPI) {
            electronAPI.minimizeWindow();
        } else {
            alert('Electron API 未加载');
        }
    };

    const handleMaximizeWindow = async () => {
        if (electronAPI) {
            const result = await electronAPI.maximizeWindow();
            console.log('窗口最大化结果:', result);
        } else {
            alert('Electron API 未加载');
        }
    };

    const handleCloseWindow = () => {
        if (electronAPI) {
            electronAPI.closeWindow();
        } else {
            alert('Electron API 未加载');
        }
    };

    return (
        <div className="p-5">
            <h1 className="text-gray-800 mb-2.5">窗口管理</h1>
            <p className="text-gray-600 text-base mb-5">测试Electron窗口管理的各种功能，包括子路由导航</p>

            <div className="mb-5">
                <Link to="/" className="text-decoration-none py-2.5 px-3.75 bg-gray-600 text-white rounded inline-block">
                    ← 返回主页
                </Link>
            </div>

            <div className="my-5">
                <p className="m-0 font-bold text-blue-600 text-base">当前打开的子窗口数量: {windowCount}</p>
            </div>

            {/* 基本窗口操作 */}
            <div className="mb-7.5">
                <h3 className="text-gray-800 mb-3.75 text-lg">🖼️ 基本窗口操作</h3>
                <div className="grid grid-cols-auto-fit gap-2.5 mt-2.5 mb-5">
                    <button onClick={() => handleOpenChildWindow('/')} className="py-2 px-3 border-none bg-blue-600 text-white text-sm rounded cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                        🖼️ 打开默认窗口
                    </button>

                    <button onClick={() => handleOpenChildWindow('/windows')} className="py-2 px-3 border-none bg-cyan-600 text-white text-sm rounded cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                        🖼️ 打开窗口管理窗口
                    </button>

                    <button onClick={() => handleOpenChildWindow('/about')} className="py-2 px-3 border-none bg-green-600 text-white text-sm rounded cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                        🖼️ 打开关于页面窗口
                    </button>

                    <button onClick={handleCloseChildWindow} className="py-2 px-3 border-none bg-red-600 text-white text-sm rounded cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                        ❌ 关闭子窗口
                    </button>
                </div>
            </div>

            {/* 子路由导航 */}
            <div className="mb-7.5">
                <h3 className="text-gray-800 mb-3.75 text-lg">📊 仪表盘子路由操作</h3>
                <div className="mt-2.5">
                    <div className="mb-5">
                        <h4 className="text-gray-600 m-0 mb-3.75 text-base border-b-2 border-blue-600 pb-1.25">📋 内页导航</h4>
                        <div className="flex flex-col gap-2.5 mt-2.5">
                            <Link to="dashboard" className="py-3 px-2.5 border-none bg-cyan-600 text-white text-base cursor-pointer rounded transition-all duration-200 flex items-center gap-2 text-decoration-none justify-start hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                                📊 进入仪表盘
                            </Link>
                            <Link to="dashboard/analytics" className="py-3 px-2.5 border-none bg-green-600 text-white text-base cursor-pointer rounded transition-all duration-200 flex items-center gap-2 text-decoration-none justify-start hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                                📈 进入数据分析
                            </Link>
                            <Link to="dashboard/reports" className="py-3 px-2.5 border-none bg-yellow-500 text-white text-base cursor-pointer rounded transition-all duration-200 flex items-center gap-2 text-decoration-none justify-start hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                                📋 进入报告
                            </Link>
                        </div>
                    </div>

                    <div className="mb-5">
                        <h4 className="text-gray-600 m-0 mb-3.75 text-base border-b-2 border-blue-600 pb-1.25">🪟 子窗口打开子路由</h4>
                        <div className="flex flex-col gap-2.5 mt-2.5">
                            <button onClick={() => handleOpenChildWindow('/windows/dashboard')} className="py-2 px-3 border-none bg-cyan-600 text-white text-sm cursor-pointer rounded transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                                📊 仪表盘子窗口
                            </button>
                            <button onClick={() => handleOpenChildWindow('/windows/dashboard/analytics')} className="py-2 px-3 border-none bg-green-600 text-white text-sm cursor-pointer rounded transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                                📈 数据分析子窗口
                            </button>
                            <button onClick={() => handleOpenChildWindow('/windows/dashboard/reports')} className="py-2 px-3 border-none bg-yellow-500 text-white text-sm cursor-pointer rounded transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                                📋 报告子窗口
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 当前窗口操作 */}
            <div className="mb-7.5">
                <h3 className="text-gray-800 mb-3.75 text-lg">⚡ 当前窗口控制</h3>
                <div className="grid grid-cols-auto-fit gap-2.5 mt-2.5 mb-5">
                    <button onClick={handleMinimizeWindow} className="py-2 px-3 border-none bg-green-600 text-white text-sm rounded cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                        📦 最小化窗口
                    </button>

                    <button onClick={handleMaximizeWindow} className="py-2 px-3 border-none bg-yellow-500 text-black text-sm rounded cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                        📐 最大化/恢复窗口
                    </button>

                    <button onClick={handleCloseWindow} className="py-2 px-3 border-none bg-gray-600 text-white text-sm rounded cursor-pointer transition-all duration-200 flex items-center gap-2 justify-center hover:opacity-90 hover:-translate-y-0.5 shadow-lghover:shadow-4px-8px-rgba(0,0,0,0.1)">
                        🚪 关闭窗口
                    </button>
                </div>
            </div>

            <div className="p-3.75 bg-gray-100 rounded">
                <h3 className="m-0 mb-2.5 text-gray-800 text-lg">💡 使用说明：</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div>
                        <h4 className="m-0 mb-2.5 text-gray-600 text-base">🖼️ 基本窗口操作</h4>
                        <ul className="m-0 pl-5">
                            <li className="mb-1 text-gray-600"><strong className="text-blue-600">打开子窗口：</strong>创建一个新的带有开发者工具的子窗口</li>
                            <li className="mb-1 text-gray-600"><strong className="text-blue-600">关闭子窗口：</strong>关闭最后打开的子窗口（LIFO方式）</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="m-0 mb-2.5 text-gray-600 text-base">📊 子路由操作</h4>
                        <ul className="m-0 pl-5">
                            <li className="mb-1 text-gray-600"><strong className="text-blue-600">内页导航：</strong>在当前窗口跳转到子路由页面</li>
                            <li className="mb-1 text-gray-600"><strong className="text-blue-600">子窗口打开：</strong>将子路由页面作为新窗口打开</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="m-0 mb-2.5 text-gray-600 text-base">⚡ 窗口控制</h4>
                        <ul className="m-0 pl-5">
                            <li className="mb-1 text-gray-600"><strong className="text-blue-600">最小化窗口：</strong>最小化当前窗口到任务栏</li>
                            <li className="mb-1 text-gray-600"><strong className="text-blue-600">最大化/恢复窗口：</strong>切换窗口最大化状态</li>
                            <li className="mb-1 text-gray-600"><strong className="text-blue-600">关闭窗口：</strong>完全关闭当前窗口</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Windows;
