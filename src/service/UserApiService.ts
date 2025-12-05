import { BaseApiService } from './BaseApiService';
import { User, CreateData, UpdateData, BatchDeleteRequest } from '../types';

/**
 * 用户API服务类
 * 继承基础服务类，提供用户相关的所有API方法
 */
export class UserApiService extends BaseApiService {
  /**
   * 获取用户列表
   */
  async getUsers(): Promise<User[]> {
    return this.get<User[]>('/myapp/users');
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateData<User>): Promise<any> {
    return this.post('/myapp/users', data);
  }

  /**
   * 更新用户
   */
  async updateUser(id: number, data: UpdateData<User>): Promise<any> {
    return this.put(`/myapp/users/${id}`, data);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<any> {
    return this.delete(`/myapp/users/${id}`);
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(ids: number[]): Promise<any> {
    return this.post('/myapp/users/batch-delete', { ids } as BatchDeleteRequest);
  }

  /**
   * 根据ID获取用户详情
   */
  async getUserById(id: number): Promise<User> {
    return this.get<User>(`/myapp/users/${id}`);
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: number, status: number): Promise<any> {
    return this.patch(`/myapp/users/${id}/status`, { status });
  }

  /**
   * 重置用户密码
   */
  async resetUserPassword(id: number, newPassword: string): Promise<any> {
    return this.patch(`/myapp/users/${id}/password`, { password: newPassword });
  }
}
