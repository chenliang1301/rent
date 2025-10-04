import api from './api';
import type { Tenant, TenantCreateRequest, TenantUpdateRequest, PaginatedResponse } from '../types';
// 租户管理API服务
export const tenantService = {
  // 获取租户列表（支持分页和排序）
  getTenants: async (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<PaginatedResponse<Tenant>> => {
    const response = await api.get('/tenants', {
      params: { page, limit, sortBy, sortOrder }
    });
    // 返回正确嵌套的数据结构
    return response.data.data;
  },

  // 获取单个租户详情
  getTenantById: async (id: number): Promise<Tenant> => {
    const response = await api.get(`/tenants/${id}`);
    return response.data.data;
  },

  // 创建新租户
  createTenant: async (tenantData: TenantCreateRequest): Promise<Tenant> => {
    const response = await api.post('/tenants', tenantData);
    return response.data.data;
  },

  // 更新租户信息
  updateTenant: async (id: number, tenantData: TenantUpdateRequest): Promise<Tenant> => {
    const response = await api.put(`/tenants/${id}`, tenantData);
    return response.data.data;
  },

  // 删除租户
  deleteTenant: async (id: number): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },
};