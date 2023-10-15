const express = require("express");
require("./db/db");
const userRouter = require("./routers/user");
const productRouter = require("./routers/product");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*", // Replace with the domain of your client app
  })
);

app.use("/v1", userRouter);
app.use("/v1", productRouter);

app.listen(3000, () => {
  console.log("listening at port 3000");
});
