const Tour = require('../models/tourModels');
//const Review = require('../models/reviewModel');

const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {

    const tours = await Tour.find();
   // console.log(tours)

    res.status(200).render('overview', { title: 'All tours', tours })
});

exports.getTour = catchAsync(async (req, res) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({path: 'reviews', fields: 'review rating user'});
    //const reviews = await Review.find({tour: tour._id});
   // tour.reviews = reviews;
    console.log(tour.name)

    res.status(200).render('tour', {title: `${tour.name} Tour`, tour});
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', { title: 'Login' })
};