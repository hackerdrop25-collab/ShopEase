/**
 * ShopEase - Comprehensive Product Seed Data
 * 50+ Products across all categories with real prices in Indian Rupees (₹)
 */

const products = [
  // ==================== ELECTRONICS (15 products) ====================
  {
    name: "Apple iPhone 15 Pro Max",
    description: "Latest iPhone with A17 Pro chip, 256GB storage, Titanium design, 48MP camera",
    price: 159900,
    category: "Electronics",
    stock: 25,
    images: [{ public_id: "iphone15pro", url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500" }],
    brand: "Apple",
    ratings: 4.9,
    numOfReviews: 1245
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Flagship Android with 200MP camera, S Pen, 12GB RAM, 512GB storage",
    price: 129999,
    category: "Electronics",
    stock: 30,
    images: [{ public_id: "samsung-s24", url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500" }],
    brand: "Samsung",
    ratings: 4.8,
    numOfReviews: 892
  },
  {
    name: "Dell XPS 15 Laptop",
    description: "Intel Core i7-13700H, 16GB RAM, 512GB SSD, 15.6\" 4K Display, NVIDIA RTX 4050",
    price: 154999,
    category: "Electronics",
    stock: 15,
    images: [{ public_id: "dell-xps", url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500" }],
    brand: "Dell",
    ratings: 4.7,
    numOfReviews: 456
  },
  {
    name: "MacBook Air M3",
    description: "Apple M3 chip, 16GB RAM, 512GB SSD, 13.6\" Liquid Retina Display",
    price: 134900,
    category: "Electronics",
    stock: 20,
    images: [{ public_id: "macbook-air", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500" }],
    brand: "Apple",
    ratings: 4.9,
    numOfReviews: 678
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Premium noise-cancelling wireless headphones, 30hr battery, multipoint connection",
    price: 29990,
    category: "Electronics",
    stock: 80,
    images: [{ public_id: "sony-headphones", url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500" }],
    brand: "Sony",
    ratings: 4.8,
    numOfReviews: 1234
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    description: "Active noise cancellation, adaptive transparency, H2 chip, USB-C charging",
    price: 24900,
    category: "Electronics",
    stock: 100,
    images: [{ public_id: "airpods-pro", url: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500" }],
    brand: "Apple",
    ratings: 4.7,
    numOfReviews: 2156
  },
  {
    name: "iPad Pro 12.9\" M2",
    description: "M2 chip, 128GB, Liquid Retina XDR display, Apple Pencil support",
    price: 119900,
    category: "Electronics",
    stock: 35,
    images: [{ public_id: "ipad-pro", url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500" }],
    brand: "Apple",
    ratings: 4.9,
    numOfReviews: 567
  },
  {
    name: "Samsung 55\" 4K Smart TV",
    description: "Crystal UHD 4K, HDR, Smart Hub, Alexa built-in, 3 HDMI ports",
    price: 49990,
    category: "Electronics",
    stock: 40,
    images: [{ public_id: "samsung-tv", url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500" }],
    brand: "Samsung",
    ratings: 4.6,
    numOfReviews: 789
  },
  {
    name: "Canon EOS R6 Mark II",
    description: "24.2MP full-frame mirrorless camera, 4K 60fps video, in-body stabilization",
    price: 239990,
    category: "Electronics",
    stock: 12,
    images: [{ public_id: "canon-camera", url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500" }],
    brand: "Canon",
    ratings: 4.9,
    numOfReviews: 234
  },
  {
    name: "PlayStation 5 Console",
    description: "Sony PS5 with DualSense controller, 825GB SSD, 4K gaming, ray tracing",
    price: 54990,
    category: "Electronics",
    stock: 50,
    images: [{ public_id: "ps5", url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500" }],
    brand: "Sony",
    ratings: 4.8,
    numOfReviews: 1567
  },
  {
    name: "Apple Watch Series 9",
    description: "GPS + Cellular, 45mm, fitness tracking, ECG, blood oxygen, always-on display",
    price: 49900,
    category: "Electronics",
    stock: 60,
    images: [{ public_id: "apple-watch", url: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500" }],
    brand: "Apple",
    ratings: 4.7,
    numOfReviews: 890
  },
  {
    name: "JBL Flip 6 Bluetooth Speaker",
    description: "Portable waterproof speaker, 12hrs playtime, powerful bass, PartyBoost",
    price: 11999,
    category: "Electronics",
    stock: 150,
    images: [{ public_id: "jbl-speaker", url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500" }],
    brand: "JBL",
    ratings: 4.5,
    numOfReviews: 1890
  },
  {
    name: "GoPro HERO 12 Black",
    description: "5.3K60 video, HyperSmooth 6.0, waterproof, HDR photos, voice control",
    price: 44999,
    category: "Electronics",
    stock: 45,
    images: [{ public_id: "gopro", url: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=500" }],
    brand: "GoPro",
    ratings: 4.7,
    numOfReviews: 567
  },
  {
    name: "Kindle Paperwhite Signature",
    description: "6.8\" display, 32GB, auto-adjusting light, wireless charging, waterproof",
    price: 17999,
    category: "Electronics",
    stock: 200,
    images: [{ public_id: "kindle", url: "https://images.unsplash.com/photo-1592359114411-e8f45450b1e7?w=500" }],
    brand: "Amazon",
    ratings: 4.6,
    numOfReviews: 2345
  },
  {
    name: "Logitech MX Master 3S Mouse",
    description: "Wireless ergonomic mouse, 8K DPI, quiet clicks, USB-C charging",
    price: 9995,
    category: "Electronics",
    stock: 120,
    images: [{ public_id: "logitech-mouse", url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500" }],
    brand: "Logitech",
    ratings: 4.8,
    numOfReviews: 1456
  },

  // ==================== FASHION (15 products) ====================
  {
    name: "Levi's Men's 511 Slim Fit Jeans",
    description: "Classic slim fit jeans, 98% cotton 2% elastane, dark wash, comfortable stretch",
    price: 3499,
    category: "Fashion",
    stock: 250,
    images: [{ public_id: "levis-jeans", url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500" }],
    brand: "Levi's",
    ratings: 4.5,
    numOfReviews: 1234
  },
  {
    name: "Nike Air Max 270 Running Shoes",
    description: "Men's running shoes with Max Air cushioning, breathable mesh, durable rubber sole",
    price: 12999,
    category: "Fashion",
    stock: 180,
    images: [{ public_id: "nike-shoes", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" }],
    brand: "Nike",
    ratings: 4.7,
    numOfReviews: 2456
  },
  {
    name: "Adidas Originals Hoodie",
    description: "Men's pullover hoodie, 70% cotton 30% polyester, Trefoil logo, kangaroo pocket",
    price: 4999,
    category: "Fashion",
    stock: 200,
    images: [{ public_id: "adidas-hoodie", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500" }],
    brand: "Adidas",
    ratings: 4.6,
    numOfReviews: 890
  },
  {
    name: "Van Heusen Formal Shirt - White",
    description: "Men's slim fit formal shirt, 100% cotton, wrinkle-free, spread collar",
    price: 1599,
    category: "Fashion",
    stock: 300,
    images: [{ public_id: "formal-shirt", url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500" }],
    brand: "Van Heusen",
    ratings: 4.4,
    numOfReviews: 567
  },
  {
    name: "Puma Women's Sports Bra",
    description: "High support sports bra, moisture-wicking fabric, removable padding, racerback",
    price: 1999,
    category: "Fashion",
    stock: 220,
    images: [{ public_id: "sports-bra", url: "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=500" }],
    brand: "Puma",
    ratings: 4.5,
    numOfReviews: 678
  },
  {
    name: "Women's Designer Kurti - Blue",
    description: "Elegant printed kurti, soft cotton fabric, 3/4 sleeves, knee length",
    price: 1299,
    category: "Fashion",
    stock: 350,
    images: [{ public_id: "kurti", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500" }],
    brand: "Biba",
    ratings: 4.6,
    numOfReviews: 1567
  },
  {
    name: "Women's Leather Handbag - Brown",
    description: "Genuine leather shoulder bag, multiple compartments, adjustable strap, zip closure",
    price: 3499,
    category: "Fashion",
    stock: 120,
    images: [{ public_id: "handbag", url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500" }],
    brand: "Baggit",
    ratings: 4.7,
    numOfReviews: 789
  },
  {
    name: "Fastrack Analog Watch - Men",
    description: "Stainless steel watch, water resistant, date display, leather strap",
    price: 2499,
    category: "Fashion",
    stock: 180,
    images: [{ public_id: "fastrack-watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" }],
    brand: "Fastrack",
    ratings: 4.3,
    numOfReviews: 1234
  },
  {
    name: "Ray-Ban Aviator Sunglasses",
    description: "Classic aviator style, UV protection, metal frame, gradient lenses",
    price: 7999,
    category: "Fashion",
    stock: 150,
    images: [{ public_id: "rayban", url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500" }],
    brand: "Ray-Ban",
    ratings: 4.8,
    numOfReviews: 2345
  },
  {
    name: "Wildcraft Backpack 40L",
    description: "Hiking backpack, water resistant, multiple pockets, padded shoulder straps",
    price: 2999,
    category: "Fashion",
    stock: 200,
    images: [{ public_id: "backpack", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" }],
    brand: "Wildcraft",
    ratings: 4.5,
    numOfReviews: 890
  },
  {
    name: "Men's Leather Belt - Black",
    description: "Genuine leather belt, reversible black/brown, metal buckle, 1.5\" width",
    price: 899,
    category: "Fashion",
    stock: 300,
    images: [{ public_id: "belt", url: "https://images.unsplash.com/photo-1553704571-c0b68eb1b0f7?w=500" }],
    brand: "Park Avenue",
    ratings: 4.4,
    numOfReviews: 456
  },
  {
    name: "Women's Yoga Pants - Black",
    description: "High waist yoga pants, 4-way stretch, moisture-wicking, squat-proof",
    price: 1499,
    category: "Fashion",
    stock: 250,
    images: [{ public_id: "yoga-pants", url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500" }],
    brand: "Decathlon",
    ratings: 4.6,
    numOfReviews: 1890
  },
  {
    name: "Men's Formal Shoes - Brown",
    description: "Leather oxford shoes, cushioned insole, lace-up, perfect for office wear",
    price: 3999,
    category: "Fashion",
    stock: 160,
    images: [{ public_id: "formal-shoes", url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500" }],
    brand: "Clarks",
    ratings: 4.5,
    numOfReviews: 678
  },
  {
    name: "Women's Summer Dress - Floral",
    description: "Flowy summer dress, sleeveless, V-neck, lightweight fabric, knee length",
    price: 1999,
    category: "Fashion",
    stock: 220,
    images: [{ public_id: "summer-dress", url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500" }],
    brand: "Zara",
    ratings: 4.7,
    numOfReviews: 1234
  },
  {
    name: "Men's Winter Jacket - Navy",
    description: "Hooded winter jacket, water resistant, fleece lined, multiple pockets",
    price: 4999,
    category: "Fashion",
    stock: 140,
    images: [{ public_id: "winter-jacket", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500" }],
    brand: "The North Face",
    ratings: 4.8,
    numOfReviews: 567
  },

  // ==================== HOME & KITCHEN (12 products) ====================
  {
    name: "Philips Air Fryer HD9252/90",
    description: "Digital air fryer, 4.1L capacity, rapid air technology, 7 presets, dishwasher safe",
    price: 12999,
    category: "Home & Kitchen",
    stock: 80,
    images: [{ public_id: "air-fryer", url: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500" }],
    brand: "Philips",
    ratings: 4.6,
    numOfReviews: 1234
  },
  {
    name: "Prestige Induction Cooktop",
    description: "2000W induction cooktop, touch panel, 8 preset menus, automatic shut-off",
    price: 3299,
    category: "Home & Kitchen",
    stock: 150,
    images: [{ public_id: "induction", url: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500" }],
    brand: "Prestige",
    ratings: 4.4,
    numOfReviews: 890
  },
  {
    name: "Pigeon Electric Kettle 1.5L",
    description: "Stainless steel electric kettle, 1500W, auto shut-off, boil-dry protection",
    price: 899,
    category: "Home & Kitchen",
    stock: 200,
    images: [{ public_id: "kettle", url: "https://images.unsplash.com/photo-1585571103784-5c9c1a26d9f4?w=500" }],
    brand: "Pigeon",
    ratings: 4.3,
    numOfReviews: 678
  },
  {
    name: "Milton Thermosteel Water Bottle 1L",
    description: "Insulated steel bottle, keeps water cold/hot for 24hrs, leak-proof",
    price: 699,
    category: "Home & Kitchen",
    stock: 500,
    images: [{ public_id: "water-bottle", url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500" }],
    brand: "Milton",
    ratings: 4.5,
    numOfReviews: 2345
  },
  {
    name: "Hawkins Pressure Cooker 5L",
    description: "Aluminum pressure cooker, 5 liters, ISI certified, includes gasket and weight",
    price: 1999,
    category: "Home & Kitchen",
    stock: 180,
    images: [{ public_id: "pressure-cooker", url: "https://images.unsplash.com/photo-1584990347449-39c5e2d41a74?w=500" }],
    brand: "Hawkins",
    ratings: 4.7,
    numOfReviews: 1567
  },
  {
    name: "Bajaj Mixer Grinder 750W",
    description: "3 jars mixer grinder, stainless steel blades, overload protection, 2-year warranty",
    price: 4499,
    category: "Home & Kitchen",
    stock: 120,
    images: [{ public_id: "mixer-grinder", url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500" }],
    brand: "Bajaj",
    ratings: 4.5,
    numOfReviews: 890
  },
  {
    name: "Cello Executive Lunch Box",
    description: "4-container lunch box, microwave safe, leak-proof, insulated bag included",
    price: 599,
    category: "Home & Kitchen",
    stock: 300,
    images: [{ public_id: "lunch-box", url: "https://images.unsplash.com/photo-1547558840-8ad6e0a6fa4f?w=500" }],
    brand: "Cello",
    ratings: 4.2,
    numOfReviews: 567
  },
  {
    name: "Borosil Glass Dinner Set 27-Piece",
    description: "Opal glass dinner set, microwave & dishwasher safe, break resistant",
    price: 3999,
    category: "Home & Kitchen",
    stock: 90,
    images: [{ public_id: "dinner-set", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500" }],
    brand: "Borosil",
    ratings: 4.6,
    numOfReviews: 789
  },
  {
    name: "Amazon Basics Non-Stick Cookware Set",
    description: "7-piece cookware set, non-stick coating, induction compatible, soft-touch handles",
    price: 2999,
    category: "Home & Kitchen",
    stock: 140,
    images: [{ public_id: "cookware-set", url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500" }],
    brand: "Amazon Basics",
    ratings: 4.4,
    numOfReviews: 1234
  },
  {
    name: "Eureka Forbes Vacuum Cleaner",
    description: "1400W vacuum cleaner, HEPA filter, 20L capacity, blower function, 2-year warranty",
    price: 8999,
    category: "Home & Kitchen",
    stock: 60,
    images: [{ public_id: "vacuum-cleaner", url: "https://images.unsplash.com/photo-1558317374-067fb43f03a0?w=500" }],
    brand: "Eureka Forbes",
    ratings: 4.5,
    numOfReviews: 456
  },
  {
    name: "Solimo Cotton Bath Towels (Pack of 4)",
    description: "100% cotton bath towels, 500 GSM, quick-dry, fade resistant, machine washable",
    price: 1299,
    category: "Home & Kitchen",
    stock: 250,
    images: [{ public_id: "towels", url: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500" }],
    brand: "Solimo",
    ratings: 4.3,
    numOfReviews: 890
  },
  {
    name: "Lifelong Iron Box 1000W",
    description: "Dry iron, non-stick coated soleplate, thermal fuse protection, 1-year warranty",
    price: 499,
    category: "Home & Kitchen",
    stock: 200,
    images: [{ public_id: "iron", url: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500" }],
    brand: "Lifelong",
    ratings: 4.1,
    numOfReviews: 567
  },

  // ==================== BOOKS (10 products) ====================
  {
    name: "Rich Dad Poor Dad - Robert Kiyosaki",
    description: "Personal finance classic, teaches financial literacy and wealth building strategies",
    price: 399,
    category: "Books",
    stock: 300,
    images: [{ public_id: "rich-dad", url: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500" }],
    brand: "Penguin",
    ratings: 4.8,
    numOfReviews: 3456
  },
  {
    name: "Atomic Habits - James Clear",
    description: "Proven framework for improving habits, breaking bad ones, and mastering tiny behaviors",
    price: 499,
    category: "Books",
    stock: 280,
    images: [{ public_id: "atomic-habits", url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" }],
    brand: "Penguin Random House",
    ratings: 4.9,
    numOfReviews: 4567
  },
  {
    name: "Think and Grow Rich - Napoleon Hill",
    description: "Timeless classic on success philosophy and personal achievement",
    price: 299,
    category: "Books",
    stock: 350,
    images: [{ public_id: "think-grow-rich", url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" }],
    brand: "Rupa Publications",
    ratings: 4.7,
    numOfReviews: 2345
  },
  {
    name: "The Power of Your Subconscious Mind",
    description: "Dr. Joseph Murphy's guide to unlocking the power of your subconscious mind",
    price: 199,
    category: "Books",
    stock: 400,
    images: [{ public_id: "subconscious-mind", url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500" }],
    brand: "Fingerprint",
    ratings: 4.6,
    numOfReviews: 1890
  },
  {
    name: "Sapiens - Yuval Noah Harari",
    description: "A brief history of humankind from Stone Age to modern era",
    price: 599,
    category: "Books",
    stock: 220,
    images: [{ public_id: "sapiens", url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500" }],
    brand: "Harper",
    ratings: 4.8,
    numOfReviews: 2890
  },
  {
    name: "The Alchemist - Paulo Coelho",
    description: "Magical story of Santiago, an Andalusian shepherd boy who yearns to travel",
    price: 350,
    category: "Books",
    stock: 320,
    images: [{ public_id: "alchemist", url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500" }],
    brand: "Harper Collins",
    ratings: 4.7,
    numOfReviews: 5678
  },
  {
    name: "Deep Work - Cal Newport",
    description: "Rules for focused success in a distracted world, master concentration",
    price: 450,
    category: "Books",
    stock: 200,
    images: [{ public_id: "deep-work", url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500" }],
    brand: "Grand Central Publishing",
    ratings: 4.6,
    numOfReviews: 1234
  },
  {
    name: "The 5 AM Club - Robin Sharma",
    description: "Own your morning, elevate your life with early rising and peak productivity",
    price: 399,
    category: "Books",
    stock: 250,
    images: [{ public_id: "5am-club", url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500" }],
    brand: "Harper Thorsons",
    ratings: 4.5,
    numOfReviews: 890
  },
  {
    name: "The Psychology of Money - Morgan Housel",
    description: "Timeless lessons on wealth, greed, and happiness from behavioral finance",
    price: 349,
    category: "Books",
    stock: 280,
    images: [{ public_id: "psychology-money", url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500" }],
    brand: "Jaico",
    ratings: 4.8,
    numOfReviews: 2345
  },
  {
    name: "Harry Potter Complete Collection (7 Books)",
    description: "Complete box set of all 7 Harry Potter books by J.K. Rowling",
    price: 4999,
    category: "Books",
    stock: 80,
    images: [{ public_id: "harry-potter", url: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=500" }],
    brand: "Bloomsbury",
    ratings: 4.9,
    numOfReviews: 7890
  },

  // ==================== SPORTS & FITNESS (8 products) ====================
  {
    name: "Yoga Mat Premium 6mm with Bag",
    description: "Anti-slip yoga mat, eco-friendly TPE material, reversible, includes carrying bag",
    price: 999,
    category: "Sports & Fitness",
    stock: 200,
    images: [{ public_id: "yoga-mat", url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500" }],
    brand: "Strauss",
    ratings: 4.4,
    numOfReviews: 890
  },
  {
    name: "Dumbbells Set 10kg (5kg x 2)",
    description: "Rubber-coated dumbbells, hexagonal shape prevents rolling, textured grip",
    price: 1899,
    category: "Sports & Fitness",
    stock: 150,
    images: [{ public_id: "dumbbells", url: "https://images.unsplash.com/photo-1638805981949-cbdef99c20b5?w=500" }],
    brand: "Kore",
    ratings: 4.6,
    numOfReviews: 567
  },
  {
    name: "Resistance Bands Set (5 Bands)",
    description: "Exercise resistance bands, varying resistance levels, includes door anchor and handles",
    price: 699,
    category: "Sports & Fitness",
    stock: 250,
    images: [{ public_id: "resistance-bands", url: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500" }],
    brand: "Boldfit",
    ratings: 4.3,
    numOfReviews: 678
  },
  {
    name: "Cosco Cricket Bat Kashmir Willow",
    description: "Kashmir willow cricket bat, full size, pre-treated blade, rubber grip",
    price: 1499,
    category: "Sports & Fitness",
    stock: 100,
    images: [{ public_id: "cricket-bat", url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500" }],
    brand: "Cosco",
    ratings: 4.2,
    numOfReviews: 456
  },
  {
    name: "Nivia Storm Football Size 5",
    description: "Professional football, PU construction, butyl bladder, FIFA quality",
    price: 899,
    category: "Sports & Fitness",
    stock: 180,
    images: [{ public_id: "football", url: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aae?w=500" }],
    brand: "Nivia",
    ratings: 4.4,
    numOfReviews: 789
  },
  {
    name: "Yonex Badminton Racket - Nanoray Series",
    description: "Lightweight badminton racket, graphite frame, isometric head, includes cover",
    price: 2999,
    category: "Sports & Fitness",
    stock: 90,
    images: [{ public_id: "badminton-racket", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500" }],
    brand: "Yonex",
    ratings: 4.7,
    numOfReviews: 1234
  },
  {
    name: "Skipping Rope with Counter",
    description: "Adjustable jump rope, digital counter, foam handles, tangle-free ball bearings",
    price: 349,
    category: "Sports & Fitness",
    stock: 300,
    images: [{ public_id: "skipping-rope", url: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500" }],
    brand: "Cockatoo",
    ratings: 4.2,
    numOfReviews: 567
  },
  {
    name: "Gym Bag Sports Duffle 40L",
    description: "Large gym bag, water-resistant, multiple compartments, shoe compartment, adjustable strap",
    price: 1299,
    category: "Sports & Fitness",
    stock: 160,
    images: [{ public_id: "gym-bag", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" }],
    brand: "American Tourister",
    ratings: 4.5,
    numOfReviews: 890
  }
];

module.exports = products;
