const express = require('express');
const { getBalance, getAllTransactions, getTransactionsWithFilters } = require('../controllers/accountInfoController');

const router = express.Router();

router.post('/balance', getBalance);
router.post('/all-transactions', getAllTransactions);
router.post('/filtered-transactions', getTransactionsWithFilters);

module.exports = router;