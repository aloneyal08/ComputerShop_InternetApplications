const express = require('express');
var router = express.Router();

const tagController = require('../controllers/tag');

router.get('/get', tagController.getTags);

module.exports = router;