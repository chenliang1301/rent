const { db } = require('../db');
const { logError, logDataFormatError } = require('../utils/logger');
// 获取系统配置
async function getConfig(req, res) {
  try {
    const { key } = req.params;
    
    // 查询配置
    const config = await db.get('SELECT * FROM system_configs WHERE config_key = ?', [key]);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配置不存在',
        error_code: 4001
      });
    }
    
    res.json({
      success: true,
      data: {
        key: config.config_key,
        value: config.config_value,
        description: config.description,
        updatedAt: config.updated_at
      },
      message: '获取配置成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'getConfig',
      configKey: key,
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

// 获取所有系统配置
async function getAllConfigs(req, res) {
  try {
    const configs = await db.query('SELECT * FROM system_configs ORDER BY config_key');
    
    // 格式化响应数据
    const formattedConfigs = configs.map(config => ({
      key: config.config_key,
      value: config.config_value,
      description: config.description,
      updatedAt: config.updated_at
    }));
    
    res.json({
      success: true,
      data: formattedConfigs,
      message: '获取配置成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'getAllConfigs',
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

// 更新系统配置
async function updateConfig(req, res) {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    // 验证输入
    if (value === undefined || value === null) {
      // 记录数据格式错误
      logDataFormatError('UpdateConfigMissingValue', { key }, '缺少配置值');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '缺少配置值',
        error_code: 1001
      });
    }
    
    // 对于租金提醒天数，确保是正整数
    if (key === 'rent_reminder_days') {
      const days = parseInt(value);
      if (isNaN(days) || days <= 0) {
        // 记录数据格式错误
        logDataFormatError('UpdateConfigInvalidDays', { value }, '提醒天数必须是正整数');
        
        return res.status(400).json({
          success: false,
          data: null,
          message: '提醒天数必须是正整数',
          error_code: 1001
        });
      }
    }
    
    // 更新配置
    const result = await db.run(
      'UPDATE system_configs SET config_value = ? WHERE config_key = ?',
      [value.toString(), key]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '配置不存在',
        error_code: 4001
      });
    }
    
    res.json({
      success: true,
      data: {
        key,
        value
      },
      message: '配置更新成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'updateConfig',
      configKey: key,
      configValue: value,
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

module.exports = {
  getConfig,
  getAllConfigs,
  updateConfig
};