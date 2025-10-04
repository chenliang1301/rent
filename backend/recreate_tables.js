const mysql = require('mysql2/promise');

(async () => {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'rent_reminder'
    });
    
    // 先删除关联的表
    await connection.query('DROP TABLE IF EXISTS reminders');
    await connection.query('DROP TABLE IF EXISTS tenants');
    
    console.log('已删除现有的表');
    
    // 重新创建表
    await connection.query(`
      CREATE TABLE tenants (
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
    
    await connection.query(`
      CREATE TABLE reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        send_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      )
    `);
    
    console.log('已重新创建表');
    await connection.end();
  } catch (error) {
    console.error('操作失败:', error.message);
  }
})();