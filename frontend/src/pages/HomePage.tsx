import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reminderService } from '../services/reminderService';
// 主页组件
export const HomePage: React.FC = () => {
  const [pendingReminders, setPendingReminders] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const navigate = useNavigate();

  // 获取待处理的提醒数量
  useEffect(() => {
    const fetchPendingReminders = async () => {
      try {
        const response = await reminderService.getPendingRemindersCount();
        setPendingReminders(response.count);
      } catch (error) {
        console.error('获取待处理提醒数量失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReminders();
  }, []);

  // 导航到租户管理页面
  const handleNavigateToTenants = () => {
    navigate('/tenants');
  };

  // 导航到提醒管理页面
  const handleNavigateToReminders = () => {
    navigate('/reminders');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>欢迎使用租金管理系统</h1>
      <p style={{ marginBottom: '30px', color: '#666', fontSize: '16px' }}>
        本系统帮助您高效管理租户信息和租金提醒，确保租金及时收取。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* 租户管理卡片 */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: hoveredCard === 'tenants' ? 'translateY(-5px)' : 'none',
          boxShadow: hoveredCard === 'tenants' ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
        }}
        onClick={handleNavigateToTenants}
        onMouseEnter={() => setHoveredCard('tenants')}
        onMouseLeave={() => setHoveredCard(null)}
        >
          <h2 style={{ color: '#2196F3', marginBottom: '10px' }}>租户管理</h2>
          <p>管理所有租户信息，包括添加、编辑、查看和删除租户记录。</p>
        </div>

        {/* 提醒管理卡片 */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: hoveredCard === 'reminders' ? 'translateY(-5px)' : 'none',
          boxShadow: hoveredCard === 'reminders' ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
        }}
        onClick={handleNavigateToReminders}
        onMouseEnter={() => setHoveredCard('reminders')}
        onMouseLeave={() => setHoveredCard(null)}
        >
          <h2 style={{ color: '#ff9800', marginBottom: '10px' }}>租金提醒</h2>
          <p>管理租金提醒，跟踪租金支付状态。</p>
          {!loading && pendingReminders > 0 && (
            <div style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '12px',
              display: 'inline-block',
              marginTop: '10px',
              fontSize: '14px',
            }}>
              待处理提醒: {pendingReminders}
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
        <h3>系统提示</h3>
        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
          <li>定期检查待处理的租金提醒，确保及时通知租户。</li>
          <li>及时更新租户信息，特别是联系方式，以确保提醒能够送达。</li>
          <li>系统会自动根据租期和租金信息生成提醒。</li>
        </ul>
      </div>
    </div>
  );
};