import api from './api';
import type { SystemConfig, ConfigUpdateRequest } from '../types';

// 配置管理API服务
export const configService = {
  // 获取所有配置
  getAllConfigs: async (): Promise<SystemConfig[]> => {
    const response = await api.get('/config');
    const configs = response.data.data || [];
    // 转换后端数据格式为前端期望格式
    return configs.map((config: any) => ({
      configKey: config.key,
      configValue: config.value,
      description: config.description,
      createdAt: config.createdAt || new Date().toISOString(),
      updatedAt: config.updatedAt || new Date().toISOString()
    }));
  },

  // 获取单个配置
  getConfig: async (configKey: string): Promise<SystemConfig | null> => {
    const response = await api.get(`/config/${configKey}`);
    const configData = response.data.data;
    if (!configData) {
      return null;
    }
    // 转换后端数据格式为前端期望格式
    return {
      configKey: configData.key,
      configValue: configData.value,
      description: configData.description,
      createdAt: configData.createdAt || new Date().toISOString(),
      updatedAt: configData.updatedAt || new Date().toISOString()
    };
  },

  // 更新配置
  updateConfig: async (configKey: string, configData: { configValue: string }): Promise<SystemConfig> => {
    // 将前端格式转换为后端期望格式
    const request = { value: configData.configValue };
    const response = await api.put(`/config/${configKey}`, request);
    if (!response.data.data) {
      throw new Error('配置更新失败');
    }
    // 转换后端数据格式为前端期望格式
    const updatedData = response.data.data;
    return {
      configKey: updatedData.key,
      configValue: updatedData.value,
      description: updatedData.description,
      createdAt: updatedData.createdAt || new Date().toISOString(),
      updatedAt: updatedData.updatedAt || new Date().toISOString()
    };
  }
};