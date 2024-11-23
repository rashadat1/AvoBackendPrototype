const express = require('express');

const router = express.Router();

// Example of a simple route
router.get('/', (req, res) => {
    res.send('API is running...');
});

// Example of a health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

module.exports = router;