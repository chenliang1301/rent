# 租金提醒系统技术文档

## 1. 系统架构
- **架构类型**：简单单体应用
- **组件划分**：
  - API层：处理HTTP请求和响应
  - 服务层：实现业务逻辑
  - 数据层：数据库交互和数据持久化
  - 工具层：通用功能和辅助方法

## 2. 技术栈
- **后端**：Node.js 18.x+, Express 4.x
- **数据库**：MySQL 8.x
- **前端**：React 18+, TypeScript 5.x, Vite 5.x
- **认证**：JWT
- **API通信**：Axios

## 3. 数据库设计

### 3.1 表结构

#### 3.1.1 admin表（管理员表）
| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INT | AUTO_INCREMENT PRIMARY KEY | 管理员ID |
| username | VARCHAR(255) | NOT NULL UNIQUE | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（明文存储，仅用于演示） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 3.1.2 tenants表（租户表）
| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INT | AUTO_INCREMENT PRIMARY KEY | 租户ID |
| name | VARCHAR(255) | NOT NULL | 租户姓名 |
| phone | VARCHAR(20) | NOT NULL | 联系电话 |
| email | VARCHAR(255) | | 电子邮箱 |
| address | VARCHAR(500) | | 租约地址 |
| lease_start_date | VARCHAR(50) | NOT NULL | 租约开始日期 |
| lease_end_date | VARCHAR(50) | NOT NULL | 租约结束日期 |
| rent_amount | DECIMAL(10,2) | NOT NULL | 月租金 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 3.1.3 reminders表（提醒记录表）
| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INT | AUTO_INCREMENT PRIMARY KEY | 提醒ID |
| tenant_id | INT | NOT NULL FOREIGN KEY | 租户ID |
| content | TEXT | NOT NULL | 提醒内容 |
| status | VARCHAR(50) | NOT NULL DEFAULT 'pending' | 提醒状态 |
| send_time | TIMESTAMP | | 发送时间 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

#### 3.1.4 system_configs表（系统配置表）
| 字段名 | 数据类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| id | INT | AUTO_INCREMENT PRIMARY KEY | 配置ID |
| config_key | VARCHAR(100) | NOT NULL UNIQUE | 配置键名 |
| config_value | VARCHAR(255) | NOT NULL | 配置值 |
| description | VARCHAR(500) | | 配置描述 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 4. 核心模块

### 4.1 认证模块
- JWT令牌生成和验证
- 管理员登录验证
- API请求认证中间件

### 4.2 租户管理模块
- 租户信息CRUD操作
- 分页和排序功能
- 数据验证和错误处理

### 4.3 提醒管理模块
- 租金到期提醒触发逻辑
- 提醒记录管理
- 提醒状态更新

### 4.4 配置管理模块
- 系统配置查询和更新
- 配置数据验证

## 5. API接口

### 5.1 认证接口
- POST /api/auth/login - 用户登录

### 5.2 租户管理接口
- GET /api/tenants - 获取租户列表
- GET /api/tenants/:id - 获取单个租户详情
- POST /api/tenants - 创建租户
- PUT /api/tenants/:id - 更新租户信息
- DELETE /api/tenants/:id - 删除租户

### 5.3 提醒管理接口
- POST /api/reminders/trigger - 触发提醒
- GET /api/reminders - 获取提醒记录
- PUT /api/reminders/:id/status - 更新提醒状态
- GET /api/reminders/pending/count - 获取待处理提醒数量

### 5.4 配置管理接口
- GET /api/config - 获取所有配置
- GET /api/config/:key - 获取单个配置
- PUT /api/config/:key - 更新配置

## 6. 安全措施
- JWT令牌认证
- 输入验证和数据清洗
- 错误处理和日志记录

## 7. 部署要求
- Node.js 18.x+
- MySQL 8.x
- npm 或 yarn 包管理工具
- 环境变量配置