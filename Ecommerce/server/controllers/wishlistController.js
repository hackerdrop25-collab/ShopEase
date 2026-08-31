const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// GET WISHLIST
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let wishlist = await Wishlist.findOne({
      user: userId
    }).populate("products");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: []
      });
    }

    res.status(200).json(wishlist);

  } catch (error) {
    res.status(500).json({
      message: "Failed to get wishlist",
      error: error.message
    });
  }
};


// ADD WISHLIST
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user._id;

    const product = await Product.findOne({
      _id: productId,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    let wishlist = await Wishlist.findOne({
      user: userId
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: []
      });
    }

    const exists = wishlist.products.some(
      id => id.toString() === productId
    );

    if (exists) {
      return res.status(400).json({
        message: "Product already in wishlist"
      });
    }

    wishlist.products.push(productId);

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json({
      message: "Added to wishlist",
      wishlist
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add wishlist",
      error: error.message
    });
  }
};


// REMOVE WISHLIST
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;

    const wishlist = await Wishlist.findOne({
      user: userId
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found"
      });
    }

    wishlist.products =
      wishlist.products.filter(
        id => id.toString() !== productId
      );

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json({
      message: "Removed from wishlist",
      wishlist
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to remove wishlist",
      error: error.message
    });
  }
};


module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
