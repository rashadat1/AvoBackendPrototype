const express = require('express');
const { register, login } = require('../controllers//authController');

const router = express.Router();

// define a route for handling post requests to /register and /login
// when a post request is sent the register or login functions from authController.js are executed
router.post('/register', register);
router.post('/login', login);

module.exports = router;