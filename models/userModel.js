const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   name: {
       type: String,
       required: [true, 'Please tell us your name!']
   }, 
   email: { 
       type: String, 
       required: [true, 'Please tell us your email!'],
       unique: true, 
       lowercase: true, 
       validate: [validator.isEmail, 'Provided email is not a valid email']
    }, 
    photo: { 
        type: String, 
        default: 'default.jpg'
    }, 
    role: { 
        type: String, 
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: { 
        type: String, 
        required: [true, 'Please enter a valid password'], 
        minlength: 8,
        select: false
    }, 
    passwordConfirm: {
        type: String,
        required:true,
        validate: {
            validator: function(el) {
                //works only on create and save methods
                return el === this.password;
            },
            message: 'Password does not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true, 
        select: false
    }
}, {timeStamp: true});

//When the password has been changed the passwordChangedAt field is updated using this pre method 
userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = new Date(new Date().getTime() - 1000);
    next();
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({active: { $ne : false}});
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  //  console.log(await bcrypt.compare(candidatePassword, userPassword))
return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function(JWTTimestamp) {
   if(this.passwordChangedAt) {
       const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
       return changedTimestamp > JWTTimestamp;
   }
   return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    this.passwordResetExpires = new Date(new Date().getTime() + 10 * 60 * 1000);

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);
