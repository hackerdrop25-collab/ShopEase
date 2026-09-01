const Product = require("../models/Product");

// ======================================
// CREATE PRODUCT
// ======================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      unit,
      stock,
      images,
      farmLocation,
      harvestDate,
      organicCertified,
      certification,
    } = req.body;

    // Required fields
    if (
      !name ||
      !description ||
      !category ||
      price === undefined ||
      !unit ||
      stock === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Price validation
    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    // Stock validation
    if (Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      unit,
      stock: Number(stock),
      images: images || [],
      farmer: req.user.id,
      farmLocation,
      harvestDate,
      organicCertified: organicCertified === true,
      certification,
    });

    res.status(201).json({
      message: "Organic product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ======================================
// GET ALL PRODUCTS
// ======================================

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      organicCertified,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      isActive: true,
    };

    // SEARCH
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          farmLocation: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // CATEGORY
    if (category) {
      query.category = category;
    }

    // ORGANIC CERTIFIED
    if (organicCertified === "true") {
      query.organicCertified = true;
    }

    // PRICE
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // PAGINATION
    const pageNumber = Math.max(Number(page), 1);

    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    // SORT
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "priceLow") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "priceHigh") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        ratings: -1,
      };
    }

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("farmer", "name email phone")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        totalProducts,
        limit: limitNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ======================================
// GET SINGLE PRODUCT
// ======================================

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("farmer", "name email phone");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ======================================
// UPDATE PRODUCT
// ======================================

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Only product owner or admin
    if (
      product.farmer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can update only your own products",
      });
    }

    const {
      name,
      description,
      category,
      price,
      unit,
      stock,
      images,
      farmLocation,
      harvestDate,
      organicCertified,
      certification,
      isActive,
    } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.category = category ?? product.category;
    product.price = price ?? product.price;
    product.unit = unit ?? product.unit;
    product.stock = stock ?? product.stock;
    product.images = images ?? product.images;
    product.farmLocation = farmLocation ?? product.farmLocation;
    product.harvestDate = harvestDate ?? product.harvestDate;
    product.organicCertified = organicCertified ?? product.organicCertified;
    product.certification = certification ?? product.certification;

    // Only admin can deactivate
    if (req.user.role === "admin") {
      product.isActive = isActive ?? product.isActive;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ======================================
// DELETE PRODUCT
// ======================================

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Owner or admin
    if (
      product.farmer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can delete only your own products",
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
