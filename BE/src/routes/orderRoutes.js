const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 주문 생성
router.post('/users/:userId/orders', orderController.createOrders);

// 주문 목록 조회
router.get('/users/:userId/orders', orderController.getOrders);

// 주문 상세 조회
router.get('/orders/:orderId/details', orderController.getOrdersDetail);

module.exports = router;
