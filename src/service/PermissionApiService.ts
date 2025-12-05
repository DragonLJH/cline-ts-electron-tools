import { BaseApiService } from './BaseApiService';
import { Permission, CreateData, UpdateData, BatchDeleteRequest } from '../types';

/**
 * 权限API服务类
 * 继承基础服务类，提供权限相关的所有API方法
 */
export class PermissionApiService extends BaseApiService {
  /**
   * 获取权限列表
   */
  async getPermissions(): Promise<Permission[]> {
    return this.get<Permission[]>('/myapp/permissions');
  }

  /**
   * 创建权限
   */
  async createPermission(data: CreateData<Permission>): Promise<any> {
    return this.post('/myapp/permissions', data);
  }

  /**
   * 更新权限
   */
  async updatePermission(id: number, data: UpdateData<Permission>): Promise<any> {
    return this.put(`/myapp/permissions/${id}`, data);
  }

  /**
   * 删除权限
   */
  async deletePermission(id: number): Promise<any> {
    return this.delete(`/myapp/permissions/${id}`);
  }

  /**
   * 批量删除权限
   */
  async batchDeletePermissions(ids: number[]): Promise<any> {
    return this.post('/myapp/permissions/batch-delete', { ids } as BatchDeleteRequest);
  }

  /**
   * 根据ID获取权限详情
   */
  async getPermissionById(id: number): Promise<Permission> {
    return this.get<Permission>(`/myapp/permissions/${id}`);
  }

  /**
   * 更新权限状态
   */
  async updatePermissionStatus(id: number, status: number): Promise<any> {
    return this.patch(`/myapp/permissions/${id}/status`, { status });
  }

  /**
   * 获取权限树结构
   */
  async getPermissionTree(): Promise<Permission[]> {
    return this.get<Permission[]>('/myapp/permissions/tree');
  }

  /**
   * 获取子权限列表
   */
  async getChildPermissions(parentId: number): Promise<Permission[]> {
    return this.get<Permission[]>(`/myapp/permissions/children/${parentId}`);
  }

  /**
   * 批量更新权限状态
   */
  async batchUpdatePermissionStatus(ids: number[], status: number): Promise<any> {
    return this.patch('/myapp/permissions/batch-status', { ids, status });
  }
}
