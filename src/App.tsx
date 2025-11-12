import React, { useEffect, useRef, forwardRef, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { routes, RouteConfig } from '@/route';
import { CustomTitleBar } from '@/app-menu';

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
const AppContent = forwardRef<HTMLDivElement>(({ }, ref) => {
    const navigate = useNavigate();
    const location = useLocation();

    // 检查是否为子窗口
    const urlParams = new URLSearchParams(window.location.search);
    const initialRoute = urlParams.get('initialRoute');
    const isChildWindow = !!initialRoute || location.state?.isChildWindow;

    useEffect(() => {
        // 如果是子窗口，有initialRoute则导航到对应路由
        if (initialRoute && window.location.pathname === '/') {
            navigate(initialRoute, { replace: true, state: { isChildWindow: true } });
        }
    }, [initialRoute, navigate]);

    // 获取顶级路由用于侧边栏菜单，只显示配置允许的
    const menuRoutes = routes.filter(route => (route.path === '/' || route.path.split('/').length === 2) && route.showInMenu !== false);

    return (
        <div className="app-content flex flex-1 bg-gray-100 h-full" ref={ref}>
            {/* 只有主窗口才显示侧边栏菜单 */}
            {!isChildWindow && (
                <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Electron App</h2>
                        <nav className="space-y-2">
                            {menuRoutes.map(route => (
                                <Link
                                    key={route.path}
                                    to={route.path}
                                    className={`block px-4 py-3 rounded-lg transition-all duration-200 no-underline ${location.pathname === route.path
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{route.emoji}</span>
                                        <span className="font-medium">{route.title}</span>
                                    </div>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>
            )}

            {/* 主内容区域 */}
            <main className={`overflow-y-auto ${!isChildWindow ? 'flex-1 ' : 'w-full '} ${isChildWindow ? 'bg-gray-100' : ''}`}>
                <div className={`${!isChildWindow ? 'p-6' : 'p-5'} min-h-0`}>
                    <Routes>
                        {/* 动态渲染嵌套路由 */}
                        {renderRoutes(routes)}
                        {/* 只有主窗口才添加重定向路由 */}
                        {!isChildWindow && (
                            <Route path="*" element={<Navigate to="/" replace />} />
                        )}
                    </Routes>
                </div>
            </main>
        </div>
    );
});

// 主App组件
const App: React.FC = () => {
    const customTitleBarRef = useRef<HTMLDivElement>(null);
    const appContentRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({})

    useEffect(() => {
        if (customTitleBarRef?.current) {
            const { scrollHeight } = customTitleBarRef.current
            const { height } = customTitleBarRef.current.getBoundingClientRect()
            setStyle({ '--custom-title-bar-height': `${height || scrollHeight}px` })
        }

    }, [customTitleBarRef?.current,
    appContentRef?.current])
    return (
        <Router>
            <div className="app flex flex-col h-screen" style={style as React.CSSProperties}>
                <CustomTitleBar ref={customTitleBarRef} />
                <AppContent ref={appContentRef} />
            </div>
        </Router>
    );
};

export default App;
