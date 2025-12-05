import { BaseApiService } from './BaseApiService';
import { Role, CreateData, UpdateData, BatchDeleteRequest } from '../types';

/**
 * 角色API服务类
 * 继承基础服务类，提供角色相关的所有API方法
 */
export class RoleApiService extends BaseApiService {
  /**
   * 获取角色列表
   */
  async getRoles(): Promise<Role[]> {
    return this.get<Role[]>('/myapp/roles');
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateData<Role>): Promise<any> {
    return this.post('/myapp/roles', data);
  }

  /**
   * 更新角色
   */
  async updateRole(id: number, data: UpdateData<Role>): Promise<any> {
    return this.put(`/myapp/roles/${id}`, data);
  }

  /**
   * 删除角色
   */
  async deleteRole(id: number): Promise<any> {
    return this.delete(`/myapp/roles/${id}`);
  }

  /**
   * 批量删除角色
   */
  async batchDeleteRoles(ids: number[]): Promise<any> {
    return this.post('/myapp/roles/batch-delete', { ids } as BatchDeleteRequest);
  }

  /**
   * 根据ID获取角色详情
   */
  async getRoleById(id: number): Promise<Role> {
    return this.get<Role>(`/myapp/roles/${id}`);
  }

  /**
   * 更新角色状态
   */
  async updateRoleStatus(id: number, status: number): Promise<any> {
    return this.patch(`/myapp/roles/${id}/status`, { status });
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(roleId: number): Promise<any[]> {
    return this.get<any[]>(`/myapp/roles/${roleId}/permissions`);
  }

  /**
   * 为角色分配权限
   */
  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<any> {
    return this.post(`/myapp/role-permissions`, {
      role_id: roleId,
      permission_ids: permissionIds
    });
  }
}
