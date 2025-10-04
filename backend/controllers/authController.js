const jwt = require('jsonwebtoken');
const { db } = require('../db');
require('dotenv').config();

// 登录函数
async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: '用户名和密码不能为空',
        error_code: 1001
      });
    }
    
    // 查询管理员（使用async/await方式）
    const admin = await db.get('SELECT * FROM admin WHERE username = ?', [username]);
    
    // 管理员不存在
    if (!admin) {
      return res.status(401).json({
        success: false,
        data: null,
        message: '用户名或密码错误',
        error_code: 1002
      });
    }
    
    // 简单的密码比较（生产环境应该使用bcrypt）
    if (password !== admin.password) {
      return res.status(401).json({
        success: false,
        data: null,
        message: '用户名或密码错误',
        error_code: 1002
      });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // 返回成功响应
    res.json({
      success: true,
      data: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 86400,
        user: {
          id: admin.id,
          username: admin.username
        }
      },
      message: '登录成功',
      error_code: null
    });
  } catch (error) {
    console.error('登录失败:', error.message);
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

module.exports = {
  login
};