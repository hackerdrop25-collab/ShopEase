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

// ======================================
// GET MY PRODUCTS (FARMER)
// ======================================

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      farmer: req.user.id,
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get your products",
      error: error.message,
    });
  }
};

// ======================================
// SEED PRODUCTS (PUBLIC / DEMO)
// ======================================

const seedProducts = async (req, res) => {
  try {
    const User = require("../models/User");
    const bcrypt = require("bcryptjs");

    let farmer = await User.findOne({ role: "farmer" });
    if (!farmer) {
      const hashedPassword = await bcrypt.hash("farmer123", 10);
      farmer = await User.create({
        name: "Green Valley Organic Farm",
        email: "farmer@agropure.com",
        password: hashedPassword,
        phone: "9876543210",
        role: "farmer",
        address: {
          street: "123 Bio-Farm Road",
          city: "Coimbatore",
          state: "Tamil Nadu",
          pincode: "641001",
        },
      });
    }

    const SAMPLE_ITEMS = [
      // Vegetables
      {
        name: "Organic Tomato",
        description: "Farm-fresh naturally cultivated red tomatoes, rich in Lycopene and 100% pesticide-free.",
        category: "Vegetables",
        price: 80,
        unit: "kg",
        stock: 100,
        images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Coimbatore, Tamil Nadu",
        organicCertified: true,
        certification: "Jaivik Bharat / NPOP",
      },
      {
        name: "Organic Carrot",
        description: "Crunchy sweet Ooty carrots rich in Beta-Carotene. Harvested straight from highland soils.",
        category: "Vegetables",
        price: 120,
        unit: "kg",
        stock: 80,
        images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Ooty, Tamil Nadu",
        organicCertified: true,
        certification: "PGS-India Organic",
      },
      {
        name: "Organic Potato",
        description: "Naturally grown potatoes perfect for curries, baking, and healthy home meals.",
        category: "Vegetables",
        price: 60,
        unit: "kg",
        stock: 120,
        images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Nilgiris, Tamil Nadu",
        organicCertified: true,
        certification: "NPOP Organic Certified",
      },
      {
        name: "Organic Onion",
        description: "Pungent and flavorful naturally farmed red onions with long shelf life.",
        category: "Vegetables",
        price: 50,
        unit: "kg",
        stock: 150,
        images: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Nashik Organic Cluster",
        organicCertified: true,
        certification: "Jaivik Bharat",
      },
      {
        name: "Fresh Organic Spinach",
        description: "Tender green spinach leaves harvested every morning. Packed with Iron and Folate.",
        category: "Vegetables",
        price: 30,
        unit: "pack",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Erode, Tamil Nadu",
        organicCertified: true,
        certification: "PGS-India Organic",
      },
      {
        name: "Organic Brinjal / Eggplant",
        description: "Tender purple brinjal ideal for roasted baingan bharta and traditional sambar.",
        category: "Vegetables",
        price: 55,
        unit: "kg",
        stock: 60,
        images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Madurai, Tamil Nadu",
        organicCertified: true,
        certification: "Certified Organic",
      },
      // Fruits
      {
        name: "Organic Shimla Apple",
        description: "Sweet crisp apples grown in chemical-free Himalayan orchards.",
        category: "Fruits",
        price: 180,
        unit: "kg",
        stock: 75,
        images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Shimla, Himachal Pradesh",
        organicCertified: true,
        certification: "NPOP Organic",
      },
      {
        name: "Organic Bananas",
        description: "Naturally ripened yellow bananas without calcium carbide or artificial chemicals.",
        category: "Fruits",
        price: 60,
        unit: "kg",
        stock: 100,
        images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Trichy, Tamil Nadu",
        organicCertified: true,
        certification: "PGS-India",
      },
      {
        name: "Fresh Nagpur Oranges",
        description: "Juicy citrus oranges rich in Vitamin C, harvested from organic orchards.",
        category: "Fruits",
        price: 110,
        unit: "kg",
        stock: 65,
        images: ["https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Nagpur, Maharashtra",
        organicCertified: true,
        certification: "Certified Organic",
      },
      {
        name: "Alphonso Mango",
        description: "King of mangoes! Aromatic, sweet, naturally sun-ripened organic Alphonso.",
        category: "Fruits",
        price: 250,
        unit: "kg",
        stock: 40,
        images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Ratnagiri, Maharashtra",
        organicCertified: true,
        certification: "Jaivik Bharat",
      },
      // Grains & Pulses
      {
        name: "Traditional Organic Rice",
        description: "Aromatic unpolished organic white rice cultivated with ancient zero-budget farming.",
        category: "Grains & Pulses",
        price: 90,
        unit: "kg",
        stock: 200,
        images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Tanjore Delta, Tamil Nadu",
        organicCertified: true,
        certification: "NPOP Organic",
      },
      {
        name: "Organic Whole Wheat",
        description: "Stone-ground whole wheat grain ideal for soft nutrient-rich rotis.",
        category: "Grains & Pulses",
        price: 55,
        unit: "kg",
        stock: 250,
        images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Punjab Organic Farms",
        organicCertified: true,
        certification: "Jaivik Bharat",
      },
      // Spices
      {
        name: "Organic Turmeric Powder",
        description: "High Curcumin (5%+) pure yellow turmeric grown naturally in Erode.",
        category: "Spices",
        price: 180,
        unit: "kg",
        stock: 140,
        images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Erode, Tamil Nadu",
        organicCertified: true,
        certification: "Geographical Indication Organic",
      },
      {
        name: "Wayanad Black Pepper",
        description: "Bold whole black pepper corns harvested from Wayanad forest spice gardens.",
        category: "Spices",
        price: 650,
        unit: "kg",
        stock: 45,
        images: ["https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Wayanad, Kerala",
        organicCertified: true,
        certification: "Spices Board Certified Organic",
      },
      // Natural Products
      {
        name: "Wild Forest Organic Honey",
        description: "Raw unfiltered honey extracted from wild beehives in the Western Ghats.",
        category: "Natural Products",
        price: 450,
        unit: "litre",
        stock: 60,
        images: ["https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Western Ghats, Tamil Nadu",
        organicCertified: true,
        certification: "Wild Forest Certified",
      },
      {
        name: "Wood-Pressed Coconut Oil",
        description: "Pure cold-pressed virgin coconut oil made in traditional wooden marachekku.",
        category: "Natural Products",
        price: 280,
        unit: "litre",
        stock: 85,
        images: ["https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Pollachi, Tamil Nadu",
        organicCertified: true,
        certification: "Traditional Wood-Pressed",
      },
      // Seeds & Saplings
      {
        name: "Organic Tomato Seeds (High Yield)",
        description: "Heirloom non-GMO open-pollinated tomato seeds with high germination rate.",
        category: "Seeds & Saplings",
        price: 120,
        unit: "pack",
        stock: 200,
        images: ["https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Coimbatore Bio-Nursery",
        organicCertified: true,
        certification: "Non-GMO Seed Certified",
      },
      {
        name: "Heirloom Ooty Carrot Seeds",
        description: "Untreated organic carrot seeds suitable for terrace gardens and home farming.",
        category: "Seeds & Saplings",
        price: 95,
        unit: "pack",
        stock: 150,
        images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=60"],
        farmLocation: "Ooty Bio Seeds",
        organicCertified: true,
        certification: "100% Organic Seed",
      },
    ];

    await Product.deleteMany({});
    const inserted = await Product.insertMany(
      SAMPLE_ITEMS.map((item) => ({ ...item, farmer: farmer._id, isActive: true }))
    );

    res.status(201).json({
      message: `Database seeded successfully with ${inserted.length} organic products!`,
      products: inserted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database seeding failed",
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
  getMyProducts,
  seedProducts,
};
