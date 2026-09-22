const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    attributes: {
      type: Map,
      of: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountType: {
      type: String,
      enum: ["flat", "percentage", null],
      default: null,
    },

    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one variant is required",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
