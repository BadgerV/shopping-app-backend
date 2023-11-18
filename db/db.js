import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(
  process.env.URI,
  {
    useUnifiedTopology : true,
    useUnifiedTopology : true
  },
  console.log("Server is running")
);
