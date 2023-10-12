const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const Product = require("../models/product.js");
const { calculatePriceWithDiscount } = require("../utils/UtilityFunctions");

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
    try {
      const owner = req.user.id;
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      const {
        name,
        description,
        originalProductPrice,
        stock,
        productDiscount,
        shippingCost,
      } = req.body;

      let inStock = false;

      if (stock > 1) {
        inStock = true;
      }

      let totalPrice = 0;

      if (productDiscount) {
        const discountedPrice =
          +originalProductPrice -
          +originalProductPrice * (+productDiscount / 100);

        // Calculate the total price including shipping (excluding tax)
        totalPrice = +discountedPrice + +shippingCost;
      } else {
        totalPrice = +originalProductPrice + +shippingCost;
      }

      const newProduct = new Product({
        name,
        description,
        productImage: buffer,
        owner,
        originalProductPrice,
        stock,
        inStock,
        productDiscount,
        shippingCost,
        price: totalPrice,
      });

      await newProduct.save();

      req.user.products.push(newProduct._id);

      await req.user.save();

      res.status(200).send(newProduct);
    } catch (error) {
      res.status(400).send("An error occured");
    }
  }
);

router.post("/product/successfull-transaction/:id", auth, async (req, res) => {
  try {
    const productID = req.params.id;

    const belongsToThisUser = req.user.products.map((product) => {
      return product !== productID;
    });

    if (!belongsToThisUser) {
      res.status(401).send("Cannot edit this product");
    }

    const product = await Product.findById(productID);

    product.stock -= 1;

    if (product.stock < 1) {
      const deletedProduct = Product.findByIdAndDelete(productID);

      req.user.products = req.user.products.filter((product) => {
        return product.toString() !== productID.toString();
      });

      req.user.save();
      res.status(200).send(deletedProduct);
    } else {
      await product.save();
    }

    res.send(product);
  } catch (error) {
    res.status(400).json({ error: "An error occured" });
  }
});

router.post("/product/edit-product-number/:id", auth, async (req, res) => {
  try {
    const productID = req.params.id;

    const belongsToThisUser = req.user.products.map((product) => {
      return product !== productID;
    });

    if (!belongsToThisUser) {
      res.status(401).send("Cannot edit this product");
    }

    const { description, originalProductPrice, stock, name } = req.body;

    const product = await Product.findById(productID);

    if (description) {
      product.description = description;
    }
    if (originalProductPrice) {
      product.originalProductPrice = originalProductPrice;
    }

    if (stock) {
      product.stock = stock;
    }

    if (name) {
      product.name = name;
    }

    product.save();

    res.send(product);
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

router.delete("/product/delete-product/:id", auth, async (req, res) => {
  try {
    const productID = req.params.id;

    const belongsToThisUser = req.user.products.map((product) => {
      return product !== productID;
    });

    if (belongsToThisUser) {
      const productToBeDeleted = await Product.findByIdAndDelete(productID);

      req.user.products = req.user.products.filter((product) => {
        return product.toString() !== productID.toString();
      });

      req.user.save();
      res.status(200).send(productToBeDeleted);
    } else {
      res.status(400).send({ error: "Cannot delete this product" });
    }
  } catch (error) {
    res.status(400).json({ error: "An error occured" });
  }
});

router.post("/product/get-product", async (req, res) => {
  try {
    const { productName } = req.body;

    const product = await Product.findOne({ name: productName });

    res.send(product);
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

module.exports = router;
