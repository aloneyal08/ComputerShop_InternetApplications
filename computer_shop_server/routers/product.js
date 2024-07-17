const express = require('express');
var router = express.Router();

const productController = require('../controllers/product');

router.post('/add', productController.addProduct);
router.post('/get-id', productController.getProductById)
router.get('/get', productController.getProducts);
router.get('/get-new', productController.getNewProducts);
router.get('/get-popular', productController.getPopularProducts);
router.get('/get-linked', productController.getLinkedProduct);
router.post('/linked', productController.getAllLinked);
router.get('/get-flash', productController.getFlashProducts);
router.get('/search', productController.search);
router.get('/search/exact', productController.exactSearch)
router.get('/autocomplete', productController.getAutoCompletes);

module.exports = router;