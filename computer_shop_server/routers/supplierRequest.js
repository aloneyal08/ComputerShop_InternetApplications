const express = require('express');
var router = express.Router();

const SupplierRequestController = require('../controllers/supplierRequest');

router.post('/create', SupplierRequestController.createRequest);

module.exports = router;