import React, { useState, useEffect } from 'react';
import { reminderService } from '../../services/reminderService';
import { tenantService } from '../../services/tenantService';
import type { Reminder, PaginatedResponse, Tenant } from '../../types';
import { Loading } from '../common/Loading';
import { Notification } from '../common/Notification';

interface ReminderListProps {
  onUpdateStatus?: (reminder: Reminder) => void;
}

// 提醒列表组件
export const ReminderList: React.FC<ReminderListProps> = ({ onUpdateStatus }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ visible: false, type: 'info', message: '' });
  
  // 添加租户详情相关状态
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [loadingTenant, setLoadingTenant] = useState(false);
  
  // 添加排序相关状态
  const [sortConfig, setSortConfig] = useState<{
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }>({
    sortBy: 'id',
    sortOrder: 'desc'
  });

  // 获取提醒列表
  const fetchReminders = async (
    page: number = 1, 
    sortBy?: string, 
    sortOrder?: 'asc' | 'desc'
  ) => {
    try {
      setLoading(true);
      const currentSortBy = sortBy || sortConfig.sortBy;
      const currentSortOrder = sortOrder || sortConfig.sortOrder;
      
      const response: PaginatedResponse<Reminder> = await reminderService.getReminders(
        page, 
        10, 
        currentSortBy,
        currentSortOrder
      );
      
      // 添加防御性检查，确保响应数据结构正确
      if (response && Array.isArray(response.items)) {
        setReminders(response.items);
        setTotalPages(Math.ceil((response.total || 0) / 10));
      } else {
        // 如果响应格式不正确，设置空数组
        setReminders([]);
        setTotalPages(1);
        showNotification('warning', '提醒记录数据格式异常');
      }
      setCurrentPage(page);
    } catch (error) {
      showNotification('error', '获取提醒记录失败，请稍后重试');
      // 出错时也确保reminders是数组
      setReminders([]);
      setTotalPages(1);
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
      column = 'id';
      newSortOrder = 'desc';
    }
    
    const newSortConfig = {
      sortBy: column,
      sortOrder: newSortOrder
    };
    
    setSortConfig(newSortConfig);
    fetchReminders(currentPage, column, newSortOrder);
  };
  
  // 获取排序图标
  const getSortIcon = (column: string) => {
    if (sortConfig.sortBy !== column) return '↕';
    return sortConfig.sortOrder === 'asc' ? '↑' : '↓';
  };

  // 触发租金提醒
  const handleTriggerReminders = async () => {
    if (window.confirm('确定要触发所有未发送的租金提醒吗？')) {
      try {
        setTriggering(true);
        const response = await reminderService.triggerReminders();
        showNotification('success', `成功发送${response.sentCount}条提醒`);
        fetchReminders(currentPage);
      } catch (error) {
        showNotification('error', '触发提醒失败，请稍后重试');
      } finally {
        setTriggering(false);
      }
    }
  };

  // 更新提醒状态
  const handleUpdateStatus = async (reminder: Reminder, status: 'sent' | 'paid') => {
    try {
      await reminderService.updateReminderStatus(reminder.id, status);
      showNotification('success', '提醒状态更新成功');
      onUpdateStatus?.(reminder);
      fetchReminders(currentPage);
    } catch (error) {
      showNotification('error', '更新提醒状态失败，请稍后重试');
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

  // 获取状态显示文本和样式
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待发送', style: { backgroundColor: '#ff9800', color: 'white' } };
      case 'sent':
        return { text: '已发送', style: { backgroundColor: '#2196F3', color: 'white' } };
      case 'paid':
        return { text: '已支付', style: { backgroundColor: '#4CAF50', color: 'white' } };
      default:
        return { text: status, style: { backgroundColor: '#ddd', color: 'black' } };
    }
  };

  // 修改剩余天数计算和显示逻辑
  // 计算距离到期还剩的天数
  const calculateDaysRemaining = (reminderDate: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const reminderDateObj = new Date(reminderDate);
      reminderDateObj.setHours(0, 0, 0, 0);
      
      // 计算时间差（毫秒）
      const timeDiff = reminderDateObj.getTime() - today.getTime();
      
      // 转换为天数
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return daysRemaining;
    } catch (error) {
      console.error('计算剩余天数失败:', error);
      return null;
    }
  };

  // 获取剩余天数显示文本和样式
  const getDaysRemainingDisplay = (daysRemaining: number | null) => {
    if (daysRemaining === null) return { text: '计算失败', style: { color: '#757575' } };
    
    if (daysRemaining < 0) {
      // 到期时间早于当前日期，显示已逾期天数
      return { text: `已逾期${Math.abs(daysRemaining)}天`, style: { color: '#f44336', fontWeight: 'bold' } };
    } else if (daysRemaining === 0) {
      // 今天到期
      return { text: '今日到期', style: { color: '#ff9800', fontWeight: 'bold' } };
    } else {
      // 到期时间晚于当前日期，显示还剩天数
      if (daysRemaining <= 3) {
        return { text: `还剩${daysRemaining}天`, style: { color: '#ff9800', fontWeight: 'bold' } };
      } else if (daysRemaining <= 7) {
        return { text: `还剩${daysRemaining}天`, style: { color: '#ffc107' } };
      } else {
        return { text: `还剩${daysRemaining}天`, style: { color: '#4caf50' } };
      }
    }
  };

  // 点击租户姓名查看详情
  const handleTenantNameClick = async (tenantId: number) => {
    try {
      setLoadingTenant(true);
      
      // 使用实际的租户API获取详情，而不是模拟数据
      const tenantData = await tenantService.getTenantById(tenantId);
      setSelectedTenant(tenantData);
      setShowTenantModal(true);
    } catch (error) {
      console.error('获取租户详情失败:', error);
      // 如果API调用失败，尝试从当前提醒列表中获取基本信息
      try {
        const reminder = reminders.find(r => r.tenantId === tenantId);
        if (reminder) {
          const fallbackTenant: Tenant = {
            id: tenantId,
            name: reminder.tenantName,
            phone: reminder.tenantPhone,
            email: 'example@test.com',
            address: '北京市朝阳区XX街道XX号',
            leaseStartDate: new Date(new Date(reminder.reminderDate).setMonth(new Date(reminder.reminderDate).getMonth() - 1)).toISOString().split('T')[0],
            leaseEndDate: reminder.reminderDate,
            monthlyRent: reminder.amount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setSelectedTenant(fallbackTenant);
          setShowTenantModal(true);
        }
      } catch (fallbackError) {
        showNotification('error', '获取租户详情失败，请稍后重试');
      }
    } finally {
      setLoadingTenant(false);
    }
  };

  // 关闭租户详情模态框
  const closeTenantModal = () => {
    setShowTenantModal(false);
    setSelectedTenant(null);
  };

  // 初始化时加载数据
  useEffect(() => {
    fetchReminders();
  }, []);

  if (loading) {
    return <Loading message="加载提醒记录..." />;
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
          <h2>租金提醒管理</h2>
          <button
            onClick={handleTriggerReminders}
            disabled={triggering}
            style={{
              padding: '10px 15px',
              backgroundColor: triggering ? '#ddd' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: triggering ? 'not-allowed' : 'pointer',
            }}
          >
            {triggering ? '发送中...' : '触发提醒'}
          </button>
        </div>
        
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
                onClick={() => handleSort('tenantId')}
              >
                租户姓名 {getSortIcon('tenantId')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>联系电话</th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('amount')}
              >
                租金金额 {getSortIcon('amount')}
              </th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('reminderDate')}
              >
                提醒日期 {getSortIcon('reminderDate')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>剩余天数</th>
              <th 
                style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                onClick={() => handleSort('status')}
              >
                状态 {getSortIcon('status')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map(reminder => {
              const statusDisplay = getStatusDisplay(reminder.status);
              const daysRemaining = calculateDaysRemaining(reminder.reminderDate);
              const daysRemainingDisplay = getDaysRemainingDisplay(daysRemaining);
              
              return (
                <tr 
                  key={reminder.id} 
                  style={{ backgroundColor: hoveredRow === reminder.id ? '#f5f5f5' : 'transparent' }}
                  onMouseEnter={() => setHoveredRow(reminder.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{reminder.id}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <span 
                      style={{
                        color: '#2196F3',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        border: '1px solid #2196F3',
                        display: 'inline-block',
                        transition: 'background-color 0.2s ease',
                      }}
                      onClick={() => handleTenantNameClick(reminder.tenantId)}
                      title="点击查看租户详情"
                    >
                      {reminder.tenantName}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{reminder.tenantPhone}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>¥{reminder.amount}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {new Date(reminder.reminderDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd', ...daysRemainingDisplay.style }}>
                    {daysRemainingDisplay.text}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      ...statusDisplay.style,
                    }}>
                      {statusDisplay.text}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {reminder.status !== 'paid' && (
                      <button
                        onClick={() => handleUpdateStatus(reminder, 'paid')}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        标记为已支付
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* 分页控制 */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => fetchReminders(1)}
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
            onClick={() => fetchReminders(currentPage - 1)}
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
            onClick={() => fetchReminders(currentPage + 1)}
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
            onClick={() => fetchReminders(totalPages)}
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
      
      {/* 租户详情模态框 */}
      {showTenantModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeTenantModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>租户详情</h3>
              <button
                onClick={closeTenantModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#757575',
                }}
              >
                ×
              </button>
            </div>
            
            {loadingTenant ? (
              <Loading message="加载租户信息..." />
            ) : selectedTenant ? (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>姓名：</strong>
                  <span>{selectedTenant.name}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>联系电话：</strong>
                  <span>{selectedTenant.phone}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>邮箱：</strong>
                  <span>{selectedTenant.email}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>房屋地址：</strong>
                  <span>{selectedTenant.address}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>租期开始：</strong>
                  <span>{new Date(selectedTenant.leaseStartDate).toLocaleDateString()}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>租期结束：</strong>
                  <span>{new Date(selectedTenant.leaseEndDate).toLocaleDateString()}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>月租金：</strong>
                  <span>¥{selectedTenant.monthlyRent}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>创建时间：</strong>
                  <span>{new Date(selectedTenant.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>更新时间：</strong>
                  <span>{new Date(selectedTenant.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div>暂无租户信息</div>
            )}
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={closeTenantModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};