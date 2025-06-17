const express = require('express');
const controllers = require('../controllers/formulaire.controller');

const router = express.Router();

router.get('/groups/top', controllers.getTopGroups);
router.get('/groups/:groupId/subgroups', controllers.getSubGroups);
router.get('/groups/:groupId/projects', controllers.getProjects);
router.get('/repo-tree/:projectId', controllers.getRepoTree);
router.get('/repo-file/:projectId', controllers.getFileContent);
router.post('/commit/:projectId', controllers.commitFile);

module.exports = router;
