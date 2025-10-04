import React, { useState, useEffect } from 'react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  onClose?: () => void;
}

// 通知组件
export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  // 根据类型设置样式和图标
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          color: 'white',
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: '#f44336',
          color: 'white',
          icon: '✗',
        };
      case 'warning':
        return {
          backgroundColor: '#ff9800',
          color: 'white',
          icon: '!',
        };
      default:
        return {
          backgroundColor: '#2196F3',
          color: 'white',
          icon: 'ℹ',
        };
    }
  };

  const typeStyles = getTypeStyles();

  // 设置定时器自动关闭通知
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: typeStyles.backgroundColor,
        color: typeStyles.color,
        padding: '15px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000,
        animation: 'slideInRight 0.3s ease-out',
        minWidth: '250px',
      }}
    >
      <div
        style={{
          marginRight: '10px',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        {typeStyles.icon}
      </div>
      <div style={{ flex: 1, wordBreak: 'break-word' }}>{message}</div>
      <button
        onClick={() => {
          setVisible(false);
          if (onClose) {
            onClose();
          }
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'currentColor',
          cursor: 'pointer',
          fontSize: '16px',
          marginLeft: '10px',
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
};