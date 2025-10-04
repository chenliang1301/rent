import React, { useState, useEffect } from 'react';
import { configService } from '../../services/configService';
import type { SystemConfig } from '../../types';
import { Loading } from '../common/Loading';
import { Notification } from '../common/Notification';

// 系统配置管理组件
export const ConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdateing] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ visible: false, type: 'info', message: '' });

  // 获取所有配置项
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await configService.getAllConfigs();
      setConfigs(data);
    } catch (error) {
      showNotification('error', '获取配置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 开始编辑配置
  const handleEdit = (config: SystemConfig) => {
    setEditingKey(config.configKey);
    setEditValue(config.configValue);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  // 保存配置
  const handleSave = async (configKey: string) => {
    try {
      // 验证租金提醒天数必须是正整数
      if (configKey === 'rent_reminder_days') {
        const days = parseInt(editValue);
        if (isNaN(days) || days <= 0) {
          showNotification('error', '提醒天数必须是大于0的整数');
          return;
        }
      }

      setUpdateing(true);
      const updatedConfig = await configService.updateConfig(configKey, { configValue: editValue });
      
      // 更新本地配置列表
      setConfigs(prevConfigs => 
        prevConfigs.map(config => 
          config.configKey === configKey ? updatedConfig : config
        )
      );
      
      showNotification('success', '配置更新成功');
      setEditingKey(null);
      setEditValue('');
    } catch (error) {
      showNotification('error', '更新配置失败，请稍后重试');
    } finally {
      setUpdateing(false);
    }
  };

  // 显示通知
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ visible: true, type, message });
  };

  // 关闭通知
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  // 初始化时加载配置
  useEffect(() => {
    fetchConfigs();
  }, []);

  if (loading) {
    return <Loading message="加载系统配置..." />;
  }

  return (
    <div>
      {notification.visible && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>系统配置</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>配置项</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>配置值</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>描述</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {configs.map(config => (
              <tr key={config.configKey}>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{config.configKey}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  {editingKey === config.configKey ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{
                        padding: '5px',
                        width: '150px',
                      }}
                      placeholder="请输入配置值"
                    />
                  ) : (
                    config.configValue
                  )}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{config.description}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  {editingKey === config.configKey ? (
                    <>
                      <button
                        onClick={() => handleSave(config.configKey)}
                        disabled={updating}
                        style={{
                          padding: '5px 10px',
                          marginRight: '8px',
                          backgroundColor: updating ? '#ddd' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: updating ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {updating ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(config)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      编辑
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};