const express = require('express');
const { protect, isLoggedIn } = require('../controllers/authController');
const { getOverview, getTour, getLoginForm, getAccount, updateUserData } = require('../controllers/viewsController');

const router = express.Router();


router.route('/').get(isLoggedIn, getOverview);
router.route('/tours/:slug').get(isLoggedIn, getTour);
router.route('/login').get(isLoggedIn, getLoginForm);
router.route('/me').get(protect, getAccount);
router.route('/submit-user-data').post(protect, updateUserData);

module.exports = router;