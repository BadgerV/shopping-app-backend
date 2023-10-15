const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Product = require("./product");
const { userSchema } = require("./userSchema");

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
    user.password = newPassword;
    console.log(user.password);
    await user.save();
  } else {
    throw new error("Cannot change password");
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
