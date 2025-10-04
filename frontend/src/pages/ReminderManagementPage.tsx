import React from 'react';
import { ReminderList } from '../components/reminder/ReminderList';
import type { Reminder } from '../types';
// 提醒管理页面
export const ReminderManagementPage: React.FC = () => {
  // 处理提醒状态更新
  const handleUpdateStatus = (reminder: Reminder) => {
    // 可以在这里添加额外的处理逻辑，比如刷新相关数据等
    console.log('提醒状态已更新:', reminder);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>租金提醒管理</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        此页面用于管理租金提醒，您可以查看所有提醒记录并触发新的提醒通知。
      </p>
      <ReminderList onUpdateStatus={handleUpdateStatus} />
    </div>
  );
};