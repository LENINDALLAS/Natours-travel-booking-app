const express = require('express');
const { getOverview, getTour, getLoginForm} = require('../controllers/viewsController');

const router = express.Router();

router.route('/').get(getOverview);
router.route('/tours/:slug').get(getTour);
router.route('/login').get(getLoginForm)

module.exports = router;