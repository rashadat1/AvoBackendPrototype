require('dotenv').config();
// const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
/*
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
*/
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB with URI:', uri);
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });
        // Connect the client to the server	(optional starting in v4.7)
        console.log('MongoDB connected successfully');

    } catch(error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;