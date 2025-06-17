const express = require('express');
const router = express.Router();
const controller = require('../controllers/gitlabhelmchart.controller');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // Limite 10 Mo
router.get('/groups', controller.getGroups);
router.get('/groups/:id/subgroups', controller.getSubgroups);
router.get('/groups/:id/projects', controller.getProjects);

// Correspond à fetch(`/projects/${id}/repository/tree?path=...`)
router.get('/projects/:projectId/repository/tree', controller.getTree);
// Ici on autorise plusieurs fichiers (clé: "files")
router.post('/upload', upload.array('files'), controller.commitFiles);
// Correspond à fetch('/upload', { method: 'POST' })
router.post('/upload', controller.commitFiles);

module.exports = router;
