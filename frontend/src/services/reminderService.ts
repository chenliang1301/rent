import api from './api';
import type { Reminder, PaginatedResponse } from '../types';
// 提醒管理API服务
export const reminderService = {
  // 触发租金提醒
  triggerReminders: async (): Promise<{ success: boolean; message: string; sentCount: number }> => {
    const response = await api.post('/reminders/trigger');
    return response.data.data;
  },

  // 获取提醒记录列表（支持分页和排序）
  getReminders: async (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<PaginatedResponse<Reminder>> => {
    const response = await api.get('/reminders', {
      params: { page, limit, sortBy, sortOrder }
    });
    // 从响应中提取正确的数据结构
    return response.data.data;
  },

  // 更新提醒状态
  updateReminderStatus: async (id: number, status: 'sent' | 'paid'): Promise<Reminder> => {
    const response = await api.put(`/reminders/${id}/status`, { status });
    return response.data.data;
  },

  // 获取待处理的提醒数量
  getPendingRemindersCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/reminders/pending/count');
    return response.data.data;
  },
};