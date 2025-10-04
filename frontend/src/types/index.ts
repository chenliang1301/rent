// 用户相关类型
export interface User {
  id: number;
  username: string;
  password?: string;
}

// 登录请求和响应类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// 租户相关类型
export interface Tenant {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCreateRequest {
  name: string;
  phone: string;
  email: string;
  address: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
}

export interface TenantUpdateRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
}

// 提醒相关类型
export interface Reminder {
  id: number;
  tenantId: number;
  tenantName: string;
  tenantPhone: string;
  roomNumber: string;
  amount: number;
  reminderDate: string;
  status: 'pending' | 'sent' | 'paid';
  createdAt: string;
}

// 分页相关类型
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  items: T[];
}

// 系统配置相关类型
export interface SystemConfig {
  configKey: string;
  configValue: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 配置更新请求类型
export interface ConfigUpdateRequest {
  configValue: string;
}

// 通用响应类型
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}