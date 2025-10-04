const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rent_reminder'
};

// 先创建不带database参数的连接配置，用于创建数据库
const connectionConfig = {
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password
};

// 创建数据库连接池
let pool;

// 初始化数据库连接和表
async function initDB() {
  try {
    // 1. 首先检查并创建数据库（如果不存在）
    await createDatabaseIfNotExists();
    
    // 2. 创建数据库连接池（此时可以使用database参数）
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // 3. 获取连接
    const connection = await pool.getConnection();
    console.log('成功连接到MySQL数据库');
    
    // 4. 初始化数据库表
    await initTables(connection);
    
    // 5. 释放连接
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    return false;
  }
}

// 创建数据库（如果不存在）
async function createDatabaseIfNotExists() {
  try {
    // 创建不带database参数的连接
    const connection = await mysql.createConnection(connectionConfig);
    
    // 执行创建数据库语句
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`数据库 ${dbConfig.database} 已准备就绪`);
    
    // 关闭临时连接
    await connection.end();
  } catch (error) {
    console.error('创建数据库失败:', error.message);
    throw error;
  }
}

// 初始化数据库表
async function initTables(connection) {
  try {
    // 创建管理员表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('admin表创建成功');

    // 创建租户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        address VARCHAR(500),
        lease_start_date VARCHAR(50) NOT NULL,
        lease_end_date VARCHAR(50) NOT NULL,
        rent_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('tenants表创建成功');

    // 创建提醒记录表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        send_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      )
    `);
    console.log('reminders表创建成功');
    
    // 创建系统配置表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('system_configs表创建成功');
    
    // 初始化默认配置
    await initDefaultConfigs(connection);
  } catch (error) {
    console.error('创建表失败:', error.message);
    throw error;
  }
}

// 初始化默认系统配置
async function initDefaultConfigs(connection) {
  try {
    // 检查是否已存在租金提醒天数配置
    const [rows] = await connection.query('SELECT * FROM system_configs WHERE config_key = ?', ['rent_reminder_days']);
    
    if (rows.length === 0) {
      // 插入默认配置：提前7天提醒
      await connection.query(
        'INSERT INTO system_configs (config_key, config_value, description) VALUES (?, ?, ?)',
        ['rent_reminder_days', '7', '租金到期前的提醒天数']
      );
      console.log('默认系统配置初始化成功');
    }
  } catch (error) {
    console.error('初始化默认配置失败:', error.message);
    throw error;
  }
}

// 初始化管理员账号
async function initAdmin() {
  try {
    const connection = await pool.getConnection();
    
    // 检查是否已存在管理员账号
    const [rows] = await connection.query('SELECT * FROM admin WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      // 创建默认管理员账号（使用明文密码，仅用于演示）
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      
      await connection.query('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin', defaultPassword]);
      console.log('默认管理员账号创建成功');
    } else {
      console.log('管理员账号已存在');
    }
    
    connection.release();
  } catch (error) {
    console.error('初始化管理员账号失败:', error.message);
    throw error;
  }
}

// 数据库操作辅助函数
const db = {
  // 执行查询（返回多行）
  query: async (sql, params = []) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error('数据库查询失败:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // 执行查询（返回单行）
  get: async (sql, params = []) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(sql, params);
      return rows[0] || null;
    } catch (error) {
      console.error('数据库查询失败:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  },
  
  // 执行更新操作（插入、更新、删除）
  run: async (sql, params = []) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(sql, params);
      return result;
    } catch (error) {
      console.error('数据库更新失败:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = {
  pool,
  db,
  initDB,
  initAdmin
};