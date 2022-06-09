const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');

const filteredObj = (body, ...allowedFields) => {
    const filtered = {};
    allowedFields.forEach(field => { if (body[field]) filtered[field] = body[field] });
    return filtered;
};

exports.getAllUsers = getAll(User);
// exports.getAllUsers = catchAsync(async (req, res) => {

//     const users = await User.find()

//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: {
//             users
//         }
//     });
// });

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {

    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Please use the update password option to update your password', 400));
    };

    const filteredBody = filteredObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidator: true
    }).select('-__v -role');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync (async(req, res, next) => {
 await User.findByIdAndUpdate(req.user.id, {active: false});

 res.status(204).json({
     status: 'success',
     data: null
 });
});

exports.createUser = createOne(User)

exports.getUser = getOne(User)

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

