import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Form } from '@/components/Form';

// API基础URL - 使用代理路径
const API_BASE_URL = '/myapp-api';

// 数据类型定义
interface User {
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

interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

interface Permission {
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

// API服务类
class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 用户相关API
  static async getUsers(): Promise<User[]> {
    return this.request('/api/myapp/users');
  }

  static async createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<any> {
    return this.request('/api/myapp/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateUser(id: number, data: Partial<User>): Promise<any> {
    return this.request(`/api/myapp/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteUser(id: number): Promise<any> {
    return this.request(`/api/myapp/users/${id}`, {
      method: 'DELETE',
    });
  }

  static async batchDeleteUsers(ids: number[]): Promise<any> {
    return this.request('/api/myapp/users/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // 角色相关API
  static async getRoles(): Promise<Role[]> {
    return this.request('/api/myapp/roles');
  }

  static async createRole(data: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<any> {
    return this.request('/api/myapp/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateRole(id: number, data: Partial<Role>): Promise<any> {
    return this.request(`/api/myapp/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteRole(id: number): Promise<any> {
    return this.request(`/api/myapp/roles/${id}`, {
      method: 'DELETE',
    });
  }

  static async batchDeleteRoles(ids: number[]): Promise<any> {
    return this.request('/api/myapp/roles/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // 权限相关API
  static async getPermissions(): Promise<Permission[]> {
    return this.request('/api/myapp/permissions');
  }

  static async createPermission(data: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<any> {
    return this.request('/api/myapp/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updatePermission(id: number, data: Partial<Permission>): Promise<any> {
    return this.request(`/api/myapp/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deletePermission(id: number): Promise<any> {
    return this.request(`/api/myapp/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  static async batchDeletePermissions(ids: number[]): Promise<any> {
    return this.request('/api/myapp/permissions/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // 关联管理API
  static async assignRolesToUser(userId: number, roleIds: number[]): Promise<any> {
    return this.request('/api/myapp/user-roles', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role_ids: roleIds }),
    });
  }

  static async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<any> {
    return this.request('/api/myapp/role-permissions', {
      method: 'POST',
      body: JSON.stringify({ role_id: roleId, permission_ids: permissionIds }),
    });
  }
}

const FormPage: React.FC = () => {
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'user' | 'role' | 'permission' | 'assignment'>('demo');

  // 数据状态
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // 加载状态
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [editingItem, setEditingItem] = useState<{ type: string; id: number | null } | null>(null);

  // 使用 useMemo 稳定化 initialValues，避免每次渲染都创建新对象
  const initialValues = useMemo(() => ({
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25,
    gender: 'male',
    interests: ['programming', 'design'],
    education: 'bachelor',
    birthday: '1999-01-01',
    skills: 7,
    agree: true,
    bio: '我是一名热爱编程的开发工程师'
  }), []); // 空依赖数组，确保只创建一次

  // 配置化表单演示
  const handleConfigFormSubmit = (values: any) => {
    console.log('配置化表单数据:', values);
    setSubmitResult(values);
    setIsSubmitted(true);

    // 8秒后自动清除成功状态
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmitResult(null);
    }, 8000);
  };

  // 数据加载函数
  const loadData = useCallback(async (type: 'users' | 'roles' | 'permissions') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let data;
      switch (type) {
        case 'users':
          data = await ApiService.getUsers();
          setUsers(data);
          break;
        case 'roles':
          data = await ApiService.getRoles();
          setRoles(data);
          break;
        case 'permissions':
          data = await ApiService.getPermissions();
          setPermissions(data);
          break;
      }
    } catch (error) {
      console.error(`加载${type}失败:`, error);
      setSubmitResult({ type, error: error instanceof Error ? error.message : '加载失败' });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSubmitResult(null);
      }, 5000);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  // CRUD操作函数
  const handleCreate = useCallback(async (type: 'user' | 'role' | 'permission', values: any) => {
    setLoading(prev => ({ ...prev, [`create-${type}`]: true }));
    try {
      let result;
      switch (type) {
        case 'user':
          result = await ApiService.createUser(values);
          await loadData('users');
          break;
        case 'role':
          result = await ApiService.createRole(values);
          await loadData('roles');
          break;
        case 'permission':
          result = await ApiService.createPermission(values);
          await loadData('permissions');
          break;
      }

      setSubmitResult({ ...result, type: `${type}创建`, success: true });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSubmitResult(null);
      }, 5000);
    } catch (error) {
      console.error(`${type}创建失败:`, error);
      setSubmitResult({ type: `${type}创建`, error: error instanceof Error ? error.message : '创建失败' });
      setIsSubmitted(true);
    } finally {
      setLoading(prev => ({ ...prev, [`create-${type}`]: false }));
    }
  }, [loadData]);

  const handleUpdate = useCallback(async (type: 'user' | 'role' | 'permission', id: number, values: any) => {
    setLoading(prev => ({ ...prev, [`update-${type}-${id}`]: true }));
    try {
      let result;
      switch (type) {
        case 'user':
          result = await ApiService.updateUser(id, values);
          await loadData('users');
          break;
        case 'role':
          result = await ApiService.updateRole(id, values);
          await loadData('roles');
          break;
        case 'permission':
          result = await ApiService.updatePermission(id, values);
          await loadData('permissions');
          break;
      }

      setSubmitResult({ ...result, type: `${type}更新`, success: true });
      setIsSubmitted(true);
      setEditingItem(null);
      setTimeout(() => {
        setIsSubmitted(false);
        setSubmitResult(null);
      }, 5000);
    } catch (error) {
      console.error(`${type}更新失败:`, error);
      setSubmitResult({ type: `${type}更新`, error: error instanceof Error ? error.message : '更新失败' });
      setIsSubmitted(true);
    } finally {
      setLoading(prev => ({ ...prev, [`update-${type}-${id}`]: false }));
    }
  }, [loadData]);

  const handleDelete = useCallback(async (type: 'user' | 'role' | 'permission', id: number) => {
    if (!confirm(`确定要删除这个${type === 'user' ? '用户' : type === 'role' ? '角色' : '权限'}吗？`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [`delete-${type}-${id}`]: true }));
    try {
      switch (type) {
        case 'user':
          await ApiService.deleteUser(id);
          await loadData('users');
          break;
        case 'role':
          await ApiService.deleteRole(id);
          await loadData('roles');
          break;
        case 'permission':
          await ApiService.deletePermission(id);
          await loadData('permissions');
          break;
      }

      setSubmitResult({ type: `${type}删除`, success: true });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSubmitResult(null);
      }, 3000);
    } catch (error) {
      console.error(`${type}删除失败:`, error);
      setSubmitResult({ type: `${type}删除`, error: error instanceof Error ? error.message : '删除失败' });
      setIsSubmitted(true);
    } finally {
      setLoading(prev => ({ ...prev, [`delete-${type}-${id}`]: false }));
    }
  }, [loadData]);

  const handleBatchDelete = useCallback(async (type: 'user' | 'role' | 'permission', ids: number[]) => {
    if (!confirm(`确定要批量删除选中的${ids.length}个${type === 'user' ? '用户' : type === 'role' ? '角色' : '权限'}吗？`)) {
      return;
    }

    setLoading(prev => ({ ...prev, [`batch-delete-${type}`]: true }));
    try {
      switch (type) {
        case 'user':
          await ApiService.batchDeleteUsers(ids);
          await loadData('users');
          break;
        case 'role':
          await ApiService.batchDeleteRoles(ids);
          await loadData('roles');
          break;
        case 'permission':
          await ApiService.batchDeletePermissions(ids);
          await loadData('permissions');
          break;
      }

      setSubmitResult({ type: `${type}批量删除`, success: true, count: ids.length });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSubmitResult(null);
      }, 3000);
    } catch (error) {
      console.error(`${type}批量删除失败:`, error);
      setSubmitResult({ type: `${type}批量删除`, error: error instanceof Error ? error.message : '批量删除失败' });
      setIsSubmitted(true);
    } finally {
      setLoading(prev => ({ ...prev, [`batch-delete-${type}`]: false }));
    }
  }, [loadData]);

  // 编辑开始
  const startEdit = useCallback((type: string, item: any) => {
    setEditingItem({ type, id: item.id });
  }, []);

  // 编辑取消
  const cancelEdit = useCallback(() => {
    setEditingItem(null);
  }, []);

  // API 表单提交处理
  const handleAPISubmit = async (values: any, formType: string) => {
    console.log(`${formType}表单数据:`, values);

    try {
      // 这里可以调用实际的 API
      // const response = await fetch(`http://localhost:8000/api/myapp/${endpoint}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // });

      setSubmitResult({ ...values, formType, success: true });
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setSubmitResult(null);
      }, 8000);
    } catch (error) {
      console.error('API调用失败:', error);
      setSubmitResult({ ...values, formType, error: error instanceof Error ? error.message : '未知错误' });
      setIsSubmitted(true);
    }
  };

  const configFormFields = [
    {
      name: 'name',
      label: '姓名',
      type: 'input' as const,
      required: true,
      placeholder: '请输入您的姓名',
      validation: {
        minLength: { value: 2, message: '姓名至少2个字符' },
        maxLength: { value: 20, message: '姓名最多20个字符' }
      }
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'email' as const,
      required: true,
      placeholder: '请输入邮箱地址'
    },
    {
      name: 'age',
      label: '年龄',
      type: 'number' as const,
      required: true,
      min: 18,
      max: 120
    },
    {
      name: 'gender',
      label: '性别',
      type: 'radio' as const,
      required: true,
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' }
      ]
    },
    {
      name: 'interests',
      label: '兴趣爱好',
      type: 'checkbox' as const,
      multiple: true,
      options: [
        { label: '编程', value: 'programming' },
        { label: '设计', value: 'design' },
        { label: '音乐', value: 'music' },
        { label: '体育', value: 'sports' }
      ],
      max: 3,
      helperText: '可多选，最多3个'
    },
    {
      name: 'education',
      label: '学历',
      type: 'select' as const,
      required: true,
      placeholder: '请选择学历',
      options: [
        { label: '高中及以下', value: 'high_school' },
        { label: '大专', value: 'associate' },
        { label: '本科', value: 'bachelor' },
        { label: '硕士', value: 'master' },
        { label: '博士', value: 'doctor' }
      ]
    },
    {
      name: 'birthday',
      label: '出生日期',
      type: 'date' as const
    },
    {
      name: 'skills',
      label: '技能等级',
      type: 'range' as const,
      min: 1,
      max: 10,
      defaultValue: 5,
      step: 1,
      helperText: '滑动选择你的技能等级 (1-10)'
    },
    {
      name: 'agree',
      label: '同意协议',
      type: 'checkbox' as const,
      required: true,
      helperText: '必须同意协议才能提交'
    },
    {
      name: 'bio',
      label: '个人简介',
      type: 'textarea' as const,
      rows: 4,
      placeholder: '请简要介绍一下自己',
      validation: {
        maxLength: { value: 500, message: '个人简介最多500个字符' }
      },
      helperText: '最多500个字符 (可选)'
    }
  ];

  // 用户创建表单字段
  const userCreateFields = [
    {
      name: 'username',
      label: '用户名',
      type: 'input' as const,
      required: true,
      placeholder: '请输入用户名',
      validation: {
        maxLength: { value: 50, message: '用户名最多50个字符' }
      }
    },
    {
      name: 'password',
      label: '密码',
      type: 'password' as const,
      required: true,
      placeholder: '请输入密码',
      validation: {
        minLength: { value: 6, message: '密码至少6个字符' },
        maxLength: { value: 255, message: '密码最多255个字符' }
      }
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'email' as const,
      placeholder: '请输入邮箱地址'
    },
    {
      name: 'phone',
      label: '手机号',
      type: 'input' as const,
      placeholder: '请输入手机号',
      validation: {
        maxLength: { value: 20, message: '手机号最多20个字符' }
      }
    },
    {
      name: 'nickname',
      label: '昵称',
      type: 'input' as const,
      placeholder: '请输入昵称',
      validation: {
        maxLength: { value: 50, message: '昵称最多50个字符' }
      }
    },
    {
      name: 'real_name',
      label: '真实姓名',
      type: 'input' as const,
      placeholder: '请输入真实姓名',
      validation: {
        maxLength: { value: 50, message: '真实姓名最多50个字符' }
      }
    },
    {
      name: 'gender',
      label: '性别',
      type: 'radio' as const,
      options: [
        { label: '男', value: 1 },
        { label: '女', value: 2 }
      ]
    },
    {
      name: 'birthday',
      label: '生日',
      type: 'date' as const
    },
    {
      name: 'avatar',
      label: '头像URL',
      type: 'input' as const,
      placeholder: '请输入头像URL',
      validation: {
        maxLength: { value: 255, message: '头像URL最多255个字符' }
      }
    },
    {
      name: 'status',
      label: '状态',
      type: 'radio' as const,
      defaultValue: 1,
      options: [
        { label: '正常', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ];

  // 角色创建表单字段
  const roleCreateFields = [
    {
      name: 'name',
      label: '角色名称',
      type: 'input' as const,
      required: true,
      placeholder: '请输入角色名称',
      validation: {
        maxLength: { value: 50, message: '角色名称最多50个字符' }
      }
    },
    {
      name: 'code',
      label: '角色编码',
      type: 'input' as const,
      required: true,
      placeholder: '请输入角色编码',
      validation: {
        maxLength: { value: 50, message: '角色编码最多50个字符' }
      }
    },
    {
      name: 'description',
      label: '角色描述',
      type: 'textarea' as const,
      rows: 3,
      placeholder: '请输入角色描述',
      validation: {
        maxLength: { value: 255, message: '角色描述最多255个字符' }
      }
    },
    {
      name: 'status',
      label: '状态',
      type: 'radio' as const,
      defaultValue: 1,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ];

  // 权限创建表单字段
  const permissionCreateFields = [
    {
      name: 'name',
      label: '权限名称',
      type: 'input' as const,
      required: true,
      placeholder: '请输入权限名称',
      validation: {
        maxLength: { value: 50, message: '权限名称最多50个字符' }
      }
    },
    {
      name: 'code',
      label: '权限编码',
      type: 'input' as const,
      required: true,
      placeholder: '请输入权限编码',
      validation: {
        maxLength: { value: 100, message: '权限编码最多100个字符' }
      }
    },
    {
      name: 'type',
      label: '类型',
      type: 'select' as const,
      required: true,
      defaultValue: 1,
      options: [
        { label: '菜单', value: 1 },
        { label: '按钮', value: 2 },
        { label: '接口', value: 3 }
      ]
    },
    {
      name: 'parent_id',
      label: '父权限ID',
      type: 'number' as const,
      defaultValue: 0,
      min: 0,
      helperText: '默认为0表示根权限'
    },
    {
      name: 'path',
      label: '权限路径',
      type: 'input' as const,
      placeholder: '请输入权限路径',
      validation: {
        maxLength: { value: 255, message: '权限路径最多255个字符' }
      }
    },
    {
      name: 'method',
      label: '请求方法',
      type: 'select' as const,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ]
    },
    {
      name: 'description',
      label: '权限描述',
      type: 'textarea' as const,
      rows: 3,
      placeholder: '请输入权限描述',
      validation: {
        maxLength: { value: 255, message: '权限描述最多255个字符' }
      }
    },
    {
      name: 'status',
      label: '状态',
      type: 'radio' as const,
      defaultValue: 1,
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ];

  const tabs = [
    { key: 'demo', label: '演示表单', emoji: '📝' },
    { key: 'user', label: '用户管理', emoji: '👤' },
    { key: 'role', label: '角色管理', emoji: '👥' },
    { key: 'permission', label: '权限管理', emoji: '🔐' },
    { key: 'assignment', label: '关联管理', emoji: '🔗' }
  ];

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📋 MyApp 用户权限管理系统</h1>

      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {/* 演示表单标签页 */}
        {activeTab === 'demo' && (
          <>
            {/* 测试 initialValues 值的回填 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 测试 initialValues 值回填功能</h2>
              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  这个表单使用 initialValues 预填了一些数据，验证配置化表单是否能正确显示和修改初始值
                </p>
              </div>

              <Form
                fields={configFormFields}
                onSubmit={handleConfigFormSubmit}
                initialValues={{
                  name: '张三',
                  email: 'zhangsan@example.com',
                  age: 25,
                  gender: 'male',
                  interests: ['programming', 'design'],
                  education: 'bachelor',
                  birthday: '1999-01-01',
                  skills: 7,
                  agree: true,
                  bio: '我是一名热爱编程的开发工程师'
                }}
                gridColumns={2}
                gap="medium"
                submitButton={{
                  text: '提交测试数据',
                  color: 'success' as const
                }}
                validateOnSubmit={true}
                validateOnChange={false}
                validateOnBlur={true}
              />
            </div>

            {/* 新表单演示 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 全新表单（测试表单验证）</h2>
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  这个表单是全新的，没有预填数据，测试表单的默认状态和验证功能
                </p>
              </div>

              <Form
                fields={configFormFields}
                onSubmit={handleConfigFormSubmit}
                gridColumns={2}
                gap="medium"
                submitButton={{
                  text: '提交全新表单',
                  color: 'primary' as const
                }}
                resetButton={{
                  text: '重置表单',
                  color: 'secondary' as const
                }}
                validateOnSubmit={true}
                validateOnChange={false}
                validateOnBlur={true}
              />
            </div>
          </>
        )}

        {/* 用户管理标签页 */}
        {activeTab === 'user' && (
          <div className="space-y-6">
            {/* 用户列表 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">👤 用户列表</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadData('users')}
                    disabled={loading.users}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading.users ? '加载中...' : '刷新'}
                  </button>
                  {users.length > 0 && (
                    <button
                      onClick={() => {
                        const selectedIds = users.filter(u => u.status === 1).slice(0, 2).map(u => u.id);
                        if (selectedIds.length > 0) {
                          handleBatchDelete('user', selectedIds);
                        }
                      }}
                      disabled={loading['batch-delete-user']}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {loading['batch-delete-user'] ? '删除中...' : '批量删除'}
                    </button>
                  )}
                </div>
              </div>

              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">邮箱</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{user.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{user.username}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{user.email || '-'}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status === 1 ? '正常' : '禁用'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm space-x-2">
                            <button
                              onClick={() => startEdit('user', user)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete('user', user.id)}
                              disabled={loading[`delete-user-${user.id}`]}
                              className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                            >
                              {loading[`delete-user-${user.id}`] ? '删除中...' : '删除'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading.users ? '加载中...' : '暂无用户数据，点击刷新加载数据'}
                </div>
              )}
            </div>

            {/* 用户创建/编辑表单 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  👤 {editingItem?.type === 'user' ? '编辑用户' : '创建用户'}
                </h2>
                {editingItem?.type === 'user' && (
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    取消编辑
                  </button>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  {editingItem?.type === 'user' ? '修改用户信息' : '创建新用户账号，包含用户名、密码等基本信息'}
                </p>
              </div>

              <Form
                fields={editingItem?.type === 'user' ? userCreateFields.map(field => ({
                  ...field,
                  required: field.name !== 'password' // 编辑时密码不是必填的
                })) : userCreateFields}
                onSubmit={(values) => {
                  if (editingItem?.type === 'user' && editingItem.id) {
                    handleUpdate('user', editingItem.id, values);
                  } else {
                    handleCreate('user', values);
                  }
                }}
                initialValues={editingItem?.type === 'user' ?
                  users.find(u => u.id === editingItem.id) : undefined}
                gridColumns={2}
                gap="medium"
                submitButton={{
                  text: editingItem?.type === 'user' ? '更新用户' : '创建用户',
                  color: 'primary' as const,
                  loading: loading[`create-user`] || loading[`update-user-${editingItem?.id}`]
                }}
                resetButton={{
                  text: '重置',
                  color: 'secondary' as const
                }}
                validateOnSubmit={true}
                validateOnChange={false}
                validateOnBlur={true}
              />
            </div>
          </div>
        )}

        {/* 角色管理标签页 */}
        {activeTab === 'role' && (
          <div className="space-y-6">
            {/* 角色列表 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">👥 角色列表</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadData('roles')}
                    disabled={loading.roles}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading.roles ? '加载中...' : '刷新'}
                  </button>
                  {roles.length > 0 && (
                    <button
                      onClick={() => {
                        const selectedIds = roles.filter(r => r.status === 1).slice(0, 2).map(r => r.id);
                        if (selectedIds.length > 0) {
                          handleBatchDelete('role', selectedIds);
                        }
                      }}
                      disabled={loading['batch-delete-role']}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {loading['batch-delete-role'] ? '删除中...' : '批量删除'}
                    </button>
                  )}
                </div>
              </div>

              {roles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">角色名称</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">角色编码</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{role.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{role.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{role.code}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              role.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {role.status === 1 ? '启用' : '禁用'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(role.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm space-x-2">
                            <button
                              onClick={() => startEdit('role', role)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete('role', role.id)}
                              disabled={loading[`delete-role-${role.id}`]}
                              className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                            >
                              {loading[`delete-role-${role.id}`] ? '删除中...' : '删除'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading.roles ? '加载中...' : '暂无角色数据，点击刷新加载数据'}
                </div>
              )}
            </div>

            {/* 角色创建/编辑表单 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  👥 {editingItem?.type === 'role' ? '编辑角色' : '创建角色'}
                </h2>
                {editingItem?.type === 'role' && (
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    取消编辑
                  </button>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-md mb-4">
                <p className="text-sm text-green-800">
                  {editingItem?.type === 'role' ? '修改角色信息' : '创建新角色，定义角色名称、编码和权限范围'}
                </p>
              </div>

              <Form
                fields={roleCreateFields}
                onSubmit={(values) => {
                  if (editingItem?.type === 'role' && editingItem.id) {
                    handleUpdate('role', editingItem.id, values);
                  } else {
                    handleCreate('role', values);
                  }
                }}
                initialValues={editingItem?.type === 'role' ?
                  roles.find(r => r.id === editingItem.id) : undefined}
                gridColumns={2}
                gap="medium"
                submitButton={{
                  text: editingItem?.type === 'role' ? '更新角色' : '创建角色',
                  color: 'success' as const,
                  loading: loading[`create-role`] || loading[`update-role-${editingItem?.id}`]
                }}
                resetButton={{
                  text: '重置',
                  color: 'secondary' as const
                }}
                validateOnSubmit={true}
                validateOnChange={false}
                validateOnBlur={true}
              />
            </div>
          </div>
        )}

        {/* 权限管理标签页 */}
        {activeTab === 'permission' && (
          <div className="space-y-6">
            {/* 权限列表 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">🔐 权限列表</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadData('permissions')}
                    disabled={loading.permissions}
                    className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                  >
                    {loading.permissions ? '加载中...' : '刷新'}
                  </button>
                  {permissions.length > 0 && (
                    <button
                      onClick={() => {
                        const selectedIds = permissions.filter(p => p.status === 1).slice(0, 2).map(p => p.id);
                        if (selectedIds.length > 0) {
                          handleBatchDelete('permission', selectedIds);
                        }
                      }}
                      disabled={loading['batch-delete-permission']}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {loading['batch-delete-permission'] ? '删除中...' : '批量删除'}
                    </button>
                  )}
                </div>
              </div>

              {permissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">权限名称</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">权限编码</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permissions.map((permission) => (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{permission.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{permission.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{permission.code}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              permission.type === 1 ? 'bg-blue-100 text-blue-800' :
                              permission.type === 2 ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {permission.type === 1 ? '菜单' : permission.type === 2 ? '按钮' : '接口'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              permission.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {permission.status === 1 ? '启用' : '禁用'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(permission.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm space-x-2">
                            <button
                              onClick={() => startEdit('permission', permission)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete('permission', permission.id)}
                              disabled={loading[`delete-permission-${permission.id}`]}
                              className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                            >
                              {loading[`delete-permission-${permission.id}`] ? '删除中...' : '删除'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading.permissions ? '加载中...' : '暂无权限数据，点击刷新加载数据'}
                </div>
              )}
            </div>

            {/* 权限创建/编辑表单 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  🔐 {editingItem?.type === 'permission' ? '编辑权限' : '创建权限'}
                </h2>
                {editingItem?.type === 'permission' && (
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    取消编辑
                  </button>
                )}
              </div>

              <div className="bg-purple-50 p-4 rounded-md mb-4">
                <p className="text-sm text-purple-800">
                  {editingItem?.type === 'permission' ? '修改权限信息' : '创建新权限，定义权限名称、编码、类型和访问路径'}
                </p>
              </div>

              <Form
                fields={permissionCreateFields}
                onSubmit={(values) => {
                  if (editingItem?.type === 'permission' && editingItem.id) {
                    handleUpdate('permission', editingItem.id, values);
                  } else {
                    handleCreate('permission', values);
                  }
                }}
                initialValues={editingItem?.type === 'permission' ?
                  permissions.find(p => p.id === editingItem.id) : undefined}
                gridColumns={2}
                gap="medium"
                submitButton={{
                  text: editingItem?.type === 'permission' ? '更新权限' : '创建权限',
                  color: 'warning' as const,
                  loading: loading[`create-permission`] || loading[`update-permission-${editingItem?.id}`]
                }}
                resetButton={{
                  text: '重置',
                  color: 'secondary' as const
                }}
                validateOnSubmit={true}
                validateOnChange={false}
                validateOnBlur={true}
              />
            </div>
          </div>
        )}

        {/* 关联管理标签页 */}
        {activeTab === 'assignment' && (
          <div className="space-y-6">
            {/* 用户角色分配 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">👤🔗 用户角色分配</h2>
              <div className="bg-indigo-50 p-4 rounded-md mb-4">
                <p className="text-sm text-indigo-800">
                  为用户分配角色，支持为一个用户分配多个角色
                </p>
              </div>

              <Form
                fields={[
                  {
                    name: 'user_id',
                    label: '用户ID',
                    type: 'number' as const,
                    required: true,
                    min: 1,
                    placeholder: '请输入用户ID',
                    helperText: '用户ID必须是正整数'
                  },
                  {
                    name: 'role_ids',
                    label: '角色ID列表',
                    type: 'input' as const,
                    required: true,
                    placeholder: '请输入角色ID，用逗号分隔 (例如: 1,2,3)',
                    helperText: '多个角色ID用逗号分隔，至少选择一个角色',
                    validation: {
                      custom: {
                        validate: (value: string) => {
                          if (!value || value.trim() === '') return false;
                          const ids = value.split(',').map(id => id.trim());
                          return ids.every(id => /^\d+$/.test(id) && parseInt(id) > 0);
                        },
                        message: '角色ID格式不正确，请输入用逗号分隔的正整数'
                      }
                    }
                  }
                ]}
                onSubmit={(values) => {
                  // 转换字符串为数组
                  const processedValues = {
                    ...values,
                    role_ids: values.role_ids.split(',').map((id: string) => parseInt(id.trim()))
                  };
                  handleAPISubmit(processedValues, '用户角色分配');
                }}
                gridColumns={2}
                gap="medium"
                submitButton={{
                  text: '分配角色',
                  color: 'info' as const
                }}
                resetButton={{
                  text: '重置',
                  color: 'secondary' as const
                }}
                validateOnSubmit={true}
                validateOnChange={false}
                validateOnBlur={true}
              />
            </div>

            {/* 角色权限分配 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">👥🔗 角色权限分配</h2>
              <div className="bg-teal-50 p-4 rounded-md mb-4">
                <p className="text-sm text-teal-800">
                  为角色分配权限，支持为一个角色分配多个权限
                </p>
              </div>

              <Form
                fields={[
                  {
                    name: 'role_id',
                    label: '角色ID',
                    type: 'number' as const,
                    required: true,
                    min: 1,
                    placeholder: '请输入角色ID',
                    helperText: '角色ID必须是正整数'
                  },
                  {
                    name: 'permission_ids',
                    label: '权限ID列表',
                    type: 'input' as const,
                    required: true,
                    placeholder: '请输入权限ID，用逗号分隔 (例如: 1,2,3)',
                    helperText: '多个权限ID用逗号分隔，至少选择一个权限',
                    validation: {
                      custom: {
                        validate: (value: string) => {
                          if (!value || value.trim() === '') return false;
                          const ids = value.split(',').map(id => id.trim());
                          return ids.every(id => /^\d+$/.test(id) && parseInt(id) > 0);
                        },
                        message: '权限ID格式不正确，请输入用逗号分隔的正整数'
                      }
                    }
                  }
                ]}
                onSubmit={(values) => {
                  // 转换字符串为数组
                  const processedValues = {
                    ...values,
                    permission_ids: values.permission_ids.split(',').map((id: string) => parseInt(id.trim()))
                  };
                  handleAPISubmit(processedValues, '角色权限分配');
                }}
                gridColumns={2}
                gap="medium"
                submitButton={{
                  text: '分配权限',
                  color: 'success' as const
                }}
                resetButton={{
                  text: '重置',
                  color: 'secondary' as const
                }}
                validateOnSubmit={true}
                validateOnChange={false}
                validateOnBlur={true}
              />
            </div>
          </div>
        )}

        {/* 提交结果显示 */}
        {isSubmitted && submitResult && (
          <div className={`p-6 border rounded-lg ${submitResult.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                {submitResult.error ? (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {submitResult.error ? '操作失败' : '表单提交成功！'}
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  {submitResult.error ? `错误信息：${submitResult.error}` : '您的表单数据已成功提交，以下是提交的内容：'}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-md border overflow-auto">
              <h4 className="text-sm font-medium text-gray-800 mb-2">📋 提交的数据：</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(submitResult, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-green-600">此消息将在8秒后自动消失</span>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setSubmitResult(null);
                }}
                className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              >
                立即关闭
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-3">💡 支持的字段类型：</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">input - 文本输入</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">email - 邮箱输入</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">password - 密码</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">number - 数字</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded">textarea - 多行文本</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">select - 下拉选择</span>
            <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded">radio - 单选框</span>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">checkbox - 复选框</span>
            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded">file - 文件上传</span>
            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded">date - 日期选择</span>
            <span className="px-2 py-1 bg-lime-100 text-lime-700 rounded">range - 范围滑块</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h4 className="text-sm font-medium text-green-800 mb-2">✅ 验证规则：</h4>
          <div className="text-sm text-green-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">基础验证：</h5>
                <ul className="text-xs space-y-1">
                  <li>• required - 必填验证</li>
                  <li>• minLength/maxLength - 长度验证</li>
                  <li>• min/max - 数值范围</li>
                  <li>• pattern - 正则表达式</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">高级验证：</h5>
                <ul className="text-xs space-y-1">
                  <li>• custom - 自定义验证函数</li>
                  <li>• 异步验证支持</li>
                  <li>• 跨字段验证</li>
                  <li>• 实时错误反馈</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
