import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { routes, RouteConfig } from './route';
import { CustomTitleBar } from './app-menu';

// 递归渲染路由的函数
const renderRoutes = (routes: RouteConfig[]): React.ReactNode => {
    return routes.map(route => {
        return (
            <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
            >
                {/* 渲染子路由 */}
                {route.children && route.children.length > 0 && renderRoutes(route.children)}
            </Route>
        );
    });
};

// 包装组件，用于处理路由导航
const AppContent: React.FC = () => {
    const navigate = useNavigate();

    // 检查是否为子窗口
    const urlParams = new URLSearchParams(window.location.search);
    const initialRoute = urlParams.get('initialRoute');
    const isChildWindow = !!initialRoute;

    useEffect(() => {
        // 如果是子窗口，有initialRoute则导航到对应路由
        if (initialRoute && window.location.pathname === '/') {
            navigate(initialRoute);
        }
    }, [initialRoute, navigate]);

    // 获取最顶层的路由（排除子路由）用于导航栏
    const topLevelRoutes = routes.filter(route => !route.path.includes('/'));

    return (
        <>
            {/* 只有主窗口才显示导航栏 */}
            {!isChildWindow && (
                <nav className="bg-white py-3.75 px-5 shadow shadow-gray-50 shadow-gray-900/10 shadow-gray-900/10 mb-5">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-5">
                            <h2 className="m-0 text-gray-800">Electron App</h2>
                            <div className="flex gap-2.5">
                                {topLevelRoutes.map(route => (
                                    <Link
                                        key={route.path}
                                        to={route.path}
                                        className={`text-decoration-none py-2 px-3.75 rounded transition-all duration-200 ${window.location.pathname === route.path
                                            ? 'text-white bg-blue-600 border-blue-600'
                                            : 'text-blue-600 border-gray-300'}`}
                                        style={{border: window.location.pathname === route.path ? '1px solid #2563eb' : '1px solid #dee2e6'}}
                                    >
                                        {route.emoji} {route.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* 主内容区域 */}
            <main className={`${!isChildWindow ? 'max-w-7xl mx-auto px-5' : 'p-5 min-h-screen'} ${isChildWindow ? 'bg-gray-100' : ''}`}>
                <Routes>
                    {/* 动态渲染嵌套路由 */}
                    {renderRoutes(routes)}

                    {/* 只有主窗口才添加重定向路由 */}
                    {!isChildWindow && (
                        <Route path="*" element={<Navigate to="/" replace />} />
                    )}
                </Routes>
            </main>
        </>
    );
};

// 主App组件
const App: React.FC = () => {
    return (
        <Router>
            <CustomTitleBar />
            <div className="min-h-screen bg-gray-100">
                <AppContent />
            </div>
        </Router>
    );
};

export default App;
