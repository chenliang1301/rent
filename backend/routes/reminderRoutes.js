const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { triggerReminders, getReminders, updateReminderStatus, getPendingRemindersCount } = require('../controllers/reminderController');

// 暂时注释掉认证中间件，用于测试
// router.use(authMiddleware);

// 提醒路由
router.post('/trigger', triggerReminders);   // 触发提醒
router.get('/', getReminders);       // 获取提醒记录
router.put('/:id/status', updateReminderStatus); // 更新提醒状态
router.get('/pending/count', getPendingRemindersCount); // 获取待处理提醒数量

module.exports = router;