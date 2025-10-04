const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT认证中间件
function authMiddleware(req, res, next) {
  // 从请求头获取Authorization
  const authHeader = req.headers.authorization;
  
  // 检查Authorization头是否存在
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      data: null,
      message: '缺少认证令牌',
      error_code: 1002
    });
  }
  
  // 检查Bearer格式
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      data: null,
      message: '认证令牌格式错误',
      error_code: 1002
    });
  }
  
  const token = tokenParts[1];
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息存储在请求对象中
    req.user = decoded;
    
    // 继续处理请求
    next();
  } catch (error) {
    // 处理token验证失败
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: '认证令牌已过期',
        error_code: 1002
      });
    } else {
      return res.status(401).json({
        success: false,
        data: null,
        message: '认证令牌无效',
        error_code: 1002
      });
    }
  }
}

module.exports = authMiddleware;