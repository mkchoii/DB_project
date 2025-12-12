const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/categories', categoryController.getCategories);
router.get('/categories/:categoryId/products', categoryController.getProductsByCategory);

module.exports = router;
