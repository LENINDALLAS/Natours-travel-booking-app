const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync( async (req, res, next) => {
    
    const tour = await Tour.findById(req.params.tourId);

    if(!tour) {
        next(new AppError('No tour found', 404));
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], 
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email, 
        client_reference_id: req.params.tourId, 
        line_items: [
            {
                name: `${tour.name} Tour`, 
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     const { tour, user, price } = req.query;

//     if(!tour && !user && !price) return next();

//     if (req.query && tour && user && price) {
//         const booking = new Booking({
//             tour,
//             user,
//             price,
//         });
//         await booking.save();
//     }
//    res.redirect(req.origin.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
    try {
        const tour = session.client_reference_id;
        const user = (await User.findOne({ email: session.customer_email })).id;
        const price = session.amount_subtotal / 100;

        if (tour && user && price) {
            const booking = new Booking({
                tour,
                user,
                price,
            });
            await booking.save();
        }
    } catch(error) {
        console.error("Error saving payment to database:" , error)
    }
    
//    res.redirect(req.origin.split('?')[0]);
};

exports.webhookCheckout = catchAsync( async(req, res, next) => {
 const signature = req.headers["stripe-signature"];

 let event;
 try {
    event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.WEBHOOK_SIGNING_SECRET
    );
 } catch (error) {
   return res.status(400).send(`Webhook error: ${error.message}`)
 };

 if(event.type === "checkout.session.completed") 
   createBookingCheckout(event.data.object);

 res.status(200).json({received: true});
});

