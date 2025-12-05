# API 服务架构设计

## 📋 概述

本API服务架构采用面向对象的设计原则，将原本集中式的ApiService重构为模块化的服务体系。核心设计理念是"基础功能抽象化，业务逻辑模块化"，通过继承和组合模式实现代码复用和职责分离。

## 🎯 设计目标

1. **模块化**：将不同业务领域的API逻辑分离到独立的服务类中
2. **可复用性**：基础的HTTP请求逻辑统一管理，避免重复代码
3. **类型安全**：完整的TypeScript类型定义，提供良好的开发体验
4. **可扩展性**：易于添加新的API服务或修改现有功能
5. **可维护性**：清晰的代码结构，便于理解和维护

## 🏗️ 架构组成

```
src/service/
├── BaseApiService.ts      # 基础API服务类（抽象类）
├── UserApiService.ts      # 用户API服务类
├── RoleApiService.ts      # 角色API服务类
├── PermissionApiService.ts # 权限API服务类
├── MyAppApiService.ts     # 主API服务类（组合模式）
├── types.ts               # 服务相关类型定义
└── index.ts               # 统一导出文件
```

## 📝 实现思路

### 1. 分层架构设计

#### 基础服务层 (BaseApiService)
- **职责**：提供通用的HTTP请求方法和错误处理
- **设计模式**：模板方法模式 + 抽象类
- **核心功能**：
  - 统一的请求/响应拦截器机制
  - 自动错误处理和转换
  - 请求超时控制
  - 默认请求头管理

#### 业务服务层 (UserApiService, RoleApiService, PermissionApiService)
- **职责**：实现具体业务领域的API调用
- **设计模式**：继承 + 单一职责原则
- **特点**：
  - 每个服务类专注于一个业务领域
  - 继承基础服务的所有通用功能
  - 提供领域特定的API方法

#### 组合服务层 (MyAppApiService)
- **职责**：统一管理和协调所有业务服务
- **设计模式**：组合模式 + 外观模式
- **优势**：
  - 提供统一的访问接口
  - 便于服务间的交互
  - 支持跨服务的复杂操作

### 2. 核心设计原则

- **单一职责**：每个类只负责一个明确的功能
- **开闭原则**：对扩展开放，对修改封闭
- **依赖倒置**：高层模块不依赖低层模块，都依赖抽象
- **组合优于继承**：优先使用组合而非继承

## 🚀 实现步骤

### 步骤1：定义类型系统
```typescript
// src/types.ts - API数据类型
export interface User {
  id: number;
  username: string;
  // ... 其他字段
}

// src/service/types.ts - 服务相关类型
export interface RequestConfig extends RequestInit {
  timeout?: number;
}
```

### 步骤2：创建基础服务类
```typescript
export abstract class BaseApiService {
  protected async request<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    // 实现通用的HTTP请求逻辑
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  // POST, PUT, DELETE 等方法...
}
```

### 步骤3：创建业务服务类
```typescript
export class UserApiService extends BaseApiService {
  async getUsers(): Promise<User[]> {
    return this.get<User[]>('/myapp/users');
  }

  async createUser(data: CreateData<User>): Promise<any> {
    return this.post('/myapp/users', data);
  }
  // 其他用户相关方法...
}
```

### 步骤4：创建主服务类
```typescript
export class MyAppApiService extends BaseApiService {
  public users: UserApiService;
  public roles: RoleApiService;
  public permissions: PermissionApiService;

  constructor(baseURL: string = '/myapp-api') {
    super(baseURL);
    this.users = new UserApiService(baseURL);
    this.roles = new RoleApiService(baseURL);
    this.permissions = new PermissionApiService(baseURL);
  }
}
```

## 🔧 扩展方法

### 1. 添加新的业务服务
```typescript
// 新建业务服务类
export class ProductApiService extends BaseApiService {
  async getProducts(): Promise<Product[]> {
    return this.get<Product[]>('/products');
  }
}

// 在主服务中集成
export class MyAppApiService extends BaseApiService {
  public products: ProductApiService;

  constructor(baseURL: string = '/myapp-api') {
    super(baseURL);
    // ... 现有服务
    this.products = new ProductApiService(baseURL);
  }
}
```

### 2. 添加自定义拦截器
```typescript
const apiService = new MyAppApiService();

// 添加认证拦截器
apiService.addRequestInterceptor((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

// 添加响应拦截器
apiService.addResponseInterceptor((response, data) => {
  if (response.status === 401) {
    // 处理未授权情况
    redirectToLogin();
  }
  return data;
});
```

### 3. 支持不同的响应格式
```typescript
// 扩展基础服务支持XML或其他格式
export class BaseApiService {
  protected async request<T>(
    endpoint: string,
    config: RequestConfig & { responseType?: 'json' | 'xml' | 'text' } = {}
  ): Promise<T> {
    // 根据responseType处理不同的响应格式
  }
}
```

## ⚡ 优化建议

### 1. 缓存机制
```typescript
export class BaseApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();

  protected async get<T>(
    endpoint: string,
    config?: RequestConfig & { cache?: boolean; ttl?: number }
  ): Promise<T> {
    if (config?.cache) {
      const cached = this.cache.get(endpoint);
      if (cached && Date.now() - cached.timestamp < (config.ttl || 300000)) {
        return cached.data;
      }
    }

    const data = await this.request<T>(endpoint, config);

    if (config?.cache) {
      this.cache.set(endpoint, { data, timestamp: Date.now() });
    }

    return data;
  }
}
```

### 2. 请求去重
```typescript
export class BaseApiService {
  private pendingRequests = new Map<string, Promise<any>>();

  protected async request<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const key = `${config?.method || 'GET'}-${endpoint}`;

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = this.doRequest<T>(endpoint, config);
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }
}
```

### 3. 批量请求优化
```typescript
export class BaseApiService {
  protected async batchRequest<T>(
    requests: Array<{ endpoint: string; config?: RequestConfig }>
  ): Promise<T[]> {
    const promises = requests.map(({ endpoint, config }) =>
      this.request<T>(endpoint, config)
    );
    return Promise.all(promises);
  }
}
```

### 4. 重试机制
```typescript
export class BaseApiService {
  protected async request<T>(
    endpoint: string,
    config?: RequestConfig & { retry?: number; retryDelay?: number }
  ): Promise<T> {
    const { retry = 0, retryDelay = 1000, ...requestConfig } = config || {};

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        return await this.doRequest<T>(endpoint, requestConfig);
      } catch (error) {
        if (attempt < retry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          throw error;
        }
      }
    }
  }
}
```

## 📊 使用示例

### 基本使用
```typescript
import { MyAppApiService } from '@/service';

const apiService = new MyAppApiService();

// 获取用户列表
const users = await apiService.users.getUsers();

// 创建新用户
const newUser = await apiService.users.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'password123'
});

// 为用户分配角色
await apiService.assignRolesToUser({
  user_id: 1,
  role_ids: [1, 2, 3]
});
```

### 高级使用（带拦截器）
```typescript
const apiService = new MyAppApiService();

// 添加认证头
apiService.addRequestInterceptor((config) => ({
  ...config,
  headers: {
    ...config.headers,
    'Authorization': `Bearer ${getToken()}`
  }
}));

// 添加错误处理
apiService.addResponseInterceptor((response, data) => {
  if (response.status >= 400) {
    showErrorToast(data.message);
  }
  return data;
});
```

## 🎯 设计原则遵循

1. **单一职责原则**：每个服务类只负责一个业务领域
2. **开闭原则**：对扩展开放，对修改封闭
3. **依赖倒置原则**：高层模块不依赖低层模块，都依赖抽象
4. **组合优于继承**：使用组合模式组织复杂服务
5. **接口隔离原则**：提供细粒度的接口定义

## 🔍 测试建议

```typescript
// 单元测试示例
describe('UserApiService', () => {
  let service: UserApiService;

  beforeEach(() => {
    service = new UserApiService();
  });

  it('should get users', async () => {
    const mockUsers = [{ id: 1, username: 'test' }];
    // mock fetch
    const users = await service.getUsers();
    expect(users).toEqual(mockUsers);
  });
});
```

## 📈 性能优化

### 1. 连接池管理
- 对于频繁的API调用，可以考虑实现连接池
- 复用HTTP连接，减少握手开销

### 2. 智能缓存策略
- 实现LRU缓存算法
- 支持缓存失效和更新策略
- 考虑内存使用限制

### 3. 请求压缩
- 支持gzip压缩请求体
- 减少网络传输数据量

## 🛡️ 安全考虑

### 1. 请求签名
```typescript
// 添加请求签名拦截器
apiService.addRequestInterceptor((config) => {
  const signature = generateSignature(config.url, config.body);
  config.headers = {
    ...config.headers,
    'X-Signature': signature
  };
  return config;
});
```

### 2. 敏感数据处理
- 自动过滤敏感字段的日志输出
- 支持数据加密传输

## 🔄 版本管理

### API版本控制
```typescript
export class BaseApiService {
  constructor(baseURL: string = '/v1') {
    // 支持版本化API
  }
}
```

## 📚 最佳实践

1. **错误处理**：统一错误处理机制，避免try-catch散布
2. **日志记录**：详细的请求/响应日志，便于调试
3. **配置管理**：环境-specific配置分离
4. **文档生成**：自动生成API文档
5. **监控告警**：API调用监控和异常告警

这个架构设计提供了良好的基础，同时保持了足够的灵活性来应对未来的需求变化。通过分层设计和模块化组织，代码变得更加可维护和可扩展。
