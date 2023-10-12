const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const Product = require("../models/product.js");

const router = express.Router();

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

router.post(
  "/product/post-product",
  auth,
  upload.single("productImage"),
  async (req, res) => {
    const owner = req.user.id;
    const file = req.file.buffer;
    const { name, description, originalProductPrice, stock, productDiscount } =
      req.body;

    let inStock = false;

    if (stock > 1) {
      inStock = true;
    }

    const newProduct = new Product({
      name,
      description,
      productImage: file,
      owner,
      originalProductPrice,
      stock,
      inStock,
      productDiscount,
    });

    // await newProduct.save();

    res.send(newProduct);
  }
);

module.exports = router;
