# 租金提醒系统API文档

## 1. 认证接口

### 1.1 用户登录
- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 管理员登录系统，获取JWT令牌
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "accessToken": "jwt_token_string",
      "user": {
        "id": 1,
        "username": "admin"
      }
    }
    ```
- **错误响应**:
  - **状态码**: `401 Unauthorized`
  - **响应体**:
    ```json
    {
      "message": "用户名或密码错误"
    }
    ```

## 2. 租户管理接口

### 2.1 获取租户列表
- **URL**: `/api/tenants`
- **方法**: `GET`
- **描述**: 获取所有租户列表，支持分页和排序
- **参数**:
  - `page`: 页码，默认为1
  - `limit`: 每页数量，默认为10
  - `sortBy`: 排序字段，默认为"created_at"
  - `sortOrder`: 排序顺序，默认为"DESC"
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "张三",
          "phone": "13800138000",
          "email": "zhangsan@example.com",
          "address": "北京市朝阳区xx街道xx小区xx单元xx室",
          "lease_start_date": "2023-01-01",
          "lease_end_date": "2024-01-01",
          "rent_amount": 3500.00,
          "created_at": "2023-01-01T00:00:00Z",
          "updated_at": "2023-01-01T00:00:00Z"
        }
      ],
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
    ```

### 2.2 获取单个租户详情
- **URL**: `/api/tenants/:id`
- **方法**: `GET`
- **描述**: 根据ID获取单个租户详情
- **参数**:
  - `id`: 租户ID
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "address": "北京市朝阳区xx街道xx小区xx单元xx室",
      "lease_start_date": "2023-01-01",
      "lease_end_date": "2024-01-01",
      "rent_amount": 3500.00,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
    ```
- **错误响应**:
  - **状态码**: `404 Not Found`
  - **响应体**:
    ```json
    {
      "message": "租户不存在"
    }
    ```

### 2.3 创建租户
- **URL**: `/api/tenants`
- **方法**: `POST`
- **描述**: 创建新租户
- **请求体**:
  ```json
  {
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "address": "北京市朝阳区xx街道xx小区xx单元xx室",
    "lease_start_date": "2023-01-01",
    "lease_end_date": "2024-01-01",
    "rent_amount": 3500.00
  }
  ```
- **成功响应**:
  - **状态码**: `201 Created`
  - **响应体**:
    ```json
    {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "address": "北京市朝阳区xx街道xx小区xx单元xx室",
      "lease_start_date": "2023-01-01",
      "lease_end_date": "2024-01-01",
      "rent_amount": 3500.00,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
    ```

### 2.4 更新租户信息
- **URL**: `/api/tenants/:id`
- **方法**: `PUT`
- **描述**: 更新租户信息
- **参数**:
  - `id`: 租户ID
- **请求体**:
  ```json
  {
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "address": "北京市朝阳区xx街道xx小区xx单元xx室",
    "lease_start_date": "2023-01-01",
    "lease_end_date": "2024-01-01",
    "rent_amount": 3500.00
  }
  ```
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "address": "北京市朝阳区xx街道xx小区xx单元xx室",
      "lease_start_date": "2023-01-01",
      "lease_end_date": "2024-01-01",
      "rent_amount": 3500.00,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-02T00:00:00Z"
    }
    ```
- **错误响应**:
  - **状态码**: `404 Not Found`
  - **响应体**:
    ```json
    {
      "message": "租户不存在"
    }
    ```

### 2.5 删除租户
- **URL**: `/api/tenants/:id`
- **方法**: `DELETE`
- **描述**: 删除租户
- **参数**:
  - `id`: 租户ID
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "message": "租户删除成功"
    }
    ```
- **错误响应**:
  - **状态码**: `404 Not Found`
  - **响应体**:
    ```json
    {
      "message": "租户不存在"
    }
    ```

## 3. 提醒管理接口

### 3.1 触发提醒
- **URL**: `/api/reminders/trigger`
- **方法**: `POST`
- **描述**: 根据系统配置的提醒天数触发租金到期提醒
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "message": "提醒触发成功",
      "createdCount": 5
    }
    ```

### 3.2 获取提醒记录
- **URL**: `/api/reminders`
- **方法**: `GET`
- **描述**: 获取提醒记录列表，支持分页和排序
- **参数**:
  - `page`: 页码，默认为1
  - `limit`: 每页数量，默认为10
  - `sortBy`: 排序字段，默认为"created_at"
  - `sortOrder`: 排序顺序，默认为"DESC"
  - `status`: 筛选状态，可选值: pending, completed, failed
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "tenant_id": 1,
          "tenant": {
            "id": 1,
            "name": "张三",
            "phone": "13800138000"
          },
          "content": "张三租户，您的租金将在5天后到期，请及时支付。",
          "status": "pending",
          "send_time": null,
          "created_at": "2023-01-01T00:00:00Z"
        }
      ],
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
    ```

### 3.3 更新提醒状态
- **URL**: `/api/reminders/:id/status`
- **方法**: `PUT`
- **描述**: 更新提醒状态
- **参数**:
  - `id`: 提醒ID
- **请求体**:
  ```json
  {
    "status": "completed"
  }
  ```
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "id": 1,
      "tenant_id": 1,
      "content": "张三租户，您的租金将在5天后到期，请及时支付。",
      "status": "completed",
      "send_time": "2023-01-01T10:00:00Z",
      "created_at": "2023-01-01T00:00:00Z"
    }
    ```
- **错误响应**:
  - **状态码**: `404 Not Found`
  - **响应体**:
    ```json
    {
      "message": "提醒记录不存在"
    }
    ```

### 3.4 获取待处理提醒数量
- **URL**: `/api/reminders/pending/count`
- **方法**: `GET`
- **描述**: 获取待处理提醒的数量
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "count": 5
    }
    ```

## 4. 配置管理接口

### 4.1 获取所有配置
- **URL**: `/api/config`
- **方法**: `GET`
- **描述**: 获取所有系统配置
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    [
      {
        "key": "rent_reminder_days",
        "value": "7",
        "description": "租金提醒天数"
      },
      {
        "key": "system_name",
        "value": "租金提醒系统",
        "description": "系统名称"
      }
    ]
    ```

### 4.2 获取单个配置
- **URL**: `/api/config/:key`
- **方法**: `GET`
- **描述**: 根据键名获取单个配置
- **参数**:
  - `key`: 配置键名
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "key": "rent_reminder_days",
      "value": "7",
      "description": "租金提醒天数"
    }
    ```
- **错误响应**:
  - **状态码**: `404 Not Found`
  - **响应体**:
    ```json
    {
      "message": "配置不存在"
    }
    ```

### 4.3 更新配置
- **URL**: `/api/config/:key`
- **方法**: `PUT`
- **描述**: 更新系统配置
- **参数**:
  - `key`: 配置键名
- **请求体**:
  ```json
  {
    "value": "10",
    "description": "租金提醒天数"
  }
  ```
- **成功响应**:
  - **状态码**: `200 OK`
  - **响应体**:
    ```json
    {
      "key": "rent_reminder_days",
      "value": "10",
      "description": "租金提醒天数"
    }
    ```
- **错误响应**:
  - **状态码**: `400 Bad Request`
  - **响应体**:
    ```json
    {
      "message": "配置值必须是正整数"
    }
    ```
  - **状态码**: `404 Not Found`
  - **响应体**:
    ```json
    {
      "message": "配置不存在"
    }
    ```