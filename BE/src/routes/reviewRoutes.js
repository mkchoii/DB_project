const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/products/:productId/reviews', reviewController.createReview);
router.put('/reviews/:reviewId', reviewController.updateReview);

module.exports = router;
