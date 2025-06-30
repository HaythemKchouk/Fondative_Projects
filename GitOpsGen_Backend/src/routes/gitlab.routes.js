const express = require('express');
const router = express.Router();
const gitlabController = require('../controllers/gitlab.controller');

router.get('/groups', gitlabController.getGitlabGroups);
module.exports = router;
