const Product = require("../models/Product");
const seedCatalogData = require("../config/seedCatalogData");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      unit,
      isOrganic,
      farmOrigin,
      harvestDate,
      brand,
      images,
      stock
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Please provide all required fields"
      });
    }

    const product = await Product.create({
      name,
      title: name,
      description,
      price,
      category,
      subcategory: subcategory || 'General',
      unit: unit || '1 kg',
      isOrganic: isOrganic !== undefined ? isOrganic : true,
      farmOrigin: farmOrigin || 'Organic Valley Farms',
      harvestDate,
      brand,
      images: images || [],
      stock: stock || 0
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message
    });
  }
};


// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    let query = {
      isActive: true
    };

    // SEARCH
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } }
      ];
    }

    // CATEGORY & SUBCATEGORY FILTER
    if (category && category !== 'All') {
      query.category = category;
    }
    if (subcategory && subcategory !== 'All') {
      query.subcategory = subcategory;
    }

    // BRAND FILTER
    if (brand && brand !== 'All') {
      query.brand = brand;
    }

    // AVAILABILITY FILTER
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // PRICE FILTER
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // SORTING OPTIONS
    let sortObj = { createdAt: -1 }; // Default: newest
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'popular') sortObj = { numReviews: -1 };

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        totalProducts,
        limit: limitNumber
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
};


// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message
    });
  }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {

    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const {
      name,
      description,
      price,
      category,
      subcategory,
      unit,
      isOrganic,
      farmOrigin,
      harvestDate,
      brand,
      images,
      stock,
      ratings,
      numReviews,
      isActive
    } = req.body;

    product.name = name ?? product.name;
    if (name) product.title = name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.unit = unit ?? product.unit;
    product.isOrganic = isOrganic ?? product.isOrganic;
    product.farmOrigin = farmOrigin ?? product.farmOrigin;
    product.harvestDate = harvestDate ?? product.harvestDate;
    product.brand = brand ?? product.brand;
    product.images = images ?? product.images;
    product.stock = stock ?? product.stock;
    product.ratings = ratings ?? product.ratings;
    product.numReviews = numReviews ?? product.numReviews;
    product.isActive = isActive ?? product.isActive;

    const updatedProduct =
      await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message
    });
  }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {

    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Soft delete
    product.isActive = false;

    await product.save();

    res.status(200).json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
};


// SEED DEMO PRODUCTS
const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(seedCatalogData);

    res.status(201).json({
      message: "AgriFresh Catalog seeded successfully!",
      count: createdProducts.length,
      products: createdProducts
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to seed products catalog",
      error: error.message
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedProducts
};
