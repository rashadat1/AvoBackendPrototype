const mongoose = require('mongoose');

const AccountTokenSchema = new mongoose.Schema({
    customerID: { type: String, required: true },
    apiAuthToken: { type: String, required: true, unique: true },
    institutionName: { type: String, required: true },
    institutionId: {type: String, required: true}
});

const AccountToken = mongoose.model('AccountToken', AccountTokenSchema);
module.exports = AccountToken;