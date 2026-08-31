/**
 * ShopEase - Product Controller (Phase 4)
 *
 * CRUD operations with search, filtering, and pagination.
 *
 * Public:
 *   - getProducts     (search, filter by category/brand/price, pagination)
 *   - getProductById  (single product by MongoDB _id or slug)
 *
 * Protected (requires JWT):
 *   - createProduct
 *   - updateProduct
 *   - deleteProduct   (soft delete — sets isActive = false)
 */

const Product = require('../models/Product');
const { AppError, catchAsync } = require('../middleware/errorHandler');

// ── CREATE PRODUCT ────────────────────────────────────────────────────────────
const createProduct = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    shortDescription,
    price,
    comparePrice,
    category,
    brand,
    images,
    stock,
    specifications,
    tags,
    isFeatured,
  } = req.body;

  // Basic required-field validation (Mongoose validators catch the rest)
  if (!title || !description || price === undefined || !category) {
    return next(
      new AppError('Please provide required product details (title, description, price, category).', 400)
    );
  }

  const product = await Product.create({
    title,
    description,
    shortDescription,
    price,
    comparePrice,
    category,
    brand,
    images: images || [],
    stock: stock || 0,
    specifications: specifications || [],
    tags: tags || [],
    isFeatured: isFeatured || false,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product,
  });
});

// ── GET ALL PRODUCTS (with search, filter, pagination) ───────────────────────
const getProducts = catchAsync(async (req, res, next) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sort,
    isFeatured,
  } = req.query;

  const query = { isActive: true };

  // Search by title or description (case-insensitive)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Brand filter
  if (brand) {
    query.brand = brand;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Featured filter
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }

  // Pagination bounds
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  // Sorting
  let sortObj = { createdAt: -1 }; // default: newest first
  if (sort === 'price_asc') sortObj = { price: 1 };
  else if (sort === 'price_desc') sortObj = { price: -1 };
  else if (sort === 'rating') sortObj = { rating: -1 };
  else if (sort === 'popular') sortObj = { numReviews: -1 };

  // Execute queries
  const totalProducts = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNumber);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
      limit: limitNumber,
    },
  });
});

// ── GET SINGLE PRODUCT ───────────────────────────────────────────────────────
const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Try to find by _id first, then by slug
  let product;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findOne({ _id: id, isActive: true });
  }
  if (!product) {
    product = await Product.findOne({ slug: id, isActive: true });
  }

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// ── UPDATE PRODUCT ───────────────────────────────────────────────────────────
const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const {
    title,
    description,
    shortDescription,
    price,
    comparePrice,
    category,
    brand,
    images,
    stock,
    rating,
    numReviews,
    specifications,
    tags,
    isFeatured,
    isActive,
  } = req.body;

  product.title = title ?? product.title;
  product.description = description ?? product.description;
  product.shortDescription = shortDescription ?? product.shortDescription;
  product.price = price ?? product.price;
  product.comparePrice = comparePrice ?? product.comparePrice;
  product.category = category ?? product.category;
  product.brand = brand ?? product.brand;
  product.images = images ?? product.images;
  product.stock = stock ?? product.stock;
  product.rating = rating ?? product.rating;
  product.numReviews = numReviews ?? product.numReviews;
  product.specifications = specifications ?? product.specifications;
  product.tags = tags ?? product.tags;
  product.isFeatured = isFeatured ?? product.isFeatured;
  product.isActive = isActive ?? product.isActive;

  const updatedProduct = await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product: updatedProduct,
  });
});

// ── DELETE PRODUCT (soft delete) ─────────────────────────────────────────────
const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Soft delete — preserves the document for order history references
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
