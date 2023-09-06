const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const Product = require("../models/product.js");

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 10000000,
  },
});

router.post("/product", auth, upload.single("image"), async (req, res) => {
  const file = req.file.buffer;
  const { name, description } = req.body;
  const owner = req.user.id;


  const newProduct = new Product({
    name,
    description,
    productImage: file,
    owner
  })

  await newProduct.save();

  res.status(201).send(newProduct)
});

module.exports = router;
