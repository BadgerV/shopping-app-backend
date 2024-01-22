import express from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import sharp from "sharp";

import Product from "../models/product.js";
import User from "../models/user.js";
import { calculateTotalPrice } from "../utils/UtilityFunctions.js";

const router = express.Router();

//multer configuration
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    // Check file types
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPG images are allowed."));
    }
  },
});

//ROUTER RESPONSIBLE FOR POSTING PRODUCTS
router.post(
  "/post-product",
  auth,
  upload.array("productImage"),
  async (req, res) => {
    const {
      name,
      description,
      originalProductPrice,
      stock,
      productDiscount,
      shippingCost,
      categories,
    } = req.body;

    //CHECKS FOR NUMBER OF PRODUCTS UPLOADED
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files were uploaded.");
    }
    //CHECKS FOR NUMBER OF PRODUCTS UPLOADED
    if (req.files.length > 4) {
      return res.status(400).send("You can only upload up to 4 files");
    }

    //CHECKS FOR CATEGORIES LENGTH
    if (!categories || categories.length === 0) {
      return res.status(400).send("Please select some categories");
    } else if (categories.length > 3) {
      return res.status(400).send("You can only select 3 categories");
    }

    try {
      //GET THE USER ID FROM COOKIES
      const owner = req.user.id;
      const buffers = await Promise.all(
        req.files.map((file) =>
          sharp(file.buffer)
            .resize({ width: 400, height: 400 })
            .png()
            .toBuffer()
        )
      );

      //INITIALIZES INSTOCK TO FALSE
      let inStock = false;

      //SETS INSTOCK BASED ON STOCK NUMBER
      if (stock > 1) {
        inStock = true;
      }

      //CALCULATES THE TOTAL PRICE OF THE PRODUCT
      const totalPrice = calculateTotalPrice(
        originalProductPrice,
        productDiscount,
        shippingCost
      );

      //INITIALIZES NEW PRODUCT WITH MONGOOSE
      const newProduct = new Product({
        name,
        description,
        productImage: buffers,
        nameSearch: name.toLowerCase(),
        owner,
        originalProductPrice,
        stock,
        inStock,
        productDiscount,
        shippingCost,
        price: totalPrice,
      });

      newProduct.productCategories = categories;

      await newProduct.save();

      req.user.products.push(newProduct._id);

      await req.user.save();

      res.status(200).send(newProduct);
    } catch (error) {
      console.log(error);
      res.status(400).json({ "An error occured": error });
    }
  }
);

//ROUTER RESPONSIBLE FOR GETTING RANDOM PRODUCTS
router.get("/get-random-products", async (req, res) => {
  try {
    // CHECKS THE PARAMS FOR PROPERTY OR SET IT TO 10
    const numRandomItems = req.params.noOfProducts || 10;

    // Use the aggregate framework to fetch random items and limit the results
    const randomProducts = await Product.aggregate([
      { $sample: { size: numRandomItems } },
      { $limit: numRandomItems },
      // {
      //   $project: {
      //     // productImage: 0, // Exclude the "productImage" property
      //   },
      // },
    ]).exec();
    // Send the random products as a response
    res.status(200).json({ randomProducts });
  } catch (error) {
    console.error("Error querying random products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//ROUTER RESPPONSIBE FOR SETTING COUNT AND UPDATING THE PRODUCT
router.post("/successfull-transaction/:id", auth, async (req, res) => {
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

router.post("/edit-product-number/:id", auth, async (req, res) => {
  try {
    const productID = req.params.id;

    //CHEKS IF IT BELONGS TO THE USER
    const belongsToThisUser = req.user.products.map((product) => {
      return product !== productID;
    });

    if (!belongsToThisUser) {
      res.status(401).send("You not allowed to edit this product");
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

router.delete("/delete-product/:id", auth, async (req, res) => {
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

router.post("/get-product", async (req, res) => {
  try {
    const { productName } = req.body;

    const product = await Product.find({
      name: { $regex: new RegExp(productName, "i") },
    }).exec();

    res.send(product);
  } catch (error) {
    res.status(400).json({ "An error occured": error });
  }
});

router.get("/get-product/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findOne({ _id: id }).exec();
    res.send(product);
  } catch (error) {
    res.status(400).json({ "An error occured": error });
  }
});

router.get("/get-product-categories", async (req, res) => {
  try {
    res
      .status(200)
      .send([
        "Textbooks",
        "Laptops",
        "Smartphones",
        "Clothing",
        "Furniture",
        "Appliances",
        "Bicycles",
        "Stationery",
        "Instruments",
        "Sports",
        "Electronics",
        "Decor",
        "Supplies",
        "Gaming",
        "Games",
        "Shoes",
        "Essentials",
        "Fitness",
        "Toiletries",
        "Tickets",
        "Backpacks",
        "Cookware",
        "Housing",
        "Aids",
        "Transport",
        "Art",
        "Entertainment",
        "Photography",
        "Collectibles",
        "DIY",
        "Food",
      ]);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

router.get("/get-categories-product/:category", async (req, res) => {
  try {
    const { categpry } = req.params;

    const result = await Product.find({
      productCategories: { $regex: new RegExp(categpry, "i") },
    })
      .select("-productImage")
      .exec();

    res.send(result);
  } catch (e) {
    res.status(400).json({ error: e });
    console.error("Error:", error);
  }
});

router.get("/search/:name", async (req, res) => {
  const searchQuery = req.params.name;

  try {
    const productSuggestions = await Product.find({
      name: { $regex: searchQuery, $options: "i" },
    })
      .select("-productImage")
      .exec();

    const userSuggestions = await User.find({
      firstName: { $regex: searchQuery, $options: "i" },
      isVendor: "true",
    })
      .select("-avatar -products")
      .exec();
    const userSuggestions1 = await User.find({
      lastName: { $regex: searchQuery, $options: "i" },
      isVendor: "true",
    })
      .select("-avatar -products")
      .exec();

    const suggestions = productSuggestions
      .concat(userSuggestions)
      .concat(userSuggestions1);

    res.status(200).send(suggestions);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

// // Multer configuration
// const storage = multer.memoryStorage();

// router.post("/testing", upload.array("images", 5), async (req, res) => {
//   try {
//     // Check if files are present
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).send("No files were uploaded.");
//     }

//     // Process each image buffer using sharp
//     const processedBuffers = await Promise.all(
//       req.files.map(async (file) => {
//         // Resize and convert to PNG
//         const processedBuffer = await sharp(file.buffer)
//           .resize({ width: 400, height: 400 })
//           .png()
//           .toBuffer();

//         return processedBuffer;
//       })
//     );

//     // Send the processed buffers in the response
//     res.json({ length: processedBuffers.length });
//   } catch (e) {
//     res.status(400).json({ error: e });
//   }
// });

export default router;
