// routes/argo.routes.js
const express = require('express');
const router = express.Router();
const argoController = require('../controllers/argo.controller');

router.get('/applications', argoController.getArgoApplications);

module.exports = router;
