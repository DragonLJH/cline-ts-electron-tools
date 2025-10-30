import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Dashboard: React.FC = () => {
    return (
        <div className="p-5">
            <h2 className="text-gray-800 mb-2.5">仪表盘</h2>
            <p className="text-gray-600 text-base mb-5">这是窗口管理的仪表盘页面</p>

            <div className="mb-5 flex gap-2.5 flex-wrap">
                <Link to={' '} className="text-decoration-none py-2 px-3.75 bg-gray-600 text-white rounded transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5">
                    ← 返回窗口管理
                </Link>
                <Link to="analytics" className="text-decoration-none py-2 px-3.75 bg-blue-600 text-white rounded transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5">
                    数据分析
                </Link>
                <Link to="reports" className="text-decoration-none py-2 px-3.75 bg-blue-600 text-white rounded transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5">
                    报告
                </Link>
            </div>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-7.5">
                    <div className="bg-white border border-gray-300 rounded-lg p-5 text-center shadow shadow-gray-900/10 shadow-gray-900/1">
                        <h3 className="m-0 mb-3.75 text-gray-800 text-base">🖼️ 当前窗口数</h3>
                        <div className="text-4xl font-bold text-blue-600 mb-1.25">3</div>
                        <p className="m-0 text-gray-600 text-sm">活动窗口数量</p>
                    </div>
                    <div className="bg-white border border-gray-300 rounded-lg p-5 text-center shadow shadow-gray-900/10 shadow-gray-900/1">
                        <h3 className="m-0 mb-3.75 text-gray-800 text-base">📊 总操作次数</h3>
                        <div className="text-4xl font-bold text-blue-600 mb-1.25">27</div>
                        <p className="m-0 text-gray-600 text-sm">窗口management操作</p>
                    </div>
                    <div className="bg-white border border-gray-300 rounded-lg p-5 text-center shadow shadow-gray-900/10 shadow-gray-900/1">
                        <h3 className="m-0 mb-3.75 text-gray-800 text-base">⚡ 内存使用</h3>
                        <div className="text-4xl font-bold text-blue-600 mb-1.25">42MB</div>
                        <p className="m-0 text-gray-600 text-sm">应用程序内存</p>
                    </div>
                </div>

                {/* 子路由内容渲染区域 */}
                <div className="border border-gray-300 rounded-lg p-5 min-h-50 bg-gray-100 text-gray-600 italic">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
