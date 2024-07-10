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
router.put('/update/cart-add', UserController.addToCart);
router.put('/update/background', UserController.updateBackground);
router.delete('/delete', UserController.deleteUser);
router.get('/suppliers', UserController.getSuppliers);
router.get('/admins', UserController.getAdmins);
router.put('/suspend', UserController.suspendAccount);
router.put('/restore', UserController.restoreAccount);
router.get('/emails', UserController.getAllEmails);
router.post('/admin/add', UserController.addAdmin);
router.get('/supplier', UserController.getSupplier);
router.get('/supplier/products', UserController.getSupplierProducts);

module.exports = router;