const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/engineers', require('./routes/engineerRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('DailyWages API is running...');
});

console.log('Environment PORT:', process.env.PORT);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
