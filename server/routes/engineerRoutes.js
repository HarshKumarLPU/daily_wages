const express = require('express');
const router = express.Router();
const { getNearbyWorkers } = require('../controllers/engineerController');
const { auth, authorize } = require('../middleware/auth');

router.get('/workers', auth, authorize('engineer'), getNearbyWorkers);

module.exports = router;
