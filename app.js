/* eslint-disable no-new */
const path = require('path');
const morgan = require('morgan');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const fileupload = require("express-fileupload");
const ratelimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const helmet = require('helmet');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files for rendering
app.use(express.static(path.join(__dirname, 'public')));

//used to set security headers for all requests
// app.use(helmet());

//logging for dev environment
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

//allows only mentioned requests to be processed within specified time
const limiter = ratelimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Request exceeded for this Ip to this route, Please try after an hour'
});

app.use('/api', limiter);

// body parsers
// app.use(fileupload());
app.use(express.json());
app.use(express.urlencoded({limit: '10kb', extended: true}));
app.use(cookieParser())

// Data sanitization (clean up) against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization (clean up) against XSS attacks
app.use(xss());

// To protect from parameter pollution in the query string
// Whitelisting avoids checking for the key in the query string
app.use(hpp({ whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'] }));

//adding time to req for testing purposes
app.use((req, res, next) => {
    // console.log(req)
    req.requestTime = new Date().toISOString();
    next();
});

// app.get('/', (req, res) => {
//     res.status(200).json({ message: "Server is up....", app: "Natours" })
// });

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', postTours);
app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter)

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'Fail',
    //     message: `The path specified by the user (url - ${req.originalUrl} does not exist)`
    // })

    // const err = new Error(`The path specified by the user (url - ${req.originalUrl} does not exists)`);
    // err.status = 'fail';
    // err.statusCode = 404;

    // next(err);
    next(new AppError(`The path specified by the user (url - ${req.originalUrl} does not exists)`, 404));

});

app.use(globalErrorHandler)

module.exports = app;