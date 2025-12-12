// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.getProducts);
router.get('/products/:productId', productController.getProductDetail);
router.post('/products', productController.createProduct);

module.exports = router;
