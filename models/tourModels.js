/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'The tour must have at most 50 characters'],
        minlength: [10, 'The tour must have at least 40 characters']
    },
    slug: {
        type: String
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a max group size']
    },
    difficulty: {
        type: String,
        required: {
            values: true,
            message: 'A tour must have a difficulty'
        },
        enum: {
            values: ['easy', 'medium', 'hard'],
            message: 'A tour must have a difficulty either "easy", "medium" or "hard"'
        }
        // [true, 'A tour must have a difficulty']        short hand property for the above
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10         // Trick: val multiplied by 10 and divided by 10 will give exact result in decimal format
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    discount: {
        type: Number,
        validate: {            // This validation only runs on new document creation
            validator: function (val) {
                return val < this.price;
            },
            message: 'Tour price must be greater than discount: tour price > {val}'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date]
    ,
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]

},
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

// index is used in mongo to reduce the document scanned for a query 
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere'})

tourSchema.virtual('durationWeeks').get(function () {
    return (this.duration / 7).toFixed(1);
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Document middleware - works only on save and create
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// NOTE : This is a implementation of how to embed/denormalize documents 
// tourSchema.pre('save',async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

tourSchema.post('save', function (doc, next) {
    doc.slug = doc.name.toUpperCase();
    next();
});

// Query middleware 
tourSchema.pre('find', function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
});

// Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline())
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;