const express = require('express');
var router = express.Router();

const UserController = require('../controllers/user');

router.post('/register', UserController.register);

module.exports = router;