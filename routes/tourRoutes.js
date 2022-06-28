const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  aliasTopTours,
  getToursStats,
  getBusyTourDates,
  updateTour,
  deleteTour,
  getToursWithin,
  getDistances,
  resizeTourImages,
  uploadTourImages
} = require('../controllers/tourController');
const reviewRouter = require('./reviewRoutes');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getToursStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getBusyTourDates);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
