const express = require('express');
var router = express.Router();

const UserController = require('../controllers/user');

router.post('/id-get', UserController.getUserById);
router.get('/get-suppliers', UserController.getSuppliers);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.put('/update/profile', UserController.updateUserProfile);
router.put('/update/username', UserController.updateUsername);
router.put('/update/password', UserController.updatePassword);
router.delete('/delete', UserController.deleteUser);

module.exports = router;