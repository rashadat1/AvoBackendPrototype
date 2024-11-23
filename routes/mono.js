const express = require('express');
const { exchange_code } = require('../controllers/monoController');

const router = express.Router();

router.post('/exchange-code', exchange_code);

module.exports = router;