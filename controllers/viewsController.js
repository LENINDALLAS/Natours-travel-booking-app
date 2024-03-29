const Tour = require('../models/tourModels');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
//const Review = require('models/reviewModel');

const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {

    const tours = await Tour.find();
    // console.log(tours)

    res.status(200).render('overview', { title: 'All tours', tours })
});

exports.getBookings = catchAsync(async (req, res, next) => {
    const allTours = await Booking.find({ user: req.user.id }).populate('tour');
    const tours = allTours.map(trip => trip.tour);

    if (!tours) return next(new AppError('Tour not found', 404));

    res.status(200).render('overview', { title: 'Bookings', tours })
});

exports.getTour = catchAsync(async (req, res, next) => {

    // console.log(req.cookies)

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' });

    if (!tour) {
        return next(new AppError('No tour found', 404));
    }
    //const reviews = await Review.find({tour: tour._id});
    // tour.reviews = reviews;
    //  console.log(tour);

    res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', { title: 'Login' })
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', { title: 'Account', user: req.user });
};

exports.updateUserData = async (req, res) => {
    // console.log(req.body, 'query', req.query);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
        {
            new: true,
            runValidators: true,
        });
    res.status(200).render('account', { title: 'Account', user: updatedUser });
};

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if(alert === "booking") {
        res.locals.alert = "Your booking is successfull, Enjoy your tour"
    }
    next()
}