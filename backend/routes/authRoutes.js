const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// 登录路由
router.post('/login', login);

module.exports = router;