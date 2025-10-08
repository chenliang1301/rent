const { db, initDB } = require('./db');

async function addStatusField() {
  try {
    console.log('初始化数据库连接...');
    // 先初始化数据库
    const dbInitialized = await initDB();
    
    if (!dbInitialized) {
      throw new Error('数据库初始化失败');
    }
    
    console.log('开始为reminders表添加status字段...');
    
    // 检查status字段是否已存在
    const checkField = await db.query(
      "SHOW COLUMNS FROM reminders LIKE 'status'"
    );
    
    if (checkField.length === 0) {
      // 添加status字段
      await db.query(
        "ALTER TABLE reminders ADD COLUMN status VARCHAR(20) DEFAULT 'unpaid' COMMENT '租金状态：paid(已支付), unpaid(待支付), overdue(已逾期)'"
      );
      console.log('成功添加status字段');
    } else {
      console.log('status字段已存在，跳过添加');
    }
    
    console.log('操作完成');
    
  } catch (error) {
    console.error('添加status字段失败:', error.message);
  }
}

// 执行添加字段函数
addStatusField();