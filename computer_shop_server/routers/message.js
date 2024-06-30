const express = require('express');
var router = express.Router();

const messageController = require('../controllers/message');

router.post('/create', messageController.createMessage);
router.get('/', messageController.getMessages);

module.exports = router;