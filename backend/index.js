const express = require('express');
const app = express();
require('dotenv').config();
const { db, initDB, initAdmin } = require('./db');

// 导入路由
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const configRoutes = require('./routes/configRoutes');

// 中间件
const { errorHandler } = require('./middleware/errorHandler');
app.use(express.json());

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      message: '服务器运行正常'
    },
    message: '成功',
    error_code: null
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/config', configRoutes);

// 404错误处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: '接口不存在',
    error_code: 1004
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err.message);
  res.status(500).json({
    success: false,
    data: null,
    message: '服务器内部错误',
    error_code: 1005
  });
});

// 服务器端口
const PORT = process.env.PORT || 3000;

// 使用错误处理中间件（必须放在所有路由之后）
  app.use(errorHandler);
  
  // 启动服务器
async function startServer() {
  try {
    // 初始化数据库连接和表
    const dbInitialized = await initDB();
    if (!dbInitialized) {
      console.error('数据库初始化失败，程序无法继续运行');
      process.exit(1);
    }
    
    // 初始化管理员账号
    await initAdmin();
    
    // 启动Express服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error.message);
    process.exit(1);
  }
}

// 启动服务器
startServer();