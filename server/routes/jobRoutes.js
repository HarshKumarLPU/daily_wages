const express = require('express');
const router = express.Router();
const { createJob, getEngineerJobs, getNearbyJobs } = require('../controllers/jobController');
const { auth, authorize } = require('../middleware/auth');

// @route   POST /api/jobs
// @desc    Create a new job (Engineer Only)
router.post('/', auth, authorize('engineer'), createJob);

// @route   GET /api/jobs/engineer
// @desc    Get all jobs posted by the logged-in engineer
router.get('/engineer', auth, authorize('engineer'), getEngineerJobs);

// @route   GET /api/jobs/nearby
// @desc    Get nearby jobs for workers
router.get('/nearby', auth, authorize('worker'), getNearbyJobs);

module.exports = router;
