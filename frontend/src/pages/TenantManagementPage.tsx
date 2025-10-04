import React, { useState } from 'react';
import { TenantList } from '../components/tenant/TenantList';
import { TenantForm } from '../components/tenant/TenantForm';
import { TenantDetail } from '../components/tenant/TenantDetail';
import { tenantService } from '../services/tenantService';
import type { Tenant } from '../types';
import { Notification } from '../components/common/Notification';// 租户管理页面
export const TenantManagementPage: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ visible: false, type: 'info', message: '' });

  // 显示通知
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ visible: true, type, message });
  };

  // 关闭通知
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  // 处理添加租户
  const handleAddTenant = () => {
    setSelectedTenant(null);
    setMode('add');
  };

  // 处理编辑租户
  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setMode('edit');
  };

  // 处理查看租户详情
  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setMode('view');
  };

  // 处理返回列表
  const handleBackToList = () => {
    setMode('list');
    setSelectedTenant(null);
  };

  // 处理表单提交（添加/编辑）
  const handleFormSubmit = async (tenant: Tenant) => {
    try {
      if (mode === 'add') {
        await tenantService.createTenant(tenant);
        showNotification('success', '租户添加成功');
      } else {
        await tenantService.updateTenant(tenant.id, tenant);
        showNotification('success', '租户信息更新成功');
      }
      setMode('list');
    } catch (error) {
      showNotification('error', mode === 'add' ? '添加租户失败' : '更新租户信息失败');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {notification.visible && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      {mode === 'list' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>租户管理</h1>
            <button
              onClick={handleAddTenant}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              添加租户
            </button>
          </div>
          <TenantList
            onEdit={handleEditTenant}
            onView={handleViewTenant}
          />
        </div>
      )}

      {(mode === 'add' || mode === 'edit') && (
        <div>
          <button
            onClick={handleBackToList}
            style={{
              padding: '8px 15px',
              marginBottom: '20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            返回列表
          </button>
          <TenantForm
            tenant={mode === 'edit' ? selectedTenant : null}
            onSubmit={handleFormSubmit}
            onCancel={handleBackToList}
          />
        </div>
      )}

      {mode === 'view' && selectedTenant && (
        <TenantDetail
          tenantId={selectedTenant.id}
          onBack={handleBackToList}
          onEdit={handleEditTenant}
        />
      )}
    </div>
  );
};