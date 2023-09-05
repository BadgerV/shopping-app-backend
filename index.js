const express = require("express");
require("./db/db");
const userRouter = require("./routers/user");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/v1", userRouter);

app.listen(3000, () => {
  console.log("listening at port 3000");
});