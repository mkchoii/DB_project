const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

/**
 * 배송지 추가
 * POST /users/:userId/address
 */
router.post('/users/:userId/address', addressController.createAddress);

/**
 * 배송지 목록 조회
 * GET /users/:userId/address
 */
router.get('/users/:userId/address', addressController.getAddress);

/**
 * 배송지 수정
 * PUT /address/:addId
 */
router.put('/address/:addId', addressController.updateAddress);

module.exports = router;
