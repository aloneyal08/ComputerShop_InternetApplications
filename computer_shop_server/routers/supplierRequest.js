const express = require('express');
var router = express.Router();

const SupplierRequestController = require('../controllers/supplierRequest');

router.post('/create', SupplierRequestController.createRequest);
router.get('/accept', SupplierRequestController.acceptRequest);
router.get('/reject', SupplierRequestController.rejectRequest);
router.get('/cancel', SupplierRequestController.cancelRequest);

module.exports = router;