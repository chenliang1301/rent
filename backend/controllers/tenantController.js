const { db } = require('../db');
const { logError, logDataFormatError } = require('../utils/logger');

// 日期验证函数
function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// 创建租户
async function createTenant(req, res) {
  try {
    const { name, phone, email, address, leaseStartDate, leaseEndDate, monthlyRent } = req.body;
    
    // 验证必填字段
    if (!name || !phone || !leaseStartDate || !leaseEndDate || monthlyRent === undefined) {
      // 记录数据格式错误
      logDataFormatError('TenantRequiredFields', req.body, '缺少必填字段');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '缺少必填字段',
        error_code: 1001
      });
    }
    
    // 验证数据格式
    if (monthlyRent <= 0) {
      // 记录数据格式错误
      logDataFormatError('TenantMonthlyRent', monthlyRent, '租金金额必须大于0');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '租金金额必须大于0',
        error_code: 1001
      });
    }
    
    // 验证日期格式
    if (!isValidDate(leaseStartDate) || !isValidDate(leaseEndDate)) {
      // 记录数据格式错误
      logDataFormatError('TenantDateFormat', { leaseStartDate, leaseEndDate }, '日期格式无效');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '日期格式无效，请使用有效的日期格式',
        error_code: 1001
      });
    }
    
    // 验证租约开始日期不能晚于结束日期
    const startDate = new Date(leaseStartDate);
    const endDate = new Date(leaseEndDate);
    if (startDate >= endDate) {
      // 记录数据格式错误
      logDataFormatError('TenantDateRange', { leaseStartDate, leaseEndDate }, '租约开始日期不能晚于或等于结束日期');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '租约开始日期不能晚于或等于结束日期',
        error_code: 1001
      });
    }
    
    // 插入租户数据（使用async/await）
    const result = await db.run(
      `INSERT INTO tenants (name, phone, email, address, lease_start_date, lease_end_date, rent_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email, address || '', leaseStartDate, leaseEndDate, monthlyRent]
    );
    
    // 获取创建的租户信息
    const tenant = await db.get('SELECT * FROM tenants WHERE id = ?', [result.insertId]);
    
    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address || '',
        leaseStartDate: tenant.lease_start_date,
        leaseEndDate: tenant.lease_end_date,
        monthlyRent: tenant.rent_amount,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      },
      message: '租户创建成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'createTenant',
      requestBody: req.body,
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

// 获取租户列表
async function getTenants(req, res) {
  try {
    console.log('Received GET /tenants request:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const keyword = req.query.keyword || '';
    // 添加排序参数支持
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;
    
    // 验证排序字段
    const validSortFields = ['id', 'name', 'phone', 'rent_amount', 'lease_start_date', 'lease_end_date', 'created_at', 'updated_at'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    
    // 构建查询条件
    let query = 'SELECT * FROM tenants';
    let countQuery = 'SELECT COUNT(*) as total FROM tenants';
    let params = [];
    
    if (keyword) {
      const searchCondition = ' WHERE name LIKE ? OR phone LIKE ?';
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    // 添加排序和分页
    query += ` ORDER BY ${safeSortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // 查询总数（使用async/await）
    const countResult = await db.get(countQuery, params.slice(0, params.length - 2));
    const total = countResult.total;
    
    // 查询租户列表（使用async/await）
    const tenants = await db.query(query, params);
    
    console.log(`Found ${tenants.length} tenants, total: ${total}`);
    
    // 格式化响应数据
    const formattedTenants = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email,
      address: tenant.address || '',
      leaseStartDate: tenant.lease_start_date,
      leaseEndDate: tenant.lease_end_date,
      monthlyRent: tenant.rent_amount,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at
    }));
    
    res.json({
      success: true,
      data: {
        total,
        items: formattedTenants
      },
      message: '获取租户列表成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'getTenants',
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

// 获取单个租户详情
async function getTenant(req, res) {
  try {
    const { id } = req.params;
    
    // 查询租户信息（使用async/await）
    const tenant = await db.get('SELECT * FROM tenants WHERE id = ?', [id]);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '租户不存在',
        error_code: 2001
      });
    }
    
    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address || '',
        leaseStartDate: tenant.lease_start_date,
        leaseEndDate: tenant.lease_end_date,
        monthlyRent: tenant.rent_amount,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at
      },
      message: '获取租户详情成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'getTenant',
      tenantId: id,
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

// 更新租户信息
async function updateTenant(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, email, address, leaseStartDate, leaseEndDate, monthlyRent } = req.body;
    
    // 验证必填字段
    if (!name || !phone || !leaseStartDate || !leaseEndDate || monthlyRent === undefined) {
      // 记录数据格式错误
      logDataFormatError('UpdateTenantRequiredFields', req.body, '缺少必填字段');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '缺少必填字段',
        error_code: 1001
      });
    }
    
    // 验证数据格式
    if (monthlyRent <= 0) {
      // 记录数据格式错误
      logDataFormatError('UpdateTenantMonthlyRent', monthlyRent, '租金金额必须大于0');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '租金金额必须大于0',
        error_code: 1001
      });
    }
    
    // 验证日期格式
    if (!isValidDate(leaseStartDate) || !isValidDate(leaseEndDate)) {
      // 记录数据格式错误
      logDataFormatError('UpdateTenantDateFormat', { leaseStartDate, leaseEndDate }, '日期格式无效');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '日期格式无效，请使用有效的日期格式',
        error_code: 1001
      });
    }
    
    // 验证租约开始日期不能晚于结束日期
    const startDate = new Date(leaseStartDate);
    const endDate = new Date(leaseEndDate);
    if (startDate >= endDate) {
      // 记录数据格式错误
      logDataFormatError('UpdateTenantDateRange', { leaseStartDate, leaseEndDate }, '租约开始日期不能晚于或等于结束日期');
      
      return res.status(400).json({
        success: false,
        data: null,
        message: '租约开始日期不能晚于或等于结束日期',
        error_code: 1001
      });
    }
    
    // 检查租户是否存在（使用async/await）
    const existingTenant = await db.get('SELECT * FROM tenants WHERE id = ?', [id]);
    
    if (!existingTenant) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '租户不存在',
        error_code: 2001
      });
    }
    
    // 更新租户信息（使用async/await）
    await db.run(
      `UPDATE tenants 
       SET name = ?, phone = ?, email = ?, address = ?, lease_start_date = ?, lease_end_date = ?, rent_amount = ? 
       WHERE id = ?`,
      [name, phone, email, address || '', leaseStartDate, leaseEndDate, monthlyRent, id]
    );
    
    // 获取更新后的租户信息
    const updatedTenant = await db.get('SELECT * FROM tenants WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        phone: updatedTenant.phone,
        email: updatedTenant.email,
        address: updatedTenant.address || '',
        leaseStartDate: updatedTenant.lease_start_date,
        leaseEndDate: updatedTenant.lease_end_date,
        monthlyRent: updatedTenant.rent_amount,
        createdAt: updatedTenant.created_at,
        updatedAt: updatedTenant.updated_at
      },
      message: '租户更新成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'updateTenant',
      tenantId: id,
      requestBody: req.body,
    });
    
    res.status(500).json({
      success: false,
      data: null,
      message: '服务器内部错误',
      error_code: 1005
    });
  }
}

// 删除租户
async function deleteTenant(req, res) {
  try {
    const { id } = req.params;
    
    // 检查租户是否存在
    const existingTenant = await db.get('SELECT * FROM tenants WHERE id = ?', [id]);
    
    if (!existingTenant) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '租户不存在',
        error_code: 2001
      });
    }
    
    // 删除租户
    await db.run('DELETE FROM tenants WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: null,
      message: '租户删除成功',
      error_code: null
    });
  } catch (error) {
    // 记录错误
    logError(error, {
      function: 'deleteTenant',
      tenantId: id,
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
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant
};