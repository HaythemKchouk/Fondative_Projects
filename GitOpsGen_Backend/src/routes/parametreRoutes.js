const express = require('express');
const router = express.Router();
const userController = require('../controllers/parametreController');

router.post('/update', userController.updateUser);

module.exports = router;
