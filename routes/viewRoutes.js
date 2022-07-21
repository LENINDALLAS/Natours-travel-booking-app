const express = require('express');
const { protect, isLoggedIn } = require('../controllers/authController');
const { getOverview, getTour, getLoginForm, getAccount, updateUserData, getBookings } = require('../controllers/viewsController');
const { alerts } = require('../controllers/viewsController');
// const { createBookingCheckout } = require('../controllers/bookingController');

const router = express.Router();

router.use(alerts);

router.route('/').get( isLoggedIn, getOverview);
router.route('/tours/:slug').get(isLoggedIn, getTour);
router.route('/login').get(isLoggedIn, getLoginForm);
router.route('/me').get(protect, getAccount);
router.route('/submit-user-data').post(protect, updateUserData);
router.route('/my-bookings').get(protect, getBookings);

module.exports = router;