# 租金提醒系统 - 启动说明

本文件夹包含租金提醒系统的启动工具，可以一键安装依赖并启动前后端服务。

## 脚本说明

### 1. Windows批处理脚本 (推荐普通用户)

**文件**: `start_all.bat`

**使用方法**:
- 双击文件即可运行
- 自动安装依赖并启动前后端服务
- 显示简单的状态提示

### 2. PowerShell脚本 (推荐高级用户)

**文件**: `start_all.ps1`

**使用方法**:
- 右键选择「使用 PowerShell 运行」
- 若遇执行策略限制，以管理员身份运行PowerShell并执行:
  ```
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- 提供彩色输出和详细进度信息

## 服务信息

- **前端服务地址**: http://localhost:5173
- **后端服务地址**: http://localhost:3000

## 日志文件

- `backend.log`: 后端服务运行日志
- `frontend.log`: 前端服务运行日志

## 故障排除

- **Node.js未安装**: 请从官网 https://nodejs.org/ 安装LTS版本
- **端口冲突**: 关闭占用端口的程序或修改配置文件
- **依赖安装失败**: 检查网络连接，可尝试手动运行 `npm install`
- **启动失败**: 查看日志文件了解具体错误信息