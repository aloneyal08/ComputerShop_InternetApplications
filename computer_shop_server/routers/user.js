const express = require('express');
var router = express.Router();

const UserController = require('../controllers/user');

router.post('/register', UserController.register);
router.post('/login', UserController.login);

module.exports = router;