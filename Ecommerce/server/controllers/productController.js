/**
 * ShopEase - Product Controller
 * Handles all product-related operations & Admin management
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendResponse } = require('../utils/sendResponse');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * Get all products with search, filter, pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const productsCount = await Product.countDocuments();
    const limit = parseInt(req.query.limit, 10) || 1000;

    const queryCopy = { ...req.query };
    queryCopy.limit = limit;

    const apiFeature = new ApiFeatures(Product.find(), queryCopy)
      .search(['name', 'title', 'description', 'category', 'brand'])
      .filter()
      .sort()
      .paginate();

    const products = await apiFeature.query;

    sendResponse(res, 200, 'Products fetched successfully', {
      products,
      productsCount,
      count: products.length,
      filteredProductsCount: products.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all products for Admin (including inactive, with full profit fields)
 * @route   GET /api/products/admin/all
 * @access  Private/Admin
 */
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const query = Product.find();
    query._skipActiveFilter = true;
    const products = await query.sort({ createdAt: -1 });

    sendResponse(res, 200, 'All products fetched for admin', {
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product details
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    sendResponse(res, 200, 'Product fetched successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (Admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Sync title & name
    if (payload.name && !payload.title) payload.title = payload.name;
    if (payload.title && !payload.name) payload.name = payload.title;

    // Number conversions
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);
    if (payload.comparePrice !== undefined) payload.comparePrice = Number(payload.comparePrice);

    // Default costPrice to ~70% if not explicitly set
    if (payload.costPrice === undefined || payload.costPrice === null || payload.costPrice === '') {
      payload.costPrice = Math.round((payload.price || 0) * 0.7);
    } else {
      payload.costPrice = Number(payload.costPrice);
    }

    // Format images if URL string provided
    if (payload.imageUrl || typeof payload.image === 'string') {
      const url = payload.imageUrl || payload.image;
      payload.images = [{ public_id: `prod_${Date.now()}`, url, altText: payload.name || '' }];
    } else if (Array.isArray(payload.images)) {
      payload.images = payload.images.map((img, idx) => {
        if (typeof img === 'string') {
          return { public_id: `prod_${Date.now()}_${idx}`, url: img, altText: payload.name || '' };
        }
        return img;
      });
    } else if (!payload.images || payload.images.length === 0) {
      payload.images = [{
        public_id: `prod_default`,
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
        altText: payload.name || 'Product Image',
      }];
    }

    if (req.user) {
      payload.createdBy = req.user._id || req.user.id;
    }

    const product = await Product.create(payload);

    sendResponse(res, 201, 'Product created successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Sync title & name
    if (payload.name && !payload.title) payload.title = payload.name;
    if (payload.title && !payload.name) payload.name = payload.title;

    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.costPrice !== undefined) payload.costPrice = Number(payload.costPrice);
    if (payload.comparePrice !== undefined) payload.comparePrice = Number(payload.comparePrice);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    // Format images if imageUrl passed
    if (payload.imageUrl || typeof payload.image === 'string') {
      const url = payload.imageUrl || payload.image;
      payload.images = [{ public_id: `prod_${Date.now()}`, url, altText: payload.name || '' }];
    } else if (Array.isArray(payload.images)) {
      payload.images = payload.images.map((img, idx) => {
        if (typeof img === 'string') {
          return { public_id: `prod_${Date.now()}_${idx}`, url: img, altText: payload.name || '' };
        }
        return img;
      });
    }

    const query = Product.findById(req.params.id);
    query._skipActiveFilter = true;
    let product = await query;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    sendResponse(res, 200, 'Product updated successfully', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Quick stock update (Admin only)
 * @route   PATCH /api/products/:id/stock
 * @access  Private/Admin
 */
exports.updateStock = async (req, res, next) => {
  try {
    const { stock, delta } = req.body;
    const query = Product.findById(req.params.id);
    query._skipActiveFilter = true;
    const product = await query;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (stock !== undefined) {
      product.stock = Math.max(0, Number(stock));
    } else if (delta !== undefined) {
      product.stock = Math.max(0, product.stock + Number(delta));
    }

    await product.save();

    sendResponse(res, 200, `Stock updated to ${product.stock} units`, { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const query = Product.findById(req.params.id);
    query._skipActiveFilter = true;
    const product = await query;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    sendResponse(res, 200, 'Product deleted successfully', { id: req.params.id });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    }).sort('-createdAt');

    sendResponse(res, 200, 'Products fetched successfully', {
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Comprehensive Admin Analytics: Stock, Profit, Inventory, Orders
 * @route   GET /api/products/admin/stats
 * @access  Private/Admin
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const query = Product.find();
    query._skipActiveFilter = true;
    const allProducts = await query.lean();

    const totalProducts = allProducts.length;
    let totalStockUnits = 0;
    let totalInventoryValue = 0; // Selling value: sum(price * stock)
    let totalInventoryCost = 0;  // Cost value: sum(costPrice * stock)
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const categoryMap = {};
    const lowStockAlerts = [];
    const profitList = [];

    allProducts.forEach((p) => {
      const price = Number(p.price) || 0;
      const stock = Number(p.stock) || 0;
      // If costPrice is not set, estimate at 70% of price
      const costPrice = p.costPrice !== undefined && p.costPrice !== null ? Number(p.costPrice) : Math.round(price * 0.7);
      const unitProfit = Math.max(0, price - costPrice);
      const margin = price > 0 ? Math.round((unitProfit / price) * 100) : 0;
      const stockValue = price * stock;
      const stockCost = costPrice * stock;
      const stockProfit = unitProfit * stock;

      totalStockUnits += stock;
      totalInventoryValue += stockValue;
      totalInventoryCost += stockCost;

      if (stock === 0) {
        outOfStockCount++;
        lowStockAlerts.push({
          _id: p._id,
          name: p.name || p.title,
          category: p.category,
          stock: 0,
          status: 'Out of Stock',
          price,
          costPrice,
        });
      } else if (stock <= 10) {
        lowStockCount++;
        lowStockAlerts.push({
          _id: p._id,
          name: p.name || p.title,
          category: p.category,
          stock,
          status: 'Low Stock',
          price,
          costPrice,
        });
      } else {
        inStockCount++;
      }

      // Category breakdown
      const cat = p.category || 'Uncategorized';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          productCount: 0,
          totalStock: 0,
          totalValue: 0,
          totalCost: 0,
          projectedProfit: 0,
        };
      }
      categoryMap[cat].productCount++;
      categoryMap[cat].totalStock += stock;
      categoryMap[cat].totalValue += stockValue;
      categoryMap[cat].totalCost += stockCost;
      categoryMap[cat].projectedProfit += stockProfit;

      profitList.push({
        _id: p._id,
        name: p.name || p.title,
        category: p.category,
        brand: p.brand || 'ShopEase',
        price,
        costPrice,
        unitProfit,
        margin,
        stock,
        stockValue,
        stockProfit,
      });
    });

    const projectedProfit = totalInventoryValue - totalInventoryCost;
    const overallMargin = totalInventoryValue > 0
      ? Math.round((projectedProfit / totalInventoryValue) * 100)
      : 0;

    // Category breakdown list
    const categoryBreakdown = Object.values(categoryMap).map((c) => ({
      ...c,
      margin: c.totalValue > 0 ? Math.round((c.projectedProfit / c.totalValue) * 100) : 0,
    })).sort((a, b) => b.totalValue - a.totalValue);

    // Top profitable items by margin
    const topMarginProducts = [...profitList]
      .filter((p) => p.margin > 0)
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 8);

    // High potential profit by total stock profit
    const topStockProfitProducts = [...profitList]
      .sort((a, b) => b.stockProfit - a.stockProfit)
      .slice(0, 8);

    // Realized orders stats
    let totalOrdersCount = 0;
    let realizedRevenue = 0;
    let realizedProfitEst = 0;
    try {
      const orders = await Order.find().lean();
      totalOrdersCount = orders.length;
      orders.forEach((ord) => {
        const rev = Number(ord.totalPrice || ord.totalAmount || 0);
        realizedRevenue += rev;
        // Estimated realized profit using overall margin
        realizedProfitEst += rev * (overallMargin / 100);
      });
    } catch {
      // Order collection might be empty
    }

    sendResponse(res, 200, 'Admin analytics fetched successfully', {
      inventory: {
        totalProducts,
        totalStockUnits,
        totalInventoryValue,
        totalInventoryCost,
        projectedProfit,
        overallMargin,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
      orders: {
        totalOrdersCount,
        realizedRevenue: Math.round(realizedRevenue),
        realizedProfitEst: Math.round(realizedProfitEst),
      },
      lowStockAlerts: lowStockAlerts.sort((a, b) => a.stock - b.stock),
      categoryBreakdown,
      topMarginProducts,
      topStockProfitProducts,
    });
  } catch (error) {
    next(error);
  }
};
