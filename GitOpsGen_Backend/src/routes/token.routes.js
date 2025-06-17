const express = require('express');
const router = express.Router();
const { updateGitlabToken } = require('../controllers/token.controller');

router.post('/update-token', updateGitlabToken);

module.exports = router;
