const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    customerID: { type: String, required: true, unique: true},
});

// the pre-save hook is used to hash the password before it is saved to the database
userSchema.pre('save', async function(next) {
    // next is a callback function that is called when middleware is done to allow
    // save operation to be done and then continue to the next middleware
    if (!this.isModified('password')) return next();
    // the salt is used to add randomness to the hashing process to make it more secure
    const salt = await bcrypt.genSalt(10);
    // hash password using the salt generated and assign the hash to the password field
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// defines a method called matchPassword. the function takes enteredPassword
// the plain text password entered by user and compares the password with the hashed password in the database
// returns true if they patch and false if they don't
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createCustomerID = function () {
    return crypto.createHash('sha256').update(this.email).digest('hex');
};


// creates a Mongoose model named 'User' based on the userSchema
const User = mongoose.model('User', userSchema);
module.exports = User;