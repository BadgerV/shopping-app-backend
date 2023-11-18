import express from "express";
import "./db/db.js";
import userRouter from "./routers/user.js";
import productRouter from "./routers/product.js";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

/*CONFIGURATION*/
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*", // Replace with the domain of your client app
  })
);

/*ROUTES */
app.use("/v1/user", userRouter);
app.use("/v1/product", productRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("listening at port 3000");
}); 
