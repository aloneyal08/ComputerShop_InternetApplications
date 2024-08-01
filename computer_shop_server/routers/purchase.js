const express = require('express');
var router = express.Router();

const purchaseController = require('../controllers/purchase');

router.post('/buy-multiple', purchaseController.makePurchases);
router.get('/get', purchaseController.getPurchases);
router.get('/get/data', purchaseController.getPurchasesData);
router.get('/exists', purchaseController.purchaseExists);

module.exports = router;