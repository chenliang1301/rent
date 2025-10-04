import React, { useState, useEffect } from 'react';
import type { Tenant } from '../../types';
import { FormInput } from '../common/FormInput';
interface TenantFormProps {
  tenant?: Tenant | null;
  onSubmit: (tenant: Tenant) => void;
  onCancel: () => void;
}

// 租户表单组件
export const TenantForm: React.FC<TenantFormProps> = ({ tenant, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // 当编辑的租户信息变化时，更新表单数据
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address,
        leaseStartDate: tenant.leaseStartDate.split('T')[0], // 格式化为YYYY-MM-DD
        leaseEndDate: tenant.leaseEndDate.split('T')[0],
        monthlyRent: tenant.monthlyRent.toString(),
      });
    } else {
      // 重置表单
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        leaseStartDate: '',
        leaseEndDate: '',
        monthlyRent: '',
      });
    }
    setErrors({});
  }, [tenant]);
  
  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误信息
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // 验证必填字段
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = '请输入房屋地址';
    }
    
    if (!formData.leaseStartDate) {
      newErrors.leaseStartDate = '请选择租期开始日期';
    }
    
    if (!formData.leaseEndDate) {
      newErrors.leaseEndDate = '请选择租期结束日期';
    }
    
    if (!formData.monthlyRent) {
      newErrors.monthlyRent = '请输入月租金';
    } else if (parseFloat(formData.monthlyRent) <= 0) {
      newErrors.monthlyRent = '月租金必须大于0';
    }
    
    // 验证租期日期
    if (formData.leaseStartDate && formData.leaseEndDate) {
      const startDate = new Date(formData.leaseStartDate);
      const endDate = new Date(formData.leaseEndDate);
      if (startDate >= endDate) {
        newErrors.leaseEndDate = '租期结束日期必须晚于开始日期';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const tenantData: Tenant = {
        id: tenant?.id || 0,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        leaseStartDate: formData.leaseStartDate,
        leaseEndDate: formData.leaseEndDate,
        monthlyRent: parseFloat(formData.monthlyRent),
        createdAt: tenant?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      onSubmit(tenantData);
    }
  };
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>{tenant ? '编辑租户' : '添加租户'}</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="姓名"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="请输入租户姓名"
          error={errors.name}
        />
        
        <FormInput
          label="联系电话"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="请输入联系电话"
          error={errors.phone}
        />
        
        <FormInput
          label="邮箱"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="请输入邮箱"
          error={errors.email}
        />
        
        <FormInput
          label="房屋地址"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          placeholder="请输入房屋地址"
          error={errors.address}
        />
        
        <FormInput
          label="租期开始日期"
          name="leaseStartDate"
          type="date"
          value={formData.leaseStartDate}
          onChange={handleChange}
          error={errors.leaseStartDate}
        />
        
        <FormInput
          label="租期结束日期"
          name="leaseEndDate"
          type="date"
          value={formData.leaseEndDate}
          onChange={handleChange}
          error={errors.leaseEndDate}
        />
        
        <FormInput
          label="月租金"
          name="monthlyRent"
          type="number"
          value={formData.monthlyRent}
          onChange={handleChange}
          placeholder="请输入月租金"
          error={errors.monthlyRent}
        />
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tenant ? '更新' : '添加'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};