// 错误处理中间件
const { logError, logDataFormatError } = require('../utils/logger');

// 通用错误处理中间件
function errorHandler(err, req, res, next) {
  // 记录通用错误
  logError(err, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
  
  // 默认错误响应
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

// 请求数据验证和异常捕获中间件
function dataValidationMiddleware(schema, field = 'body') {
  return (req, res, next) => {
    try {
      // 如果提供了验证模式，则进行验证
      if (schema) {
        const validationResult = schema.validate(req[field]);
        if (validationResult.error) {
          const errorMessage = validationResult.error.details.map(detail => detail.message).join(', ');
          
          // 记录数据格式错误
          logDataFormatError(
            `${field.charAt(0).toUpperCase() + field.slice(1)}`,
            req[field],
            errorMessage,
            {
              url: req.url,
              method: req.method,
            }
          );
          
          return res.status(400).json({
            success: false,
            message: `请求数据格式错误: ${errorMessage}`,
          });
        }
      }
      
      // 检查请求体是否为有效JSON（如果有请求体）
      if (field === 'body' && req.body && typeof req.body !== 'object') {
        const errorMessage = '请求体必须是有效的JSON对象';
        
        logDataFormatError(
          'RequestBody',
          req.body,
          errorMessage,
          {
            url: req.url,
            method: req.method,
          }
        );
        
        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
      
      next();
    } catch (error) {
      // 记录异常
      logDataFormatError(
        'RequestValidation',
        req[field],
        error.message,
        {
          url: req.url,
          method: req.method,
        }
      );
      
      res.status(400).json({
        success: false,
        message: `请求验证失败: ${error.message}`,
      });
    }
  };
}

module.exports = {
  errorHandler,
  dataValidationMiddleware,
};