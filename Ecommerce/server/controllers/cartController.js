const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET CART
const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let cart = await Cart.findOne({
      user: userId
    }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: []
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get cart",
      error: error.message
    });
  }
};


// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
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

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Invalid quantity"
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    let cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + qty;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: "Quantity exceeds available stock"
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty
      });
    }

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      message: "Product added to cart",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message
    });
  }
};


// UPDATE CART
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);
    const userId = req.user.id || req.user._id;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    const cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not in cart"
      });
    }

    item.quantity = quantity;

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      message: "Cart updated",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart",
      error: error.message
    });
  }
};


// REMOVE ITEM
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;

    const cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.product");

    res.status(200).json({
      message: "Product removed",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to remove product",
      error: error.message
    });
  }
};


// CLEAR CART
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      message: "Cart cleared"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to clear cart",
      error: error.message
    });
  }
};


module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
