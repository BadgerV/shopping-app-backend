import express from "express";
import User from "../models/user.js";
import auth from "../middleware/auth.js";
const router = express.Router();

import multer from "multer";
import sharp from "sharp";
import { checkValidation } from "../utils/UtilityFunctions.js";

//signup code
router.post("/signup", async (req, res) => {
  const newUser = new User(req.body);
  try {
    checkValidation(
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password
    );

    const alreadyUser = await User.findOne({ email: req.body.email });

    if (alreadyUser) {
      throw new Error("Email already exists");
    }
    const token = await newUser.generateAuthToken();
    await newUser.save();

    res.status(200).send({ newUser, token });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

//signin code
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.password,
      req.body.email
    );
    const token = await user.generateAuthToken();

    await user.save();

    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//this route allows users to access tthier profile
router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

//multer code
const upload = multer({
  limits: {
    fileSize: 1000000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});

//allows users to become vendors
router.post("/be-vendor", auth, upload.single("avatar"), async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    const {
      matricNumber,
      DOB,
      gender,
      motto,
      department,
      firstCategory,
      secondCategory,
      thirdCategory,
    } = req.body;

    if (!matricNumber || !DOB || !gender || !motto || !department || !buffer) {
      res.status(400).send("Please input all fields");
    }

    if (firstCategory !== "") {
      req.user.categoriesToBeSold.push(firstCategory);
    }

    if (secondCategory !== "") {
      req.user.categoriesToBeSold.push(secondCategory);
    }

    if (thirdCategory !== "") {
      req.user.categoriesToBeSold.push(thirdCategory);
    }

    req.user.matricNumber = matricNumber;
    req.user.DOB = new Date(DOB);
    req.user.gender = gender;
    req.user.motto = motto;
    req.user.department = department;
    req.user.avatar = buffer;
    req.user.isVendor = "pending";

    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//allows users to update their profile
router.post("/patch", auth, async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, newPassword } =
    req.body;
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
    if (password && newPassword) {
      const user = await User.compareAndChangePasswords(
        email,
        password,
        newPassword
      );
    }
    await user.save();

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

//allows users to logout
router.post("/logout", auth, async (req, res) => {
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
//allows users to search for oter users or vendors and access their page sha
router.get("/get-user/:id", async (req, res) => {
  try {
    const foundUser = await User.findOne({ _id: req.params.id });

    res.status(200).send(foundUser);
  } catch (error) {
    res.status(400).json(`error : There was an error`);
  }
});

export default router;
