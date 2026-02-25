const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, phone, password, role, location, language, pincode } = req.body;

        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }

        user = new User({
            name,
            phone,
            password: phone, // Always use phone as password
            role: role || 'worker',
            location: location || { type: 'Point', coordinates: [0, 0] },
            language: language || 'en',
            pincode
        });

        await user.save();

        res.status(201).json({
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                location: user.location,
                language: user.language
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user (Engineer/Worker)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { phone, password, language } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        // Use phone as password since we are removing password field from UI
        const loginPassword = password || phone;

        const isMatch = await user.comparePassword(loginPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        // Update language preference if provided during login
        const supportedLangs = ['en', 'hi', 'bn', 'te', 'mr'];
        if (language && supportedLangs.includes(language)) {
            user.language = language;
            await user.save();
        }

        res.json({
            token: generateToken(user),
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                location: user.location,
                language: user.language
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
