import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
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

    const handleGetAppVersion = async () => {
        if (electronAPI) {
            try {
                const version = await electronAPI.getAppVersion();
                alert(`应用版本: ${version}`);
            } catch (error) {
                console.error('获取版本失败:', error);
                alert('获取版本失败');
            }
        } else {
            alert('Electron API 未加载');
        }
    };

    const handleGetPlatform = () => {
        if (electronAPI) {
            const platform = electronAPI.getPlatform();
            alert(`平台: ${platform}`);
        } else {
            alert('Electron API 未加载');
        }
    };

    return (
        <div className="p-5 min-h-screen bg-gray-100 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2.5">主页</h1>
            <p className="text-center text-gray-600 text-base mb-5">欢迎使用Electron应用！</p>

            <div className="mt-5">
                <nav className="mb-5 flex gap-3.5">
                    <Link to="/windows" className="text-decoration-none py-2.5 px-3.75 bg-blue-600 text-white rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg">
                        窗口管理
                    </Link>
                    <Link to="/about" className="text-decoration-none py-2.5 px-3.75 bg-green-600 text-white rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg">
                        关于我们
                    </Link>
                </nav>

                <div className="flex flex-col gap-5 max-w-75">
                    <div className="action-group">
                        <h4 className="m-0 text-gray-700 text-sm font-semibold mb-2.5">打开子窗口：</h4>
                        <button onClick={() => handleOpenChildWindow('/')} className="py-2.5 px-2.5 border-none bg-blue-600 text-white text-sm rounded cursor-pointer transition-all duration-200 mr-0 mb-2.5 hover:opacity-90 hover:-translate-y-0.5">
                            🖼️ 打开主页窗口
                        </button>
                        <button onClick={() => handleOpenChildWindow('/windows')} className="py-2.5 px-2.5 border-none bg-cyan-600 text-white text-sm rounded cursor-pointer transition-all duration-200 mr-0 mb-2.5 hover:opacity-90 hover:-translate-y-0.5">
                            🖼️ 打开窗口管理窗口
                        </button>
                        <button onClick={() => handleOpenChildWindow('/about')} className="py-2.5 px-2.5 border-none bg-green-600 text-white text-sm rounded cursor-pointer transition-all duration-200 mr-0 mb-2.5 hover:opacity-90 hover:-translate-y-0.5">
                            🖼️ 打开关于页面窗口
                        </button>
                    </div>

                    <div className="action-group">
                        <h4 className="m-0 text-gray-700 text-sm font-semibold mb-2.5">系统信息：</h4>
                        <button onClick={handleGetAppVersion} className="py-2.5 px-2.5 border-none bg-gray-600 text-white text-sm rounded cursor-pointer transition-all duration-200 mr-0 mb-2.5 hover:opacity-90 hover:-translate-y-0.5">
                            获取应用版本
                        </button>
                        <button onClick={handleGetPlatform} className="py-2.5 px-2.5 border-none bg-orange-500 text-white text-sm rounded cursor-pointer transition-all duration-200 mr-0 mb-2.5 hover:opacity-90 hover:-translate-y-0.5">
                            获取平台信息
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
