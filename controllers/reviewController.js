const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');

exports.getAllReviews = getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     let filter = {};
//     if(req.params.tourId) filter = { tour : req.params.tourId}
//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status: 'success',
//         data: {
//             reviews
//         }
//     });
// });

exports.postReviews = catchAsync(async (req, res, next) => {

    const review = {
        review: req.body.review,
        rating: req.body.rating,
        tour: req.body.tour || req.params.tourId,
        user: req.body.user || req.user.id       
    };
    const newReview = await Review.create(review);

    res.status(201).json({
        status: 'success',
        results: review.length,
        data: newReview
    });
});

exports.createReview = createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//     const review = {
//         review: req.body.review,
//         rating: req.body.rating,
//         tour: req.params.tourId,
//         user: req.user.id
//     };
//     const newReview = await Review.create(review);

//     res.status(201).json({
//         status: 'success',
//         results: review.length,
//         data: newReview
//     });
// });
exports.updateReview = updateOne(Review, 'calcAvg');
exports.deleteReview = deleteOne(Review, 'calcAvg');
exports.getReview = getOne(Review);