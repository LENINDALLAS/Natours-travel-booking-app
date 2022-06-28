const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');


// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const extention = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}-.${extention}`);
//     }
// });

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
})

const filteredObj = (body, ...allowedFields) => {
    const filtered = {};
    allowedFields.forEach(field => { if (body[field]) filtered[field] = body[field] });
    return filtered;
};

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

    next();
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
    // console.log(req.headers);
    // console.log(req.body);
    // console.log(req.file);

    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Please use the update password option to update your password', 400));
    };

    const filteredBody = filteredObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

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

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = createOne(User)

exports.getUser = getOne(User)

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

