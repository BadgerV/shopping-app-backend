import mongoose, { isValidObjectId } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Product from "./product.js";
import userSchema from "./userSchema.js";
import { inValidLogin } from "../utils/UtilityFunctions.js";

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
    inValidLogin("Invalid login credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Incorrect password");
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
    user.password = newPassword;
    await user.save();
  } else {
    throw new error("Cannot change password");
  }
};

//this is to generate auth tokens for the usrs for authentication
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign(
    { _id: user._id.toString() },
    "thisisjustthebeginnigofgreateness",
    {
      expiresIn: "1d",
    }
  );

  user.tokens = user.tokens.concat({ token });

  return token;
};

//this is to has the password before signup or before the password is cahnged
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
