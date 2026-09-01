/**
 * ShopEase - Product Controller
 * Handles all product-related operations
 */

const Product = require('../models/Product');
const { sendResponse } = require('../utils/sendResponse');
const ApiFeatures = require('../utils/apiFeatures');

/**
 * Get all products with search, filter, pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const resultPerPage = 12;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search(['name', 'description'])
      .filter()
      .paginate();

    const products = await apiFeature.query;

    sendResponse(res, 200, 'Products fetched successfully', {
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount: products.length
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
        message: 'Product not found'
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
    const product = await Product.create(req.body);

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
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    sendResponse(res, 200, 'Product updated successfully', { product });
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    sendResponse(res, 200, 'Product deleted successfully', {});
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
      category: req.params.category 
    }).sort('-createdAt');

    sendResponse(res, 200, 'Products fetched successfully', {
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};
