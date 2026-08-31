const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedProducts
} = require("../controllers/productController");

const protect =
  require("../middleware/authMiddleware");

const router = express.Router();


// PUBLIC ROUTES

router.post("/seed", seedProducts);

router.get("/", getProducts);

router.get("/:id", getProductById);


// PROTECTED ROUTES

router.post("/", protect, createProduct);

router.put("/:id", protect, updateProduct);

router.delete("/:id", protect, deleteProduct);


module.exports = router;
