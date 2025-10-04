const { db } = require('../db');
const { logError, logDataFormatError } = require('../utils/logger');
// 触发所有租金提醒
async function triggerReminders(req, res) {
  try {
    // 获取系统配置的提醒天数
    const config = await db.get('SELECT config_value FROM system_configs WHERE config_key = ?', ['rent_reminder_days']);
    const reminderDays = parseInt(config?.config_value || '7'); // 默认7天
    
    // 计算提醒日期（当前日期加上提醒天数）
    const today = new Date();
    // 格式化为YYYY-MM-DD
    const formattedToday = today.toISOString().split('T')[0];
    
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + reminderDays);
    const formattedReminderDate = reminderDate.toISOString().split('T')[0];
    
    // 查询租期结束日期在今天到提醒日期之间的租户（包含两端）
    const tenants = await db.query(
      'SELECT * FROM tenants WHERE DATE(lease_end_date) >= ? AND DATE(lease_end_date) <= ?',
      [formattedToday, formattedReminderDate]
    );
    
    let sentCount = 0;
    
    // 为每个符合条件的租户创建提醒
    for (const tenant of tenants) {
      // 检查是否已经为该租户创建过提醒
      const existingReminder = await db.get(
        'SELECT * FROM reminders WHERE tenant_id = ? AND DATE(created_at) = DATE(NOW())',
        [tenant.id]
      );
      
      if (!existingReminder) {
        // 生成提醒内容
        const content = `尊敬的${tenant.name}，您的租金${tenant.rent_amount}元将于${tenant.lease_end_date}到期，请及时支付。`;
        
        // 插入提醒记录
        await db.run(
          'INSERT INTO reminders (tenant_id, content, status) VALUES (?, ?, ?)',
          [tenant.id, content, 'pending']
        );
        
        sentCount++;
      }
    }
    
    res.json({
      success: true,
      data: {
        sentCount,
        reminderDays,
        startDate: formattedToday,
        endDate: formattedReminderDate
      },
      message: `成功创建${sentCount}条提醒记录`,
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'triggerReminders',
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '提醒触发失败',
      error_code: 2002
    });
  }
}

// 获取提醒记录
async function getReminders(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tenantId = req.query.tenantId;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    // 添加排序参数支持
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;
    
    // 验证排序字段
    const validSortFields = ['id', 'tenant_id', 'status', 'amount', 'lease_end_date', 'created_at', 'send_time'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    
    // 构建查询条件
    let query = `
      SELECT r.*, t.name as tenant_name, t.phone as tenant_phone, t.rent_amount as amount, t.lease_end_date
      FROM reminders r
      LEFT JOIN tenants t ON r.tenant_id = t.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM reminders';
    let params = [];
    let conditions = [];
    
    if (tenantId) {
      conditions.push('r.tenant_id = ?');
      params.push(tenantId);
    }
    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }
    if (startDate) {
      conditions.push('r.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('r.created_at <= ?');
      params.push(endDate);
    }
    
    // 添加查询条件
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }
    
    // 添加排序和分页
    query += ` ORDER BY ${safeSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // 查询总数
    const countResult = await db.get(countQuery, params.slice(0, params.length - 2));
    const total = countResult.total;
    
    // 查询提醒记录
    const reminders = await db.query(query, params);
    
    // 格式化响应数据
    const formattedReminders = reminders.map(reminder => ({
      id: reminder.id,
      tenantId: reminder.tenant_id,
      tenantName: reminder.tenant_name,
      tenantPhone: reminder.tenant_phone,
      amount: reminder.amount,
      content: reminder.content,
      status: reminder.status,
      reminderDate: reminder.lease_end_date,
      sendTime: reminder.send_time,
      createdAt: reminder.created_at
    }));    
    res.json({
      success: true,
      data: {
        total,
        page,
        limit,
        items: formattedReminders
      },
      message: '查询成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'getReminders',
      requestQuery: req.query,
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

// 更新提醒状态
async function updateReminderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 验证必填字段
    if (!status || !['pending', 'sent', 'failed', 'canceled', 'paid'].includes(status)) {
      // 记录数据格式错误
      logDataFormatError('UpdateReminderStatus', { status }, '无效的提醒状态');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '无效的提醒状态',
        error_code: 1001
      });
    }
    
    // 检查提醒是否存在
    const reminder = await db.get('SELECT * FROM reminders WHERE id = ?', [id]);
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '提醒不存在',
        error_code: 3001
      });
    }
    
    // 更新提醒状态
    await db.run('UPDATE reminders SET status = ? WHERE id = ?', [status, id]);
    
    res.json({
      success: true,
      data: {
        id: reminder.id,
        status: status
      },
      message: '提醒状态更新成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'updateReminderStatus',
      reminderId: id,
      status: status,
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

// 获取待处理提醒数量
async function getPendingRemindersCount(req, res) {
  try {
    // 查询状态为pending的提醒数量
    const result = await db.get(
      'SELECT COUNT(*) as count FROM reminders WHERE status = "pending"'
    );
    
    res.json({
      success: true,
      data: {
        count: result.count
      },
      message: '查询成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'getPendingRemindersCount',
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
  triggerReminders,
  getReminders,
  updateReminderStatus,
  getPendingRemindersCount
};