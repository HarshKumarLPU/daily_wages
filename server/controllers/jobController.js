const Job = require('../models/Job');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Engineer)
exports.createJob = async (req, res) => {
    try {
        const { title, description, pincode, coordinates, salary } = req.body;

        if (!title || !description || !pincode || !coordinates) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const job = await Job.create({
            title,
            description,
            pincode,
            location: {
                type: 'Point',
                coordinates: coordinates // [longitude, latitude]
            },
            engineer: req.user.id,
            salary
        });

        res.status(201).json({
            message: 'Job posted successfully',
            job
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all jobs posted by the logged-in engineer
// @route   GET /api/jobs/engineer
// @access  Private (Engineer)
exports.getEngineerJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ engineer: req.user.id }).sort('-createdAt');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get nearby jobs for workers
// @route   GET /api/jobs/nearby
// @access  Private (Worker)
exports.getNearbyJobs = async (req, res) => {
    try {
        const { lng, lat, radius = 50 } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: 'Longitude and latitude are required' });
        }

        const radiusInMeters = parseFloat(radius) * 1000;

        const jobs = await Job.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radiusInMeters
                }
            }
        }).populate('engineer', 'name phone');

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
