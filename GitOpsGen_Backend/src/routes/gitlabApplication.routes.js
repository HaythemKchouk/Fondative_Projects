const express = require('express');
const router = express.Router();
const controller = require('../controllers/gitlabApplication.controller');

router.get('/groups', controller.getFilteredSubGroups);
router.get('/groups/:groupId/projects', controller.getProjects);
router.post('/apps', controller.createAppProject);
router.post('/cicd-folder', controller.createCiCdFolder);

module.exports = router;
