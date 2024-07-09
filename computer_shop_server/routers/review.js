const express = require('express');
var router = express.Router();

const reviewController = require('../controllers/review');

router.post('/get', reviewController.getReviews);
router.post('/get-rating', reviewController.getRating);
router.post('/add', reviewController.writeReview);

module.exports = router;