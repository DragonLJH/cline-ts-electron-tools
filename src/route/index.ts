import React from 'react';

// 使用 require.context 动态读取 view 目录下的页面组件
// 注意：这个函数在 webpack 编译时会被解析，在运行时不可用
const viewContext = (require as any).context(
  '../view',
  true,
  /^\.\/.*\/index\.ts$/ // 匹配所有路径下的 index.ts 文件
);

// 获取页面名称的函数
const getPageNameFromPath = (path: string): string => {
  // 从路径中提取页面名称，例如: "./home/index.ts" -> "home"
  const pathParts = path.split('/');
  return pathParts[1]; // 第二个元素是页面名称
};

// 定义窗口模式类型
export type WindowMode = 'inline' | 'popup' | 'tab' | 'window';

// 定义路由配置接口
export interface RouteConfig {
  path: string;
  name: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  title: string;
  emoji: string;
  requiresAuth: boolean;
  layout: string;
  description: string;
  keywords: string[];
  windowMode?: WindowMode; // 窗口打开模式，默认为 'inline'
  singleWindow?: boolean; // 是否只允许单个窗口实例，默认为 false
  children?: RouteConfig[]; // 子路由配置
}

// 使用 require.context 获取并加载所有页面组件
const generateRoutes = (): RouteConfig[] => {
  const routes: RouteConfig[] = [];

  // 遍历所有匹配的文件
  viewContext.keys().forEach((key: string) => {
    try {
      const pageModule = viewContext(key);

      if (pageModule.default && pageModule.routeConfig) {
        const config = pageModule.routeConfig;

        routes.push({
          ...config, // 这里包含了path, name等完整配置
          component: React.lazy(() => Promise.resolve({ default: pageModule.default }))
        });
      } else {
        console.warn(`Page module ${key} missing default export or routeConfig`);
      }
    } catch (error) {
      console.warn(`Error loading page module: ${key}`, error);
    }
  });

  // 按路径排序，确保 home 路由（/）排在第一位
  return routes.sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return a.path.localeCompare(b.path);
  });
};

// 动态获取路由
export const routes: RouteConfig[] = generateRoutes();

// 递归获取所有路由（包括子路由）的函数
const getAllRoutes = (routes: RouteConfig[], currentPath = ''): RouteConfig[] => {
  const allRoutes: RouteConfig[] = [];

  routes.forEach(route => {
    // 为子路由构建完整的路径
    const fullPath = currentPath ? `${currentPath}${route.path}` : route.path;
    const routeWithFullPath = { ...route, path: fullPath };

    allRoutes.push(routeWithFullPath);

    if (route.children && route.children.length > 0) {
      allRoutes.push(...getAllRoutes(route.children, fullPath));
    }
  });

  return allRoutes;
};

// 获取所有路由（包括子路由）
const allRoutes = getAllRoutes(routes);

// 便捷的路由查询函数
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return allRoutes.find(route => route.path === path);
};

export const getAuthRoutes = (): RouteConfig[] => {
  return allRoutes.filter(route => route.requiresAuth);
};

export const getPublicRoutes = (): RouteConfig[] => {
  return allRoutes.filter(route => !route.requiresAuth);
};

// 窗口模式相关查询函数
export const getPopupWindowRoutes = (): RouteConfig[] => {
  return allRoutes.filter(route => route.windowMode === 'popup');
};

export const getInlineWindowRoutes = (): RouteConfig[] => {
  return allRoutes.filter(route => route.windowMode === 'inline');
};

export const getSingleWindowRoutes = (): RouteConfig[] => {
  return allRoutes.filter(route => route.singleWindow);
};

export const canOpenAsPopup = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route ? route.windowMode === 'popup' : false;
};

export const shouldOpenInNewWindow = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route ? route.windowMode === 'window' : false;
};

// 路由统计信息
export const routeStats = {
  total: allRoutes.length,
  authRequired: allRoutes.filter(r => r.requiresAuth).length,
  public: allRoutes.filter(r => !r.requiresAuth).length,
  layouts: [...new Set(allRoutes.map(r => r.layout))],
  windowModes: {
    inline: allRoutes.filter(r => r.windowMode === 'inline').length,
    popup: allRoutes.filter(r => r.windowMode === 'popup').length,
    tab: allRoutes.filter(r => r.windowMode === 'tab').length,
    window: allRoutes.filter(r => r.windowMode === 'window').length
  },
  singleWindowRoutes: allRoutes.filter(r => r.singleWindow).length,
  multiWindowRoutes: allRoutes.filter(r => !r.singleWindow).length
};

// 创建路由表显示用信息
export const routeTable = allRoutes.map(route => ({
  路径: route.path,
  名称: route.name,
  标题: route.title,
  图标: route.emoji,
  权限验证: route.requiresAuth ? '需要' : '公开',
  布局: route.layout,
  描述: route.description,
  关键词: route.keywords.join(', ')
}));
