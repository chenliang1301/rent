import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormInput } from '../components/common/FormInput';
import { Notification } from '../components/common/Notification';
// 登录页面
export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ visible: false, type: 'info', message: '' });
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // 自动登录测试账号
  React.useEffect(() => {
    console.log('LoginPage mounted, preparing auto login...');
    const autoLogin = async () => {
      try {
        console.log('开始调用login函数，使用账号: admin');
        await login('admin', 'admin123');
        console.log('登录成功，准备导航到主页');
        navigate('/');
      } catch (error: any) {
        console.error('自动登录失败:', error);
        console.error('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
    };
    autoLogin();
  }, [login, navigate]);
  
  // 如果用户已登录，重定向到主页
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!username.trim()) {
      newErrors.username = '请输入用户名';
    }
    
    if (!password.trim()) {
      newErrors.password = '请输入密码';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        await login(username, password);
        navigate('/');
      } catch (error: any) {
      showNotification('error', error.message || '登录失败，请检查用户名和密码');
      } finally {
        setIsLoading(false);
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
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      {notification.visible && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>登录系统</h2>
        
        <form onSubmit={handleSubmit}>
          <FormInput
            name="username"
            label="用户名"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            error={errors.username}
          />
          
          <FormInput
            name="password"
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            error={errors.password}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#ddd' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              marginTop: '20px',
            }}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};