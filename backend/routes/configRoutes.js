const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getConfig, getAllConfigs, updateConfig } = require('../controllers/configController');

// 应用认证中间件
router.use(authMiddleware);

// 配置路由
router.get('/', getAllConfigs);           // 获取所有配置
router.get('/:key', getConfig);           // 获取单个配置
router.put('/:key', updateConfig);        // 更新配置

module.exports = router;