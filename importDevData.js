const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Tour = require('./models/tourModels');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');

const DB = process.env.MONGODB_URL.replace(/'/g, '').replace('<PASSWORD>', process.env.PASSWORD);
mongoose.connect(DB, {});
mongoose.connection.once('open', () => {
    console.log("Database connection successfully established...");
});

mongoose.connection.on('error', () => {
    console.log("Unable to connect to database");
});

//Read JSON file 

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
        console.log("data successfully loaded");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

//Delete data from DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("database deleted successfully");
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}

//console.log(process.argv)