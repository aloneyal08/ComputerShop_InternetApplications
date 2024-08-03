const express = require('express');
var router = express.Router();

const reviewController = require('../controllers/review');

router.post('/get', reviewController.getReviews);
router.post('/get-rating', reviewController.getRating);
router.get('/get-rating-supplier', reviewController.getSupplierRating);
router.post('/add', reviewController.writeReview);
router.get('/canReview', reviewController.canReview);

module.exports = router;