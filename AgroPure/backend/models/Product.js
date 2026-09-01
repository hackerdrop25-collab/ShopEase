const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Vegetables",
        "Fruits",
        "Grains & Pulses",
        "Spices",
        "Natural Products",
        "Dairy",
        "Other",
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      enum: [
        "kg",
        "500g",
        "250g",
        "litre",
        "500ml",
        "piece",
        "pack",
      ],
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmLocation: {
      type: String,
      trim: true,
    },

    harvestDate: {
      type: Date,
    },

    organicCertified: {
      type: Boolean,
      default: false,
    },

    certification: {
      type: String,
      trim: true,
    },

    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
