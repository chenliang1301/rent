import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'password';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

// 表单输入组件
export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`} style={{
      marginBottom: '16px',
    }}>
      <label style={{
        display: 'block',
        marginBottom: '4px',
        fontWeight: 'bold',
        fontSize: '14px',
      }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: `1px solid ${error ? '#f44336' : '#ddd'}`,
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
          ...(error ? { outlineColor: '#f44336' } : {}),
        }}
      />
      {error && (
        <div style={{
          color: '#f44336',
          fontSize: '12px',
          marginTop: '4px',
        }}>
          {error}
        </div>
      )}
    </div>
  );
};