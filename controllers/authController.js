const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
    // extracts the email and password combination provided from the request body
    const { email, password } = req.body;

    try {
        // userExists = True if the email is already registered. False if it is not registered
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'This email is already registered'})
        }
        // creates a new record if the email is not already in the database
        const user = new User({ email, password });
        user.customerID = user.createCustomerID();
        
        await user.save();

        const token = jwt.sign({ id: user._id, customerID: user.customerID }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.status(201).json({ token });
        } catch (error) {
            console.error('Error in register:', error)
            res.status(500).json({ message: 'Server error'});
        }
};

exports.login = async (req, res) => {
    // extracts the email and password combination provided from the request body
    const { email, password } = req.body;
    
    try {
        // checks to see if the email is registered, and if the password matches the password for the supplied email
        // if either condition is not satisfied an error message is thrown
        const user = await User.findOne({ email });
        if (!user) {
            console.error('Login error: Invalid credentials (username)')
            return res.status(400).json({ message: 'Username, Password combination does not match an existing record.'});
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.error('Login error: Invalid credentials (password)')
            return res.status(400).json({ message: 'Username, Password combination does not match an existing record.'});
        }

        const token = jwt.sign({ id: user._id, customerID: user.customerID }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.status(200).json({ token });
        } catch(error) {
            console.error('Error in login:',error)
            res.status(500).json({ message: 'Server error' });
        }

};