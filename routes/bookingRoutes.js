const express = require('express');
const {
    getCheckoutSession
} = require('../controllers/bookingController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect);

router.route('/:tourId').get(getCheckoutSession)

module.exports = router;
