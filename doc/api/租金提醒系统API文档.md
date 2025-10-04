# 租金提醒系统 API 文档

## 1. API 概述

本文档详细描述租金提醒系统的API接口规范，基于Node.js + Express + SQLite技术栈开发。系统采用RESTful API设计风格，使用JSON格式进行数据交换。

## 2. 认证与授权

### 2.1 认证方式
- **认证类型**: JWT (JSON Web Token)
- **获取Token**: 通过登录接口获取
- **Token有效期**: 默认24小时

### 2.2 认证请求头
```
Authorization: Bearer {your_access_token}
```

### 2.3 认证错误处理
- 无效Token: 返回 401 Unauthorized
- Token过期: 返回 401 Unauthorized
- 无权限访问: 返回 403 Forbidden

## 3. 基础信息

### 3.1 基础URL
- 开发环境: `http://localhost:3000/api`

### 3.2 响应格式
所有API响应采用统一格式：

```json
{
  "success": true,
  "data": {...},        // 响应数据
  "message": "成功",    // 响应消息
  "error_code": null    // 错误码，成功时为null
}
```

### 3.3 错误码定义
| 错误码 | 描述 | HTTP状态码 |
| :--- | :--- | :--- |
| 1001 | 参数错误 | 400 |
| 1002 | 认证失败 | 401 |
| 1003 | 无权限访问 | 403 |
| 1004 | 资源不存在 | 404 |
| 1005 | 服务器内部错误 | 500 |
| 2001 | 租户不存在 | 404 |
| 2002 | 提醒发送失败 | 500 |

## 4. 认证相关接口

### 4.1 用户登录

**URL**: `/api/auth/login`

**Method**: `POST`

**Request Body**:
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": 1,
      "username": "admin"
    }
  },
  "message": "登录成功",
  "error_code": null
}
```

**Error Response**:
```json
{
  "success": false,
  "data": null,
  "message": "用户名或密码错误",
  "error_code": 1002
}
```

## 5. 租户管理接口

### 5.1 创建租户

**URL**: `/api/tenants`

**Method**: `POST`

**Request Headers**:
```
Authorization: Bearer {your_access_token}
```

**Request Body**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "leaseStartDate": "2024-01-01",
  "leaseEndDate": "2024-12-31",
  "rentAmount": 3500
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "leaseStartDate": "2024-01-01",
    "leaseEndDate": "2024-12-31",
    "rentAmount": 3500,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "租户创建成功",
  "error_code": null
}
```

### 5.2 获取租户列表

**URL**: `/api/tenants`

**Method**: `GET`

**Request Headers**:
```
Authorization: Bearer {your_access_token}
```

**Query Parameters**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认20
- `keyword`: 搜索关键词（可选，支持姓名、手机号）

**Success Response**:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "id": 1,
        "name": "张三",
        "phone": "13800138000",
        "email": "zhangsan@example.com",
        "leaseStartDate": "2024-01-01",
        "leaseEndDate": "2024-12-31",
        "rentAmount": 3500
      },
      // 更多租户...
    ]
  },
  "message": "查询成功",
  "error_code": null
}
```

### 5.3 获取单个租户详情

**URL**: `/api/tenants/:id`

**Method**: `GET`

**Request Headers**:
```
Authorization: Bearer {your_access_token}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "leaseStartDate": "2024-01-01",
    "leaseEndDate": "2024-12-31",
    "rentAmount": 3500,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "查询成功",
  "error_code": null
}
```

**Error Response**:
```json
{
  "success": false,
  "data": null,
  "message": "租户不存在",
  "error_code": 2001
}
```

### 5.4 更新租户信息

**URL**: `/api/tenants/:id`

**Method**: `PUT`

**Request Headers**:
```
Authorization: Bearer {your_access_token}
```

**Request Body**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "leaseEndDate": "2025-12-31",
  "rentAmount": 3800
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "leaseStartDate": "2024-01-01",
    "leaseEndDate": "2025-12-31",
    "rentAmount": 3800,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-20T15:00:00.000Z"
  },
  "message": "租户信息更新成功",
  "error_code": null
}
```

## 6. 提醒管理接口

### 6.1 触发提醒

**URL**: `/api/reminders`

**Method**: `POST`

**Request Headers**:
```
Authorization: Bearer {your_access_token}
```

**Request Body**:
```json
{
  "tenantId": 1,
  "dueDate": "2024-02-01"
}
```

**Success Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenantId": 1,
    "content": "尊敬的张三，您的租金3500元将于2024-02-01到期，请及时支付。",
    "status": "sent",
    "sendTime": "2024-01-25T09:00:00.000Z",
    "createdAt": "2024-01-25T09:00:00.000Z"
  },
  "message": "提醒发送成功",
  "error_code": null
}
```

**Error Response**:
```json
{
  "success": false,
  "data": null,
  "message": "提醒发送失败",
  "error_code": 2002
}
```

### 6.2 获取提醒记录

**URL**: `/api/reminders`

**Method**: `GET`

**Request Headers**:
```
Authorization: Bearer {your_access_token}
```

**Query Parameters**:
- `page`: 页码，默认1
- `limit`: 每页数量，默认20
- `tenantId`: 租户ID（可选）
- `status`: 状态筛选（可选：pending, sent, failed）
- `startDate`: 开始日期（可选，格式：YYYY-MM-DD）
- `endDate`: 结束日期（可选，格式：YYYY-MM-DD）

**Success Response**:
```json
{
  "success": true,
  "data": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "id": 1,
        "tenantId": 1,
        "tenantName": "张三",
        "content": "尊敬的张三，您的租金3500元将于2024-02-01到期，请及时支付。",
        "status": "sent",
        "sendTime": "2024-01-25T09:00:00.000Z",
        "createdAt": "2024-01-25T09:00:00.000Z"
      },
      // 更多记录...
    ]
  },
  "message": "查询成功",
  "error_code": null
}
```