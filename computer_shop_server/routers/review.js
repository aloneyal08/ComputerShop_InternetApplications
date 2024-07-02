const express = require('express');
var router = express.Router();

const reviewController = require('../controllers/review');

router.post('/get', reviewController.getReviews);

module.exports = router;