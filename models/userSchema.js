const mongoose = require("mongoose");
const validator = require("validator");

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
      type: String,
      enum: ["false", "true", "pending"],
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
      maxLength: 10,
      trim: true,
      unique: true,
    },
    DOB: {
      type: Date,
      trim: true,
    },
    gender: {
      type: String,
      enum : ["male", "female"],
      trim: true,
    },
    department: {
      type: String,
    },

    categoriesToBeSold: [
      {
        type: String,
      },
    ],
  },

  {
    timestamps: true,
  }
);
exports.userSchema = userSchema;
