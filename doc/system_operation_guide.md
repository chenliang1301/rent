# 租金提醒系统运行指南

本文档提供租金提醒系统前后端服务的启动方式和操作说明。

## 自动启动（推荐）

### 使用启动脚本

项目提供了便捷的启动脚本，位于 `startup_tools` 目录中：

1. 进入 `startup_tools` 目录
2. 选择以下任一方式：
   - 双击 `start_all.bat` 文件（适用于普通用户）
   - 右键点击 `start_all.ps1` 并选择「使用 PowerShell 运行」（适用于高级用户）
3. 脚本会自动安装依赖并按顺序启动前后端服务

### 服务信息
- 前端服务地址：http://localhost:5173
- 后端服务地址：http://localhost:3000

## 手动启动（开发用）

### 后端服务启动

#### 前置条件
- 已安装 Node.js

#### 启动步骤
```bash
# 进入 backend 目录
cd backend

# 安装依赖
npm install

# 启动后端服务
node index.js
```

#### 服务信息
- 服务地址：http://localhost:3000
- 数据库：SQLite (database.db)

### 前端服务启动

#### 前置条件
- 已安装 Node.js

#### 启动步骤
```bash
# 进入 frontend 目录
cd frontend

# 安装依赖
npm install

# 启动前端开发服务器
npm run dev
```

#### 服务信息
- 服务地址：http://localhost:5173
- 开发模式支持热重载

## 构建生产版本

### 前端构建
```bash
cd frontend
npm run build
npm run preview
```

## 注意事项
1. 使用脚本启动时会自动处理服务启动顺序
2. 手动启动时确保后端服务先于前端服务启动
3. 默认管理员账号信息可在后端配置中设置
4. 如有端口冲突，可修改相关配置文件中的端口设置

## 故障排除
- 启动失败时检查依赖是否正确安装
- 确认端口未被其他服务占用
- 检查数据库文件权限
- 查看日志文件获取详细错误信息
