const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// 로그인
router.post('/auth/login', loginController.login);

// 로그아웃
router.post('/auth/logout', loginController.logout);

module.exports = router;
