const mongoose = require("mongoose");
require("dotenv").config();


mongoose.connect(process.env.URI, {
    useUnifiedTopology: true
}, console.log("Server is running"))

