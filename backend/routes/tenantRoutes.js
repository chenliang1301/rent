const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTenant, getTenants, getTenant, updateTenant, deleteTenant } = require('../controllers/tenantController');

// 暂时注释掉认证中间件，用于测试
// router.use(authMiddleware);

// 租户路由
router.post('/', createTenant);      // 创建租户
router.get('/', getTenants);         // 获取租户列表
router.get('/:id', getTenant);       // 获取单个租户详情
router.put('/:id', updateTenant);    // 更新租户信息
router.delete('/:id', deleteTenant); // 删除租户

module.exports = router;