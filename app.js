require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db/connection');

const authRoute = require('./routes/auth')
const indexRoute = require('./routes/index');
const monoRoute = require('./routes/mono');
const accountInfoRoute = require('./routes/accountInfo');

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', indexRoute);
app.use('/api/auth', authRoute);
app.use('/api/mono', monoRoute);
app.use('/api/accountInfo', accountInfoRoute);

// Error handling middleware
//app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});