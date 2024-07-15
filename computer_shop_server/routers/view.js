const express = require('express');
var router = express.Router();

const ViewController = require('../controllers/view');

router.post('/add', ViewController.AddView);
router.get('/get', ViewController.GetViews);

module.exports = router;