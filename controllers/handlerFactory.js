const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeature');
const Tour = require('../models/tourModels');

exports.deleteOne = (model, calcAvg) => catchAsync(async (req, res) => {

    const doc = await model.findByIdAndDelete(req.params.id);

    if (calcAvg === 'calcAvg') {
        const stats = await model.aggregate([
            {
                $match: { tour: doc.tour._id }
            },
            {
                $group: {
                    _id: '$tour',
                    nRating: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);
        await Tour.findByIdAndUpdate(doc.tour._id, { ratingsAverage: stats[0].avgRating, ratingsQuantity: stats[0].nRating });
    };

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.createOne = (model) => catchAsync(async (req, res, next) => {

    const doc = await model.create(req.body);

    res.status(200).json({
        status: "success",
        data: doc
    });
});

exports.updateOne = (Model, calcAvg) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // console.log(doc.calcAverageRatings(doc.tour));
        if (calcAvg === 'calcAvg') {
            const stats = await Model.aggregate([
                {
                    $match: { tour: doc.tour._id }
                },
                {
                    $group: {
                        _id: '$tour',
                        nRating: { $sum: 1 },
                        avgRating: { $avg: '$rating' }
                    }
                }
            ]);
            await Tour.findByIdAndUpdate(doc.tour._id, { ratingsAverage: stats[0].avgRating, ratingsQuantity: stats[0].nRating });
        };

        res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });

exports.getOne = (model, popOptions) => catchAsync(async (req, res) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions)

    const doc = await query;

    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    });
});

exports.getAll = (model) => catchAsync(async (req, res) => {
    // this is a hack to add filter to nested routes - review
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }

    // Total pages
    const totalDocuments = await model.countDocuments();

    if ((req.query.page || 1) > (Math.round(totalDocuments / req.query.limit) || 1)) {
        throw new Error('This page is not available')
    }
    // console.log(Math.round(totalDocuments / req.query.limit));
    // Execute query

    const features = new APIFeatures(model.find(filter), req.query).filter().sort().limitFields().paginate();
    // const doc = await features.query.explain();           NOTE: explain() is used to get details about the query execution and how it is processed
    const doc = await features.query

    // Send result
    res.status(200).json({
        status: "success",
        results: doc.length,
        // totalPages: totalDocuments / req.query.limit,    
        data: {
            data: doc
        }
    });
});