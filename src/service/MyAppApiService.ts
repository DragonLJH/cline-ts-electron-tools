import { BaseApiService } from './BaseApiService';
import { UserApiService } from './UserApiService';
import { RoleApiService } from './RoleApiService';
import { PermissionApiService } from './PermissionApiService';
import { AssignRolesRequest, AssignPermissionsRequest } from '../types';

/**
 * MyApp 主API服务类
 * 组合所有业务服务，提供统一的API访问接口
 */
export class MyAppApiService extends BaseApiService {
  public users: UserApiService;
  public roles: RoleApiService;
  public permissions: PermissionApiService;

  constructor(baseURL: string = '/myapp-api') {
    super(baseURL);

    // 初始化各个业务服务
    this.users = new UserApiService(baseURL);
    this.roles = new RoleApiService(baseURL);
    this.permissions = new PermissionApiService(baseURL);

    // 可以在这里为所有服务添加统一的拦截器
    this.setupInterceptors();
  }

  /**
   * 设置统一的拦截器
   */
  private setupInterceptors(): void {
    // 为所有服务添加统一的请求拦截器
    const services = [this.users, this.roles, this.permissions];
    services.forEach(service => {
      // 可以在这里添加统一的请求/响应拦截器
      // 例如：添加认证头、错误处理等
    });
  }

  /**
   * 为用户分配角色
   */
  async assignRolesToUser(request: AssignRolesRequest): Promise<any> {
    return this.post('/myapp/user-roles', request);
  }

  /**
   * 为角色分配权限
   */
  async assignPermissionsToRole(request: AssignPermissionsRequest): Promise<any> {
    return this.post('/myapp/role-permissions', request);
  }

  /**
   * 获取用户的角色列表
   */
  async getUserRoles(userId: number): Promise<any[]> {
    return this.get<any[]>(`/myapp/users/${userId}/roles`);
  }

  /**
   * 获取用户的权限列表
   */
  async getUserPermissions(userId: number): Promise<any[]> {
    return this.get<any[]>(`/myapp/users/${userId}/permissions`);
  }

  /**
   * 移除用户的角色
   */
  async removeRolesFromUser(userId: number, roleIds: number[]): Promise<any> {
    return this.delete('/myapp/user-roles', {
      body: JSON.stringify({ user_id: userId, role_ids: roleIds })
    });
  }

  /**
   * 移除角色的权限
   */
  async removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<any> {
    return this.delete('/myapp/role-permissions', {
      body: JSON.stringify({ role_id: roleId, permission_ids: permissionIds })
    });
  }
}
