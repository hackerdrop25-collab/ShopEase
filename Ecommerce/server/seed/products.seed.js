/**
 * ShopEase - Product Seed Data
 * Sample products with prices in Indian Rupees (₹)
 */

const products = [
  // Electronics
  {
    name: "Apple iPhone 15 Pro",
    description: "Latest iPhone with A17 Pro chip, 256GB storage, Titanium design",
    price: 134900,
    category: "Electronics",
    stock: 50,
    images: [
      {
        public_id: "iphone15pro",
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500"
      }
    ],
    brand: "Apple",
    ratings: 4.8,
    numOfReviews: 245
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Flagship Android phone with 200MP camera, 12GB RAM, 512GB storage",
    price: 129999,
    category: "Electronics",
    stock: 35,
    images: [
      {
        public_id: "samsung-s24",
        url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500"
      }
    ],
    brand: "Samsung",
    ratings: 4.7,
    numOfReviews: 189
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Premium noise-cancelling wireless headphones with 30hr battery",
    price: 29990,
    category: "Electronics",
    stock: 100,
    images: [
      {
        public_id: "sony-headphones",
        url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500"
      }
    ],
    brand: "Sony",
    ratings: 4.9,
    numOfReviews: 412
  },
  {
    name: "Dell XPS 15 Laptop",
    description: "Intel i7, 16GB RAM, 512GB SSD, 15.6\" 4K Display",
    price: 154999,
    category: "Electronics",
    stock: 25,
    images: [
      {
        public_id: "dell-xps",
        url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"
      }
    ],
    brand: "Dell",
    ratings: 4.6,
    numOfReviews: 156
  },

  // Fashion - Men
  {
    name: "Levi's Men's Blue Jeans",
    description: "Classic 501 Original Fit Jeans, 100% Cotton Denim",
    price: 3499,
    category: "Fashion",
    stock: 200,
    images: [
      {
        public_id: "levis-jeans",
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"
      }
    ],
    brand: "Levi's",
    ratings: 4.5,
    numOfReviews: 523
  },
  {
    name: "Nike Air Max Running Shoes",
    description: "Comfortable running shoes with Air cushioning technology",
    price: 8999,
    category: "Fashion",
    stock: 150,
    images: [
      {
        public_id: "nike-shoes",
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
      }
    ],
    brand: "Nike",
    ratings: 4.7,
    numOfReviews: 678
  },
  {
    name: "Men's Formal Shirt - White",
    description: "Premium cotton formal shirt, wrinkle-free fabric",
    price: 1299,
    category: "Fashion",
    stock: 300,
    images: [
      {
        public_id: "formal-shirt",
        url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500"
      }
    ],
    brand: "Van Heusen",
    ratings: 4.3,
    numOfReviews: 234
  },

  // Fashion - Women
  {
    name: "Women's Designer Kurti",
    description: "Elegant printed kurti with comfortable cotton fabric",
    price: 999,
    category: "Fashion",
    stock: 250,
    images: [
      {
        public_id: "kurti",
        url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500"
      }
    ],
    brand: "Biba",
    ratings: 4.4,
    numOfReviews: 445
  },
  {
    name: "Women's Handbag - Brown Leather",
    description: "Genuine leather handbag with multiple compartments",
    price: 2499,
    category: "Fashion",
    stock: 80,
    images: [
      {
        public_id: "handbag",
        url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500"
      }
    ],
    brand: "Baggit",
    ratings: 4.6,
    numOfReviews: 189
  },

  // Home & Kitchen
  {
    name: "Philips Air Fryer",
    description: "1.2kg capacity, healthier cooking with rapid air technology",
    price: 8999,
    category: "Home & Kitchen",
    stock: 60,
    images: [
      {
        public_id: "air-fryer",
        url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500"
      }
    ],
    brand: "Philips",
    ratings: 4.5,
    numOfReviews: 321
  },
  {
    name: "Prestige Induction Cooktop",
    description: "2000W induction cooktop with preset menu options",
    price: 2799,
    category: "Home & Kitchen",
    stock: 120,
    images: [
      {
        public_id: "induction",
        url: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500"
      }
    ],
    brand: "Prestige",
    ratings: 4.4,
    numOfReviews: 267
  },
  {
    name: "Milton Water Bottle - 1 Liter",
    description: "Insulated steel water bottle, keeps water cold for 24hrs",
    price: 499,
    category: "Home & Kitchen",
    stock: 500,
    images: [
      {
        public_id: "water-bottle",
        url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500"
      }
    ],
    brand: "Milton",
    ratings: 4.2,
    numOfReviews: 890
  },

  // Books
  {
    name: "Rich Dad Poor Dad",
    description: "Bestselling personal finance book by Robert Kiyosaki",
    price: 399,
    category: "Books",
    stock: 200,
    images: [
      {
        public_id: "rich-dad",
        url: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500"
      }
    ],
    brand: "Penguin",
    ratings: 4.8,
    numOfReviews: 1245
  },
  {
    name: "Atomic Habits",
    description: "James Clear's guide to building good habits and breaking bad ones",
    price: 450,
    category: "Books",
    stock: 180,
    images: [
      {
        public_id: "atomic-habits",
        url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500"
      }
    ],
    brand: "Penguin Random House",
    ratings: 4.9,
    numOfReviews: 2156
  },

  // Sports & Fitness
  {
    name: "Yoga Mat - Premium",
    description: "Anti-slip yoga mat with carrying strap, 6mm thickness",
    price: 799,
    category: "Sports & Fitness",
    stock: 150,
    images: [
      {
        public_id: "yoga-mat",
        url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"
      }
    ],
    brand: "Strauss",
    ratings: 4.3,
    numOfReviews: 345
  },
  {
    name: "Dumbbells Set - 5kg Each",
    description: "Pair of rubber-coated dumbbells for home workout",
    price: 1599,
    category: "Sports & Fitness",
    stock: 100,
    images: [
      {
        public_id: "dumbbells",
        url: "https://images.unsplash.com/photo-1638805981949-cbdef99c20b5?w=500"
      }
    ],
    brand: "Kore",
    ratings: 4.5,
    numOfReviews: 234
  }
];

module.exports = products;
