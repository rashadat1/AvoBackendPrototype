const axios = require('axios');
const AccountToken = require('../models/AccountToken');
require('dotenv').config();

exports.getBalance = async (req, res) => {
    const { customerID } = req.body;
    console.log('Received request to get balance for customerID: ', customerID);
    try {
        const accountTokens = await AccountToken.find({ customerID: customerID });
        if (accountTokens.length === 0) {
            return res.status(200).json({ totalBalance: 0});
        }

        const balances = await Promise.all(
            accountTokens.map(async (token) => {
                const response = await axios.get(`https://api.withmono.com/v2/accounts/${token.apiAuthToken}/balance`, {

                    headers: {
                        'Content-Type': 'application/json',
                        'accept': 'application/json',
                        'mono-sec-key': process.env.MONO_SECRET_KEY,
                    },
                });
                console.log(`Balance for account ${token.apiAuthToken}: ${response.data.data.balance}`);
                return { accountId: token.apiAuthToken, balance: parseFloat(response.data.data.balance) }
            })
        );
        // accumulator function that reduces the balances array into a single value
        // units are in kobo not naira
        const totalBalance = balances.reduce((sum, account) => sum + account.balance / 100, 0);
        console.log('The total balance is: ', totalBalance);
        res.status(200).json({ totalBalance, });
        } catch(error) {
            console.error('Error fetching balance:', error);
        }
};

exports.getTransactionsWithFilters = async (req, res) => {
    const { customerID } = req.body;
    // req.query.parameter will be undefined if it is not in the URL
    // start is provided, end will be too and vice versa 
    // if dates, type, or narration provided - then limit will be empty to get all
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const start = req.query.start;
    const end = req.query.end;
    const type = req.query.type;
    const narration = req.query.narration;

    console.log('Received request to get recent transactions for CustomerID:', customerID);

    try {
        const accessTokens = await AccountToken.find({ customerID: customerID });
        if (accessTokens.length === 0) {
            return res.status(200).json({ transactions: 'No Recent Transactions' });
        }

        const transactions = await Promise.all(
            accessTokens.map( async (token) => {

                let url = `https://api.withmono.com/v2/accounts/${token.apiAuthToken}/transactions?paginate=false`;
                if (limit) url += `&limit=${limit}`;
                if (start) url += `&start=${start}`;
                if (end) url += `&end=${end}`;
                if (type) url += `&type=${type}`;
                if (narration) url += `&narration=${narration}`;

                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': 'application/json',
                        'mono-sec-key': process.env.MONO_SECRET_KEY,
                    },
                });
            console.log('Transaction Response from Mono:', response);
            return response.data.data;
            })
        );
        
        const allTransactions = transactions.flat();
        // sort by date in descending order (most recent first) 
        const sortedTransactions = allTransactions.sort((a,b) => new Date(b.date) - new Date(a.date));
        // if there is a limit provided we only retrieve the top limit number of transactions
        const limitedTransactions = limit ? sortedTransactions.slice(0, limit) : sortedTransactions;
        console.log('Transactions for this customer:', limitedTransactions);
        return res.status(200).json({ transactions: limitedTransactions });

    } catch(error) {
        console.error('Error fetching transactions', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

exports.getAllTransactions = async (req, res) => {
    const { customerID } = req.body;
    console.log('Received Request to retrieve all transactions for customerID: ', customerID);
    try {
        const accessTokens = await AccountToken.find({ customerID: customerID });
        if (accessTokens.length === 0) {
            return res.status(200).json({ transactions : 'No Recent Transactions' });
        }

        const transactions = await Promise.all(
            accessTokens.map( async (token) => {
                const response = await axios.get(`https://api.withmono.com/v2/accounts/${token.apiAuthToken}/transactions?paginate=false&limit=10`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': 'application/json',
                        'mono-sec-key': process.env.MONO_SECRET_KEY,
                    },

                });
                console.log('Transaction Response from Mono:',response)
                return response.data.data;
            })
        
        );
        // Flatten the array of arrays into a singular array of transactions
        const allTransactions = transactions.flat();
        console.log('All of the transaction for this customer:',allTransactions);

        return res.status(200).json({ transactions: allTransactions });
    } catch(error) {
        console.error('Error fetching transactions', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};