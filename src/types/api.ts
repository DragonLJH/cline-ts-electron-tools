// API 相关类型定义

// 用户接口
export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  nickname?: string;
  real_name?: string;
  gender?: number;
  birthday?: string;
  avatar?: string;
  status: number;
  is_deleted: number;
  last_login_time?: string;
  last_login_ip?: string;
  created_at: string;
  updated_at: string;
}

// 角色接口
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// 权限接口
export interface Permission {
  id: number;
  name: string;
  code: string;
  type: number;
  parent_id: number;
  path?: string;
  method?: string;
  description?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// API 响应基础接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应接口
export interface PaginatedResponse<T> extends ApiResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// CRUD 操作基础类型
export type CreateData<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateData<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// 批量删除请求
export interface BatchDeleteRequest {
  ids: number[];
}

// 关联管理请求
export interface AssignRolesRequest {
  user_id: number;
  role_ids: number[];
}

export interface AssignPermissionsRequest {
  role_id: number;
  permission_ids: number[];
}
