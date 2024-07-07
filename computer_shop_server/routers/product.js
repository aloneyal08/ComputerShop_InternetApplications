const express = require('express');
var router = express.Router();

const productController = require('../controllers/product');

router.post('/add', productController.addProduct);
router.get('/get', productController.getProducts);
router.get('/get-new', productController.getNewProducts);
router.get('/get-popular', productController.getPopularProducts);
router.get('/get-flash', productController.getFlashProducts);
router.get('/search', productController.search);
router.get('/autocomplete', productController.getAutoCompletes);

module.exports = router;