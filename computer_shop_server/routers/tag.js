const express = require('express');
var router = express.Router();

const tagController = require('../controllers/tag');

router.get('/get', tagController.getTags);
router.post('/add', tagController.addTag);
router.delete('/delete', tagController.deleteTag);
router.put('/edit', tagController.editTag);

module.exports = router;