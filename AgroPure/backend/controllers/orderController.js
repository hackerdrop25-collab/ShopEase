const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ======================================
// CREATE COD ORDER
// ======================================

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "COD" } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: "One or more products are unavailable",
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `${product.name} has insufficient stock`,
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: item.quantity,
      });
    }

    // Calculate GST (5%) and delivery fee
    const gstAmount = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const totalAmount = subtotal + gstAmount + deliveryFee;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      gstAmount,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Processing",
    });

    // Deduct stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// ======================================
// RAZORPAY: CREATE ORDER FROM CART
// ======================================

const createRazorpayOrderFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({ message: "Item no longer available" });
      }
      if (item.quantity > item.product.stock) {
        return res.status(400).json({ message: `${item.product.name} has insufficient stock` });
      }
      subtotal += item.product.price * item.quantity;
    }

    const gstAmount = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const totalAmount = subtotal + gstAmount + deliveryFee;

    const options = {
      amount: Math.round(totalAmount * 100), // in paise
      currency: "INR",
      receipt: `agro_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      subtotal,
      gstAmount,
      deliveryFee,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to initialize Razorpay order", error: error.message });
  }
};

// ======================================
// RAZORPAY: VERIFY & FINALIZE ORDER
// ======================================

const verifyAndCreateRazorpayOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      return res.status(400).json({ message: "Complete shipping address is required" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: item.quantity,
      });

      // Deduct stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const gstAmount = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const totalAmount = subtotal + gstAmount + deliveryFee;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      gstAmount,
      deliveryFee,
      totalAmount,
      paymentMethod: "RAZORPAY",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      paymentId: razorpay_payment_id,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment confirmation failed", error: error.message });
  }
};

// ======================================
// GET MY ORDERS
// ======================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.product")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// ======================================
// GET SINGLE ORDER
// ======================================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get order",
      error: error.message,
    });
  }
};

// ======================================
// GET FARMER ORDERS
// ======================================

const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.product",
        populate: {
          path: "farmer",
          select: "name email",
        },
      })
      .populate("user", "name email phone")
      .sort({
        createdAt: -1,
      });

    const farmerOrders = orders
      .map((order) => {
        const farmerItems = order.items.filter(
          (item) =>
            item.product &&
            item.product.farmer &&
            item.product.farmer._id.toString() === req.user.id
        );

        if (farmerItems.length === 0) {
          return null;
        }

        return {
          _id: order._id,
          user: order.user,
          items: farmerItems,
          totalAmount: farmerItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          ),
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      orders: farmerOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get farmer orders",
      error: error.message,
    });
  }
};

// ======================================
// GET ALL ORDERS (ADMIN)
// ======================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get all orders",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE ORDER STATUS (ADMIN)
// ======================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Processing",
      "Confirmed",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  createRazorpayOrderFromCart,
  verifyAndCreateRazorpayOrder,
  getMyOrders,
  getOrderById,
  getFarmerOrders,
  getAllOrders,
  updateOrderStatus,
};
