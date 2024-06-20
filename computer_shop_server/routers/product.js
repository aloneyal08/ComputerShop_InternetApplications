const express = require('express');
var router = express.Router();

const productController = require('../controllers/product');

router.post('/add', productController.addProduct);

module.exports = router;