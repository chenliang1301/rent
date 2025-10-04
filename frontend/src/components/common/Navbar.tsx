import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// 导航栏组件
export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#333',
      padding: '0 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <Link to="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '15px 0',
            marginRight: '30px',
          }}>
            租金管理系统
          </Link>
          
          {isAuthenticated && (
            <div style={{ display: 'flex' }}>
              <Link to="/tenants" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '15px',
                marginRight: '10px',
                transition: 'background-color 0.2s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                租户管理
              </Link>
              <Link to="/reminders" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '15px',
                marginRight: '10px',
                transition: 'background-color 0.2s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                提醒管理
              </Link>
              <Link to="/config" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '15px',
                transition: 'background-color 0.2s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                系统配置
              </Link>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && user && (
            <>
              <span style={{
                color: 'white',
                marginRight: '15px',
              }}>
                欢迎, {user.username}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                登出
              </button>
            </>
          )}
          
          {!isAuthenticated && (
            <Link to="/login" style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
            }}>
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};