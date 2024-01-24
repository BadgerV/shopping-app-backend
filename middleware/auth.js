import jwt from "jsonwebtoken";
import User from "../models/user.js";

//AUTH MIDDLEWARE

const auth = async (req, res, next) => {
  const secret = process.env.SECERT;

  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "thisisjustthebeginnigofgreateness");
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send({ error: "Please authenticate" });
  }
};
export default auth;