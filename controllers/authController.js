/* eslint-disable node/no-unsupported-features/es-syntax */
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    // Remove password from the output
    user.password = undefined;

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    }
    const newUser = await User.create(user);

    createSendToken(newUser, 201, res);

    // const token = signToken(newUser._id)

    // res.status(201).send({
    //     status: 'success',
    //     token
    // })
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please enter a valid email and password', 400));
    }
    const user = await User.findOne({ email: email }).select('+password');
    //  console.log(user.password)
    const correctPassword = await user.correctPassword(password, user.password);

    if (user && correctPassword) {

        createSendToken(user, 200, res);

        // const token = signToken(user._id)

        // res.status(200).send(
        //     {
        //         status: 'success',
        //         token
        //     })
    } else if (!correctPassword) {
        next(new AppError('The specified password is incorrect', 400));
    } else {
        next(new AppError('The specified user does not exist', 404))
    }
});

exports.protect = catchAsync(async (req, res, next) => {
// console.log(req.cookies);
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        ({ token } = req.cookies);
    };

    if (!token) {
        next(new AppError('There is no authorization token found in the request', 401))
    };

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user._id) {
        next(new AppError('The specified token is invalid', 401));
    }

    //checking if user has changed password after JWT was generated
    if (await user.changedPasswordAfter(decoded.iat)) {
        next(new AppError('The specified token is invalid!!', 401));
    }
    req.user = user;
    res.locals.user = user;
    //  console.log(req.user);
    next();
});

exports.isLoggedIn = async (req, res, next) => {

    if (req.cookies.token) {
        try {
            const { token } = req.cookies;

            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id);
            if (!user._id) {
                next(new AppError('The specified token is invalid', 401));
            }

            //checking if user has changed password after JWT was generated
            if (await user.changedPasswordAfter(decoded.iat)) {
                next(new AppError('The specified token is invalid!!', 401));
            }
            // if(!user) next()
            res.locals.user = user;
        } catch (err) {
            console.log(err);
            next()
        }
       
    };
    next();
};

exports.restrictTo = (...roles) => (req, res, next) => {

    if (!roles.includes(req.user.role)) {
        return next(new AppError('You do no have access permission for this route', 401));
    }

    next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) next(new AppError('This email does not exist', 404));

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    const message = `submit your reset password to this link: ${resetUrl} to reset your password,\n if not requested by you please ignore`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'you password reset token (valid for 10 min )',
            message
        });

        res.status(200).json({ status: 'success', message: 'your reset password has been sent to your mail, please check your inbox' });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.save({ validateBeforeSave: false });

        return next(new AppError('there was an unexpected error resetting you token please try again', 500))
    }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError('The token has expired or invalid', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);

    // const token = signToken(user._id);

    // res.status(200).json({ status: 'success', token });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const correctPassword = await user.correctPassword(req.body.oldPassword, user.password);

    if (!correctPassword) next(new AppError('The old password is incorrect', 401));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, res);

    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     message: 'Password updated successfully',
    //     token
    // });
});