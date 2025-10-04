import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

// 加载状态组件
export const Loading: React.FC<LoadingProps> = ({
  message = '加载中...',
  size = 'medium',
  fullPage = false,
}) => {
  // 根据size设置样式
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          spinner: { width: '20px', height: '20px' },
          message: { fontSize: '14px' },
        };
      case 'large':
        return {
          spinner: { width: '40px', height: '40px' },
          message: { fontSize: '18px' },
        };
      default:
        return {
          spinner: { width: '30px', height: '30px' },
          message: { fontSize: '16px' },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const containerStyles = fullPage ? 
    { 
      display: 'flex', 
      flexDirection: 'column' as const, 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw' 
    } : 
    { 
      display: 'flex', 
      flexDirection: 'column' as const, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '20px' 
    };

  return (
    <div style={containerStyles}>
      <div
        style={{
          ...sizeStyles.spinner,
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #4CAF50',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px',
        }}
      />
      <div style={sizeStyles.message}>{message}</div>
    </div>
  );
};