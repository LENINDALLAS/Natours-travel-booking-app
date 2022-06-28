/* eslint-disable node/no-unsupported-features/es-syntax */
const multer = require('multer');
// const sharp = require('sharp');
const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {

    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('The uploaded file is not an image! please upload an image file', 400), false)
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// upload.single('photo')
// upload.array('photo', 5)
exports.uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 }
]);


exports.resizeTourImages = (req, res, next) => {
    console.log(req.files ) 
    next();
};
// exports.resizeUserPhoto = (req, res, next) => {
//     if (!req.file) return next();

//     req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

//     sharp(req.file.buffer)
//         .resize(500, 500)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`public/img/users/${req.file.filename}`);

//     next();
// };

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = 'price,-ratingsAverage';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = getAll(Tour)
// exports.getAllTours = catchAsync(async (req, res) => {

//     // Total pages
//     const totalDocuments = await Tour.countDocuments();

//     if ((req.query.page || 1) > (Math.round(totalDocuments / req.query.limit) || 1)) {
//         throw new Error('This page is not available')
//     }
//     // console.log(Math.round(totalDocuments / req.query.limit));
//     // Execute query

//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//     const tours = await features.query;

//     // Send result
//     res.status(200).json({
//         status: "success",
//         results: tours.length,
//         // totalPages: totalDocuments / req.query.limit,
//         data: {
//             tours
//         }
//     });
// });

exports.getTour = getOne(Tour, { path: 'reviews' });         // can be written as NOTE:'reviews' in parameters passed
// exports.getTour = catchAsync(async (req, res) => {

//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     res.status(200).json({
//         status: "success",
//         data: {
//             tour
//         }
//     });
// });

exports.createTour = createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {

//     const newTour = await Tour.create(req.body);

//     res.status(200).json({
//         status: "success",
//         data: newTour
//     });

//     // try {
//     //     // const newTour = new Tour({});
//     //     // newTour.save()
//     //     const newTour = await Tour.create(req.body);

//     //     res.status(200).json({
//     //         status: "success",
//     //         data: newTour
//     //     });
//     // } catch (error) {
//     //     res.status(400).json({
//     //         status: "Fail",
//     //         message: error
//     //     });
//     // };
// });

exports.updateTour = updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res) => {

//     const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });

//     res.status(200).json({
//         status: "OK",
//         data: {
//             tour: updatedTour
//         }
//     })
// });

exports.deleteTour = deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res) => {

//     await Tour.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//         status: "success",
//         data: null
//     });
// });

exports.getToursStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numRatings: { $sum: '$ratingsQuantity' },
                num: { $sum: 1 },
                avgRating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // ,
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ])
    //   console.log(stats);

    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    });
});

exports.getBusyTourDates = catchAsync(async (req, res) => {
    const year = Number(req.params.year);
    //  console.log(year);
    const busyTourDates = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                dates: { $push: '$startDates' },
                names: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {                           // To exclude fields
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $skip: 2
        },
        {
            $limit: 2
        }

    ]);

    res.status(200).json({
        status: "success",
        results: busyTourDates.length,
        data: {
            busyTourDates
        }
    });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(
            new AppError("The latitude and longitude entered must be in latitude,longitude format", 400)
        )
    };

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    res.status(200).json({
        status: "success",
        result: tours.length,
        data: {
            data: tours
        }
    })

});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const multiplier = unit === "mi" ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(
            new AppError("The latitude and longitude entered must be in latitude,longitude format", 400)
        )
    };

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            data: distances
        }
    })
});