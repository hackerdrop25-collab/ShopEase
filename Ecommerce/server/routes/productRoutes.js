/**
 * ShopEase - Product Routes
 *
 * Provides a working product catalog endpoint for the frontend while the
 * full admin product CRUD flow is expanded.
 */

const express = require('express');
const router = express.Router();

const sampleProducts = [
  {
    id: 'p-1001',
    title: 'Noise Cancelling Headphones',
    slug: 'noise-cancelling-headphones',
    shortDescription: 'Premium wireless audio with crystal-clear sound.',
    description: 'Deep bass, active noise cancellation, and all-day comfort for work, travel, and everyday listening.',
    price: 149,
    comparePrice: 199,
    category: 'Electronics',
    brand: 'Auralis',
    stock: 27,
    rating: 4.8,
    numReviews: 124,
    isFeatured: true,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80', altText: 'Headphones' },
    ],
  },
  {
    id: 'p-1002',
    title: 'Premium Smartwatch',
    slug: 'premium-smartwatch',
    shortDescription: 'Track health, workouts, and notifications all day.',
    description: 'A sleek smartwatch with fitness tracking, AMOLED display, and water resistance for everyday performance.',
    price: 199,
    comparePrice: 249,
    category: 'Electronics',
    brand: 'Horizon',
    stock: 41,
    rating: 4.7,
    numReviews: 88,
    isFeatured: true,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', altText: 'Smartwatch' },
    ],
  },
  {
    id: 'p-1003',
    title: 'Minimal Desk Lamp',
    slug: 'minimal-desk-lamp',
    shortDescription: 'Modern lighting for focused work and cozy evenings.',
    description: 'A soft-glow desk lamp with adjustable brightness and a clean silhouette for any workspace.',
    price: 79,
    comparePrice: 109,
    category: 'Home & Kitchen',
    brand: 'Luma',
    stock: 58,
    rating: 4.6,
    numReviews: 64,
    isFeatured: true,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', altText: 'Desk lamp' },
    ],
  },
  {
    id: 'p-1004',
    title: 'Urban Travel Backpack',
    slug: 'urban-travel-backpack',
    shortDescription: 'Smart storage for work, travel, and weekends away.',
    description: 'Weather-resistant and lightweight, with compartments for your essentials and a sleek everyday design.',
    price: 129,
    comparePrice: 159,
    category: 'Fashion',
    brand: 'Northline',
    stock: 33,
    rating: 4.5,
    numReviews: 77,
    isFeatured: false,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', altText: 'Backpack' },
    ],
  },
  {
    id: 'p-1005',
    title: 'Wireless Earbuds Pro',
    slug: 'wireless-earbuds-pro',
    shortDescription: 'Pocket-sized sound with rich bass and clear calls.',
    description: 'Compact earbuds with deep sound, sweat resistance, and a charging case designed for on-the-go use.',
    price: 119,
    comparePrice: 149,
    category: 'Electronics',
    brand: 'Auralis',
    stock: 66,
    rating: 4.8,
    numReviews: 141,
    isFeatured: true,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80', altText: 'Earbuds' },
    ],
  },
  {
    id: 'p-1006',
    title: 'Classic Leather Sneaker',
    slug: 'classic-leather-sneaker',
    shortDescription: 'Everyday comfort with elevated, timeless styling.',
    description: 'Crafted for daily walks and all-day wear, with breathable lining and a comfortable cushioned sole.',
    price: 89,
    comparePrice: 129,
    category: 'Fashion',
    brand: 'Velora',
    stock: 72,
    rating: 4.4,
    numReviews: 56,
    isFeatured: false,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', altText: 'Sneakers' },
    ],
  },
  {
    id: 'p-1007',
    title: 'Air Purifier Mini',
    slug: 'air-purifier-mini',
    shortDescription: 'Clean, quiet air for bedrooms and workspaces.',
    description: 'Compact purification with efficient filtration to support cleaner indoor air in everyday settings.',
    price: 139,
    comparePrice: 179,
    category: 'Health & Wellness',
    brand: 'PureNest',
    stock: 18,
    rating: 4.7,
    numReviews: 92,
    isFeatured: true,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80', altText: 'Air purifier' },
    ],
  },
  {
    id: 'p-1008',
    title: 'Premium Coffee Set',
    slug: 'premium-coffee-set',
    shortDescription: 'Brew café-quality coffee at home every morning.',
    description: 'A complete coffee setup built for aromatic brews and smooth, rich flavor without leaving the house.',
    price: 94,
    comparePrice: 127,
    category: 'Home & Kitchen',
    brand: 'BrewLane',
    stock: 44,
    rating: 4.6,
    numReviews: 51,
    isFeatured: false,
    isActive: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80', altText: 'Coffee set' },
    ],
  },
];

const serializeProduct = (product) => ({
  ...product,
  image: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  priceLabel: `$${product.price}`,
});

router.get('/', (req, res) => {
  const limit = Number(req.query.limit) || sampleProducts.length;
  const products = sampleProducts.slice(0, limit).map(serializeProduct);

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});

router.get('/:id', (req, res) => {
  const product = sampleProducts.find((item) => item.id === req.params.id || item.slug === req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  return res.status(200).json({
    success: true,
    product: serializeProduct(product),
  });
});

module.exports = router;
