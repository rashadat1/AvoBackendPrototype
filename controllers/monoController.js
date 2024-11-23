const axios = require('axios');
require('dotenv').config();
const AccountToken = require('../models/AccountToken');

exports.exchange_code = async (req, res) => {
    const { token, customerID, institution, institutionId } = req.body;
    console.log('POST request from the frontend: ',req.body)
    try {
        // send POST request to this API endpoint to exchange the token for a unique - per account access token
        // this token is unique per user per bank per account
        const response = await axios.post('https://api.withmono.com/v2/accounts/auth', {
            code: token,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'mono-sec-key': process.env.MONO_SECRET_KEY,
            },
        });
        
        const accessToken = response.data.data.id;
        console.log("Full Mono Response: ", response);

        console.log("The retrieved token is:", accessToken);
        const accountToken = new AccountToken({ customerID: customerID, apiAuthToken: accessToken, institutionName: institution, institutionId: institutionId });
        console.log("Pushing the following record to Mongodb Atlas:", accountToken);
        console.log("Updating Transactions for this accountID with Transaction Categories.")
        /*
        try {
            const response = await axios.get(`http://https://api.withmono.com/v1/enrichments/${customerID}/transaction-categorisation`,
            headers: {
                'mono-sec-key': process.env.MONO_SECRET_KEY,
            }
        )};
        */
        await accountToken.save();

    } catch(error) {
        console.log('Something went wrong while exchanging the token.');
    }
}