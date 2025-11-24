# Nginx代理配置使用指南

## 概述

本项目实现了类似Nginx的反向代理功能，支持通过环境变量配置多个后端服务的域名和路由转发，区分主进程和渲染进程的使用场景。

**技术栈更新**: 主进程使用 `got` (更好的Node.js HTTP客户端) 替换原来的 `axios`，渲染进程使用webpack proxy处理跨域请求。

## 环境变量配置

### .env文件配置

```bash
# ============ 代理配置 - Nginx风格反向代理 =============

# ============ API服务域名配置 ============
# 生产环境API域名
PROD_API_DOMAIN=https://api.example.com
PROD_BPMN_DOMAIN=https://bpmn.example.com
PROD_AUTH_DOMAIN=https://auth.example.com
PROD_FILE_DOMAIN=https://file.example.com

# ============ 开发环境代理目标配置 ============
# webpack proxy 代理目标
API_PROXY_TARGET=http://localhost:8080
BPMN_API_TARGET=http://localhost:8080/bpmn/v1
AUTH_API_TARGET=http://localhost:8081/auth
FILE_API_TARGET=http://localhost:8082/files

# 主进程代理目标
MAIN_API_TARGET=http://localhost:8080
MAIN_BPMN_TARGET=http://localhost:8080/bpmn/v1
MAIN_AUTH_TARGET=http://localhost:8081/auth
MAIN_FILE_TARGET=http://localhost:8082/files

# ============ 代理路由路径 ============
# webpack proxy 路径映射
PROXY_API_PATH=/api
PROXY_BPMN_PATH=/bpmn-api
PROXY_AUTH_PATH=/auth
PROXY_FILE_PATH=/files

# ============ SSL和安全配置 ============
# 是否验证SSL证书
VERIFY_SSL=true
# 代理超时时间（毫秒）
PROXY_TIMEOUT=30000
```

## 工作原理

### 开发环境
1. **webpack proxy**: 渲染进程请求被webpack开发服务器代理到对应后端服务
2. **主进程代理**: 直接使用ProxyManager类通过Node.js发起网络请求

### 生产环境
1. **执行环境配置**: 通过环境变量指定生产域名，直接调用生产服务
2. **主进程代理**: 使用生产环境域名发起请求

## 使用方式

### 1. 渲染进程使用（开发环境）

```javascript
// 通过webpack proxy，不写完整域名，直接使用路径
const apiClient = axios.create({
  baseURL: '/api',  // webpack proxy处理
  timeout: 10000
});

// 示例：获取BPMN配置
const bpmnConfigs = await apiClient.get('/bpmn/config');
```

### 2. 主进程使用（通过IPC）

```javascript
// 在主进程中要代理渲染进程请求，需在进ipcMain.handle中调用ProxyManager

// 示例：在渲染进程中调用
const { ipcRenderer } = require('electron');

// BPMN API调用
const bpmnResult = await ipcRenderer.invoke('proxy-request', {
  service: 'bpmn',  // ProxyServiceType.BPMN
  config: {
    method: 'GET',
    url: '/config/list'
  }
});

// 通用API调用
const apiResult = await ipcRenderer.invoke('proxy-api', {
  method: 'POST',
  url: '/users/login',
  data: { username: 'admin', password: '123456' }
});

// 认证API调用
const authResult = await ipcRenderer.invoke('proxy-auth-api', {
  method: 'GET',
  url: '/user/profile'
});
```

### 3. 主进程直接使用

```javascript
// 主进程中直接使用ProxyManager
import { getProxyManager, ProxyServiceType } from './utils/proxy-manager';

const proxyManager = getProxyManager();

// 直接API调用
const result = await proxyManager.proxyRequest(ProxyServiceType.BPMN, {
  method: 'GET',
  url: '/diagram/list'
});

// 健康检查
const healthStatus = await proxyManager.healthCheck();
console.log('Service health:', healthStatus);

// 获取代理配置
const config = proxyManager.getProxyConfig(ProxyServiceType.BPMN);
console.log('BPMN proxy config:', config);
```

## 配置说明

### 代理服务类型

- `API`: 通用API服务
- `BPMN`: BPMN流程相关API
- `AUTH`: 用户认证相关API
- `FILE`: 文件上传下载相关API

### 环境变量优先级

1. 生产环境：使用`PROD_*`环境变量指定的域名
2. 开发环境：
   - webpack proxy: 使用`*_API_TARGET`环境变量
   - 主进程代理: 使用`MAIN_*_TARGET`环境变量

### SSL配置

- `VERIFY_SSL=true`: 验证SSL证书（生产环境推荐）
- `VERIFY_SSL=false`: 跳过SSL验证（开发环境可用于自签名证书）

## 扩展配置

### 添加新服务类型

```javascript
// 1. 在enum中添加新类型
export enum ProxyServiceType {
  API = 'api',
  BPMN = 'bpmn',
  AUTH = 'auth',
  FILE = 'file',
  WEBSOCKET = 'websocket'  // 新增
}

// 2. 在.env中添加配置
WEBSOCKET_API_TARGET=wss://websocket.example.com

// 3. 在ProxyManager中初始化
this.proxyConfigs.set(ProxyServiceType.WEBSOCKET, {
  service: ProxyServiceType.WEBSOCKET,
  target: process.env.WEBSOCKET_API_TARGET || 'ws://localhost:8083',
  // ... 其他配置
});
```

### 自定义路径重写

```javascript
// 使用自定义路径重写
const result = await ipcRenderer.invoke('proxy-request', {
  service: 'api',
  config: { method: 'GET', url: '/v1/users/profile' },
  pathRewrite: {
    '^/v1': ''  // 移除路径中的/v1前缀
  }
});
```

## 故障排除

### 常见问题

1. **CORS错误**: 检查webpack proxy配置是否正确
2. **连接超时**: 检查后端服务是否启动，VERIFY_SSL配置是否正确
3. **路径不匹配**: 检查PROXY_*_PATH环境变量配置

### 调试模式

```bash
# 查看代理日志
tail -f logs/electron.log | grep "Proxy"

# 健康检查
const health = await ipcRenderer.invoke('proxy-health-check');
console.log('Proxy health:', health);
```

## 架构优势

1. **环境隔离**: 开发/生产环境自动切换配置
2. **进程分离**: 主进程和渲染进程使用不同代理策略
3. **可扩展性**: 易于添加新的代理服务
4. **安全性**: 主进程代理对敏感操作更有控制权
5. **性能优**: webpack代理避免了CORS预检请求
