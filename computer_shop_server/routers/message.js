const express = require('express');
var router = express.Router();

const messageController = require('../controllers/message');

router.post('/create', messageController.createMessage);
router.get('/', messageController.getMessages);
router.get('/supplier', messageController.getSupplierMessage);

module.exports = router;