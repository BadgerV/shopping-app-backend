const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = express.Router();

//signup code
router.post("/user/signup", async (req, res) => {
  const newUser = new User(req.body);
  try {
    const token = await newUser.generateAuthToken();
    await newUser.save();

    res.status(200).send({ newUser, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//signin code
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.password,
      req.body.email
    );
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

//this route allows users to access tthier profile
router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});

//allows users to become vendors
router.post("/user/be-vendor", auth, async (req, res) => {
  try {
    req.user.isVendor = true;

    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
  ``;
});

//allows users to update their profile
router.patch("/user/patch", auth, async (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;
  const user = req.user;

  if (firstName) {
    user.firstName = firstName;
  }

  if (lastName) {
    user.lastName = lastName;
  }

  if (email) {
    user.email = email;
  }

  if (phoneNumber) {
    user.phoneNumber = phoneNumber;
  }
  try {
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//allows users to logout
router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send("You have logged out successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = router;
