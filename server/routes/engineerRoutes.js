const express = require('express');
const router = express.Router();
const { getNearbyWorkers, trackCall } = require('../controllers/engineerController');
const { auth, authorize } = require('../middleware/auth');

router.get('/workers', auth, authorize('engineer'), getNearbyWorkers);
router.patch('/workers/:id/call', auth, authorize('engineer'), trackCall);

module.exports = router;
