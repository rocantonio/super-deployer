const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const actionsController = require('./actions.controller');

router.get('/deployer/projects', bodyParser.json(), actionsController.getProjects);
router.get('/deployer/orgs', bodyParser.json(), actionsController.getOrgs);
router.post('/deployer/spaces', bodyParser.json(), actionsController.getSpaces);
router.post('/deployer/deploy', bodyParser.json(), actionsController.deployProjects);
module.exports = router;