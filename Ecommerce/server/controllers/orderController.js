const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      shippingAddress,
      paymentMethod = "COD"
    } = req.body;

    const fullAddr = shippingAddress || {};
    const hasName = fullAddr.fullName || fullAddr.name;
    const hasStreet = fullAddr.address || fullAddr.street;

    if (
      !fullAddr ||
      !hasName ||
      !hasStreet ||
      !fullAddr.city ||
      !fullAddr.state ||
      !fullAddr.pincode ||
      !fullAddr.phone
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required"
      });
    }

    const cart = await Cart.findOne({
      user: userId
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: "Product is unavailable"
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `${product.name || product.title} has insufficient stock`
        });
      }

      const linePrice = (product.price || 0) * item.quantity;
      totalAmount += linePrice;

      orderItems.push({
        product: product._id,
        name: product.name || product.title,
        title: product.title || product.name,
        image: product.images?.[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        itemTotal: linePrice
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: {
        name: hasName,
        fullName: hasName,
        phone: fullAddr.phone,
        street: hasStreet,
        address: hasStreet,
        city: fullAddr.city,
        state: fullAddr.state,
        pincode: fullAddr.pincode,
        country: fullAddr.country || 'India'
      },
      itemsPrice: totalAmount,
      totalPrice: totalAmount,
      totalAmount,
      paymentMethod,
      paymentInfo: { method: paymentMethod },
      paymentStatus: "Pending",
      orderStatus: "Processing"
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity
          }
        }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};


// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const orders = await Order.find({
      user: userId
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({
      message: "Failed to get orders",
      error: error.message
    });
  }
};


// GET SINGLE ORDER
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({
      message: "Failed to get order",
      error: error.message
    });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
