import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 20,
    },
    nameSearch: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 500,
    },
    price: {
      type: Number,
      required: true,
    },
    originalProductPrice: {
      required: true,
      type: Number,
    },
    rating: {
      type: Number,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    productImage: [
      {
        type: Buffer,
        contentType: String,

        required: true,
      },
    ],
    productDiscount: {
      type: Number,
    },
    inStock: {
      type: Boolean,
    },
    stock: {
      type: Number,
      required: true,
    },
    shippingCost: {
      required: true,
      type: Number,
    },
    productCategories: [
      {
        type: String,
        enum: [
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
        ],
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
export default productSchema;
