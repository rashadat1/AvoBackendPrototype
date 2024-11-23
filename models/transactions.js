const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customerID: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    type: { type: String },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;