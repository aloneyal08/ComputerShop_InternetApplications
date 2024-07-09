const express = require('express');
var router = express.Router();

const purchaseController = require('../controllers/purchase');

router.post('/buy-one', purchaseController.makePurchase);

module.exports = router;