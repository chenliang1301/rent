import React from 'react';
import { ConfigManager } from '../components/config/ConfigManager';

// 配置管理页面
export const ConfigManagementPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <ConfigManager />
    </div>
  );
};