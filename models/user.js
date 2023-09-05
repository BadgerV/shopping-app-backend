const  mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Product = require('./product')


const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required: true,
        trim : true

    },
    lastName : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Please provide an email")
            }
        }
    },
    password : {
        type : String,
        required : true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes("password")) {
                throw new Error("Password cannot include passord")
            }
        }
    },
    isVendor : {
        type : Boolean,
        default : false
    },
    products : [{
        product : {
            type : String,
        }
    }],
    avatar : {
        type : Buffer
    },
    tokens : [{
        token : {
            type : String,
        }
    }],
}, {
    timestamps : true
})

userSchema.virtual("product", {
    ref : Product,
    localField : "_id",
    foreignField : "owner"
})

//this is to compare the password with the already hashed passowrd
userSchema.statics.findByCredentials = async function(password, email) {
    const user = await User.findOne({email});

    if(!user) {
        throw new Error('Failed to login')
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error("Failed to login")
    }

    return user
}


//this is to generate auth tokens for the usrs for authentication
userSchema.methods.generateAuthToken = async function() {
    user = this;
    const secret = process.env.SECERT;

    const token = jwt.sign({_id : user._id.toString()}, "thisisjustthebeginnigofgreateness");

    user.tokens = user.tokens.concat({token});

    await user.save();

    return token;
}

//this is to has the password before signup or before the password is cahnged
userSchema.pre('save', async function(next) {
    user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
})
const User = mongoose.model('User', userSchema);

module.exports = User;