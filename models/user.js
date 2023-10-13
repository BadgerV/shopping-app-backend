const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("./product");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please provide an email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot include passord");
        }
      },
    },
    isVendor: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to your Product model
      },
    ],

    avatar: {
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
    matricNumber: {
      type: String,
      maxLength: 8,
      trim: true,
      unique: true,
    },
    DOB: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.virtual("product", {
  ref: Product,
  localField: "_id",
  foreignField: "owner",
});

//this is to compare the password with the already hashed passowrd
userSchema.statics.findByCredentials = async function (password, email) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Failed to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Failed to login");
  }

  return user;
};

//this is to compare password provided by the user when there is about to be a change in passwords
userSchema.statics.compareAndChangePasswords = async function (
  email,
  password,
  newPassword
) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User does not exist!");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    user.password = await bcrypt.hash(newPassword, 8);
    await user.save();
    return user;
  } else {
    throw new error("Cannot change password")
  }
};

//this is to generate auth tokens for the usrs for authentication
userSchema.methods.generateAuthToken = async function () {
  user = this;
  const secret = process.env.SECERT;

  const token = jwt.sign(
    { _id: user._id.toString() },
    "thisisjustthebeginnigofgreateness",
    {
      expiresIn: "1d",
    }
  );

  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};

//this is to has the password before signup or before the password is cahnged
userSchema.pre("save", async function (next) {
  user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
