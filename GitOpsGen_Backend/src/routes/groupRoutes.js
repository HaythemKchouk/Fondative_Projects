const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/groupController');

router.get('/', ctrl.getGitlabGroups);
router.post('/', ctrl.addGroup);

module.exports = router;
