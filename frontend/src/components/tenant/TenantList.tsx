import React, { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import type { Tenant, PaginatedResponse } from '../../types';
import { Loading } from '../common/Loading';
import { Notification } from '../common/Notification';

interface TenantListProps {
  onEdit?: (tenant: Tenant) => void;
  onView?: (tenant: Tenant) => void;
}

// 租户列表组件
export const TenantList: React.FC<TenantListProps> = ({ onEdit, onView }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ visible: false, type: 'info', message: '' });
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  // 添加排序相关状态
  const [sortConfig, setSortConfig] = useState<{
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }>({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // 获取租户列表
  const fetchTenants = async (page: number = 1, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
    try {
      setLoading(true);
      const response: PaginatedResponse<Tenant> = await tenantService.getTenants(
        page, 
        10, 
        sortBy || sortConfig.sortBy, 
        sortOrder || sortConfig.sortOrder
      );
      console.log('Tenant API response:', response);
      // 添加安全检查，确保响应对象有正确的结构
      if (response && response.items) {
        setTenants(response.items);
        setTotalPages(response.total ? Math.ceil(response.total / 10) : 1);
        setCurrentPage(page);
      } else {
        setTenants([]);
        setTotalPages(1);
        setCurrentPage(1);
        showNotification('warning', '获取的数据结构不完整');
      }
    } catch (error) {
      console.error('获取租户列表失败:', error);
      setTenants([]);
      setTotalPages(1);
      setCurrentPage(1);
      showNotification('error', '获取租户列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理排序
  const handleSort = (column: string) => {
    let newSortOrder: 'asc' | 'desc' = 'asc';
    if (sortConfig.sortBy === column && sortConfig.sortOrder === 'asc') {
      newSortOrder = 'desc';
    } else if (sortConfig.sortBy === column && sortConfig.sortOrder === 'desc') {
      // 如果点击同一列两次，恢复默认排序
      column = 'created_at';
      newSortOrder = 'desc';
    }
    
    const newSortConfig = {
      sortBy: column,
      sortOrder: newSortOrder
    };
    
    setSortConfig(newSortConfig);
    fetchTenants(currentPage, column, newSortOrder);
  };

  // 删除租户
  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该租户吗？此操作不可撤销。')) {
      try {
        await tenantService.deleteTenant(id);
        showNotification('success', '租户删除成功');
        fetchTenants(currentPage);
      } catch (error) {
        showNotification('error', '删除租户失败，请稍后重试');
      }
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
    fetchTenants();
  }, []);

  // 获取排序图标
  const getSortIcon = (column: string) => {
    if (sortConfig.sortBy !== column) return '↕';
    return sortConfig.sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <Loading message="加载租户信息..." />;
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
        <h2 style={{ marginBottom: '20px' }}>租户管理</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('id')}
              >
                ID {getSortIcon('id')}
              </th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                姓名 {getSortIcon('name')}
              </th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('phone')}
              >
                联系电话 {getSortIcon('phone')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>邮箱</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>房屋地址</th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('lease_start_date')}
              >
                租期开始 {getSortIcon('lease_start_date')}
              </th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('lease_end_date')}
              >
                租期结束 {getSortIcon('lease_end_date')}
              </th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('rent_amount')}
              >
                月租金 {getSortIcon('rent_amount')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  暂无租户数据
                </td>
              </tr>
            ) : (
              tenants.map(tenant => (
                <tr 
                  key={tenant.id} 
                  style={{
                    backgroundColor: hoveredRow === tenant.id ? '#f5f5f5' : 'white'
                  }}
                  onMouseEnter={() => setHoveredRow(tenant.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{tenant.id}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{tenant.name}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{tenant.phone}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{tenant.email}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{tenant.address}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {new Date(tenant.leaseStartDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {new Date(tenant.leaseEndDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>¥{tenant.monthlyRent}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  <button
                    onClick={() => onEdit?.(tenant)}
                    style={{
                      padding: '5px 10px',
                      marginRight: '8px',
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
                    onClick={() => onView?.(tenant)}
                    style={{
                      padding: '5px 10px',
                      marginRight: '8px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    查看
                  </button>
                  <button
                    onClick={() => handleDelete(tenant.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    删除
                  </button>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* 分页控制 */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => fetchTenants(1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              margin: '0 5px',
              backgroundColor: currentPage === 1 ? '#ddd' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            首页
          </button>
          <button
            onClick={() => fetchTenants(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              margin: '0 5px',
              backgroundColor: currentPage === 1 ? '#ddd' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            上一页
          </button>
          <span style={{ padding: '8px 12px' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => fetchTenants(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              margin: '0 5px',
              backgroundColor: currentPage === totalPages ? '#ddd' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            下一页
          </button>
          <button
            onClick={() => fetchTenants(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              margin: '0 5px',
              backgroundColor: currentPage === totalPages ? '#ddd' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            末页
          </button>
        </div>
      </div>
    </div>
  );
};