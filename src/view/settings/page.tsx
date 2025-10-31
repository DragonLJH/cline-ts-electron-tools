import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

const Settings: React.FC = () => {
    const store = useAppStore();

    return (
        <div className="p-5">
            <h1 className="text-gray-800 mb-5">设置</h1>

            <div className="mb-5">
                <Link
                    to="/"
                    className="inline-block px-4 py-2 bg-gray-600 text-white rounded no-underline transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                >
                    ← 返回主页
                </Link>
            </div>

            <div className="space-y-6">
                {/* 主题设置 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">主题设置</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">当前主题:</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                            {store.theme === 'light' ? '☀️ 浅色' : '🌙 深色'}
                        </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => store.setTheme('light')}
                            className={`px-4 py-2 rounded transition-colors ${
                                store.theme === 'light'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
                            }`}
                        >
                            浅色主题
                        </button>
                        <button
                            onClick={() => store.setTheme('dark')}
                            className={`px-4 py-2 rounded transition-colors ${
                                store.theme === 'dark'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-blue-100'
                            }`}
                        >
                            深色主题
                        </button>
                    </div>
                </div>

                {/* 计数器演示 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">计数器演示</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">当前计数:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-bold text-lg">
                            {store.count}
                        </span>
                    </div>
                    <div className="mt-3">
                        <button
                            onClick={store.increment}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                            增加计数
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                            点击按钮查看跨窗口状态同步。此计数器状态在所有窗口间共享。
                        </p>
                    </div>
                </div>

                {/* 其他设置 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">其他设置</h3>
                    <p className="text-gray-600">
                        更多设置功能即将到来。请通过左边侧边栏或顶部菜单访问其他页面。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
