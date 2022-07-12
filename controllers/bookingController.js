const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync( async (req, res, next) => {
    
    const tour = await Tour.findById(req.params.tourId);

    if(!tour) {
        next(new AppError('No tour found', 404));
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], 
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email, 
        client_reference_id: req.params.tourId, 
        line_items: [
            {
                name: `${tour.name} Tour`, 
                description: tour.summary,
                images: [`change it `],
                amount: tour.price * 100, 
                currency: 'inr',
                quantity: 1
            }
        ]

    });

    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if(!tour && !user && !price) return next();

    if (req.query && tour && user && price) {
        const booking = new Booking({
            tour,
            user,
            price,
        });
        await booking.save();
    }
   res.redirect(req.origin.split('?')[0]);
});