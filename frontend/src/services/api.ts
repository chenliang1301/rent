import axios from 'axios';
import type { LoginResponse } from '../types';
// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误，清除token并重定向到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 认证相关API
export const authService = {
  // 用户登录
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      console.log('发送登录请求到/auth/login:', { username });
      // 由于baseURL已配置为/api，这里使用相对路径即可
      const response = await api.post<any>('/auth/login', { username, password });
      console.log('登录响应:', response.data);
      
      // 保存token和用户信息到localStorage
      if (response.data && response.data.data && response.data.data.access_token) {
        localStorage.setItem('token', response.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // 返回登录响应数据
        return response.data.data as LoginResponse;
      } else {
        throw new Error(response.data?.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误详情:', error);
      throw new Error(error.response?.data?.message || error.message || '登录失败，请检查网络连接');
    }
  },

  // 用户登出
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 获取当前用户信息
  getCurrentUser: (): any => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 检查是否已登录
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

// 导出api实例供其他服务使用
export default api;