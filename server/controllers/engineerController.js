const User = require('../models/User');

// @desc    Get workers within radius
// @route   GET /api/engineers/workers
// @access  Private (Engineer)
exports.getNearbyWorkers = async (req, res) => {
    try {
        const { lng, lat, radius = 5 } = req.query; // radius in km, default 5km

        if (!lng || !lat) {
            return res.status(400).json({ message: 'Please provide longitude and latitude' });
        }

        // Convert radius from km to meters (MongoDB uses meters for $maxDistance)
        const maxDistance = parseFloat(radius) * 1000;

        const workers = await User.find({
            role: 'worker',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).select('name phone location language');

        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Track call clicks
// @route   PATCH /api/engineers/workers/:id/call
// @access  Private (Engineer)
exports.trackCall = async (req, res) => {
    try {
        const worker = await User.findById(req.params.id);
        if (!worker || worker.role !== 'worker') {
            return res.status(404).json({ message: 'Worker not found' });
        }

        worker.callCount = (worker.callCount || 0) + 1;
        await worker.save();

        res.json({ message: 'Call tracked', callCount: worker.callCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
