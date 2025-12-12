const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 회원가입
router.post('/users', userController.createUser);

// 회원 정보 조회
router.get('/users/:userId', userController.getUser);

module.exports = router;
