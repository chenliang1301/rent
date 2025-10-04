// 错误日志记录工具
const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 记录错误日志
function logError(error, context = {}) {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
  };
  
  const logFileName = `error_${new Date().toISOString().split('T')[0]}.json`;
  const logFilePath = path.join(logsDir, logFileName);
  
  // 将错误记录到文件
  fs.appendFile(logFilePath, JSON.stringify(errorData) + '\n', (err) => {
    if (err) {
      console.error('写入错误日志失败:', err);
    }
  });
  
  // 同时输出到控制台便于开发调试
  console.error(`[${timestamp}] 错误日志:`, error.message);
}

// 记录数据格式异常
function logDataFormatError(dataType, invalidData, errorMessage, context = {}) {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    errorType: 'DataFormatError',
    dataType,
    invalidData,
    errorMessage,
    context,
  };
  
  const logFileName = `data_format_error_${new Date().toISOString().split('T')[0]}.json`;
  const logFilePath = path.join(logsDir, logFileName);
  
  // 将错误记录到文件
  fs.appendFile(logFilePath, JSON.stringify(errorData) + '\n', (err) => {
    if (err) {
      console.error('写入数据格式错误日志失败:', err);
    }
  });
  
  // 同时输出到控制台便于开发调试
  console.error(`[${timestamp}] 数据格式错误 (${dataType}):`, errorMessage);
}

module.exports = {
  logError,
  logDataFormatError,
};