import React, { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import type { Tenant } from '../../types';
import { Loading } from '../common/Loading';
import { Notification } from '../common/Notification';
interface TenantDetailProps {
  tenantId: number;
  onBack: () => void;
  onEdit?: (tenant: Tenant) => void;
}

// 租户详情组件
export const TenantDetail: React.FC<TenantDetailProps> = ({ tenantId, onBack, onEdit }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ visible: false, type: 'info', message: '' });

  // 获取租户详情
  const fetchTenantDetail = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getTenantById(tenantId);
      setTenant(response);
    } catch (error) {
      showNotification('error', '获取租户详情失败，请稍后重试');
    } finally {
      setLoading(false);
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

  // 初始化时加载数据
  useEffect(() => {
    fetchTenantDetail();
  }, [tenantId]);

  if (loading) {
    return <Loading message="加载租户详情..." />;
  }

  if (!tenant) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>未找到租户信息</h3>
        <button
          onClick={onBack}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          返回列表
        </button>
      </div>
    );
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>租户详情</h2>
          <div>
            <button
              onClick={() => onEdit?.(tenant)}
              style={{
                padding: '8px 15px',
                marginRight: '10px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              编辑
            </button>
            <button
              onClick={onBack}
              style={{
                padding: '8px 15px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              返回列表
            </button>
          </div>
        </div>
        
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
        }}>
          <div style={{ marginBottom: '15px' }}>
            <h3>基本信息</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <strong>ID:</strong> {tenant.id}
            </div>
            <div>
              <strong>姓名:</strong> {tenant.name}
            </div>
            <div>
              <strong>联系电话:</strong> {tenant.phone}
            </div>
            <div>
              <strong>邮箱:</strong> {tenant.email}
            </div>
            <div>
              <strong>房屋地址:</strong> {tenant.address}
            </div>
            <div>
              <strong>月租金:</strong> ¥{tenant.monthlyRent}
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h3>租期信息</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <strong>租期开始:</strong> {new Date(tenant.leaseStartDate).toLocaleDateString()}
            </div>
            <div>
              <strong>租期结束:</strong> {new Date(tenant.leaseEndDate).toLocaleDateString()}
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h3>系统信息</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>创建时间:</strong> {new Date(tenant.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>更新时间:</strong> {new Date(tenant.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};