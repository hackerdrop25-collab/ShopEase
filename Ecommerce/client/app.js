/* ═══════════════════════════════════════════════════════════════
   ShopEase — Professional E-Commerce App (Standalone Mode)
   ═══════════════════════════════════════════════════════════════ */

const API_URL      = 'http://localhost:5000/api';
const USE_MOCK_DATA = true;

let cart        = JSON.parse(localStorage.getItem('shopease_cart'))     || [];
let wishlist    = JSON.parse(localStorage.getItem('shopease_wishlist')) || [];
let allProducts = [];
let currentUser = JSON.parse(localStorage.getItem('shopease_user'))     || null;
let activeSortKey   = 'popularity';
let countdownTarget = null;

/* ═══════════════════════════════════════════════════════════════
   PRODUCT DATA
   ═══════════════════════════════════════════════════════════════ */
const mockProducts = [
  // ── ELECTRONICS (15 products — 50% OFF sale) ────────────────────────────────
  { _id:"1",  name:"Apple iPhone 15 Pro Max",       description:"A17 Pro chip, 256GB Titanium, 48MP ProRAW camera, 5x optical zoom, USB-C",                           price:79950,  originalPrice:159900, discount:50, category:"Electronics",     brand:"Apple",          ratings:4.9, numOfReviews:1245, stock:25,  images:[{url:"https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=400&fit=crop"}] },
  { _id:"2",  name:"Samsung Galaxy S24 Ultra",      description:"200MP camera, Snapdragon 8 Gen 3, 12GB RAM, 512GB, built-in S Pen, 6.8\" QHD+",                     price:65000,  originalPrice:129999, discount:50, category:"Electronics",     brand:"Samsung",        ratings:4.8, numOfReviews:892,  stock:30,  images:[{url:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=400&fit=crop"}] },
  { _id:"3",  name:"Dell XPS 15 Laptop",            description:"Intel Core i7-13700H, 16GB RAM, 512GB NVMe SSD, 15.6\" 4K OLED, NVIDIA RTX 4050",                  price:77500,  originalPrice:154999, discount:50, category:"Electronics",     brand:"Dell",           ratings:4.7, numOfReviews:456,  stock:15,  images:[{url:"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=400&fit=crop"}] },
  { _id:"4",  name:"MacBook Air M3",                description:"Apple M3 chip, 16GB unified memory, 512GB SSD, 13.6\" Liquid Retina, 18hr battery",                 price:67450,  originalPrice:134900, discount:50, category:"Electronics",     brand:"Apple",          ratings:4.9, numOfReviews:678,  stock:20,  images:[{url:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop"}] },
  { _id:"5",  name:"Sony WH-1000XM5 Headphones",   description:"Industry-leading ANC, 30hr battery, multipoint connection, Hi-Res Audio certified",                  price:14995,  originalPrice:29990,  discount:50, category:"Electronics",     brand:"Sony",           ratings:4.8, numOfReviews:1234, stock:80,  images:[{url:"https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=400&fit=crop"}] },
  { _id:"35", name:"OnePlus 12 5G",                 description:"Snapdragon 8 Gen 3, 50MP Hasselblad triple camera, 5400mAh, 100W SuperVOOC charging",               price:49999,  originalPrice:64999,  discount:23, category:"Electronics",     brand:"OnePlus",        ratings:4.7, numOfReviews:2341, stock:45,  images:[{url:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=400&fit=crop"}] },
  { _id:"36", name:"iPad Air M2 (10.9\")",          description:"Apple M2 chip, 64GB, 10.9\" Liquid Retina, Touch ID, USB-C, compatible with Apple Pencil",          price:59900,  originalPrice:74900,  discount:20, category:"Electronics",     brand:"Apple",          ratings:4.8, numOfReviews:987,  stock:35,  images:[{url:"https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=400&fit=crop"}] },
  { _id:"37", name:"Samsung 55\" QLED 4K Smart TV", description:"Quantum Dot technology, HDR10+, Tizen OS, Alexa built-in, 3 HDMI, ultra-slim design",              price:54999,  originalPrice:79999,  discount:31, category:"Electronics",     brand:"Samsung",        ratings:4.6, numOfReviews:1567, stock:20,  images:[{url:"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=400&fit=crop"}] },
  { _id:"38", name:"Apple AirPods Pro (2nd Gen)",   description:"H2 chip, Active Noise Cancellation, Adaptive Transparency, USB-C MagSafe case",                    price:19900,  originalPrice:26900,  discount:26, category:"Electronics",     brand:"Apple",          ratings:4.7, numOfReviews:3210, stock:100, images:[{url:"https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&h=400&fit=crop"}] },
  { _id:"39", name:"Lenovo IdeaPad Slim 5 Laptop",  description:"AMD Ryzen 5 7530U, 16GB RAM, 512GB SSD, 15.6\" FHD IPS display, backlit keyboard",                 price:52999,  originalPrice:69999,  discount:24, category:"Electronics",     brand:"Lenovo",         ratings:4.5, numOfReviews:1123, stock:28,  images:[{url:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop"}] },
  { _id:"40", name:"Canon EOS R50 Camera",          description:"24.2MP APS-C sensor, 4K video, dual AF, beginner-friendly mirrorless, Wi-Fi & Bluetooth",          price:57990,  originalPrice:74990,  discount:23, category:"Electronics",     brand:"Canon",          ratings:4.8, numOfReviews:678,  stock:18,  images:[{url:"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=400&fit=crop"}] },
  { _id:"41", name:"JBL Charge 5 Bluetooth Speaker",description:"Waterproof IP67, 20hr playtime, USB-C power bank, PartyBoost multi-speaker pairing",               price:9999,   originalPrice:13999,  discount:29, category:"Electronics",     brand:"JBL",            ratings:4.6, numOfReviews:2456, stock:120, images:[{url:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=400&fit=crop"}] },
  { _id:"42", name:"Logitech MX Master 3S Mouse",   description:"8000 DPI laser sensor, quiet clicks, USB-C fast charge, ergonomic design, multi-device",           price:8995,   originalPrice:11995,  discount:25, category:"Electronics",     brand:"Logitech",       ratings:4.8, numOfReviews:1890, stock:90,  images:[{url:"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=400&fit=crop"}] },
  { _id:"43", name:"PlayStation 5 Slim Console",    description:"4K gaming, ray tracing, DualSense controller, 1TB SSD, Ultra HD Blu-ray disc drive",               price:44990,  originalPrice:54990,  discount:18, category:"Electronics",     brand:"Sony",           ratings:4.9, numOfReviews:3456, stock:15,  images:[{url:"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=400&fit=crop"}] },
  { _id:"44", name:"Kindle Paperwhite 16GB",        description:"6.8\" glare-free display, adjustable warm light, 10-week battery, waterproof, USB-C",              price:12999,  originalPrice:16999,  discount:24, category:"Electronics",     brand:"Amazon",         ratings:4.7, numOfReviews:5678, stock:200, images:[{url:"https://images.unsplash.com/photo-1592359114411-e8f45450b1e7?w=500&h=400&fit=crop"}] },

  // ── FASHION (15 products) ──────────────────────────────────────────────────
  { _id:"6",  name:"Levi's 511 Slim Fit Jeans",     description:"Classic slim fit, 98% cotton 2% elastane, dark indigo wash, comfortable all-day stretch",           price:3499,   category:"Fashion",          brand:"Levi's",         ratings:4.5, numOfReviews:1234, stock:250, images:[{url:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=400&fit=crop"}] },
  { _id:"7",  name:"Nike Air Max 270",               description:"Max Air 270° heel unit, breathable mesh upper, foam midsole, durable rubber outsole",               price:12999,  category:"Fashion",          brand:"Nike",           ratings:4.7, numOfReviews:2456, stock:180, images:[{url:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop"}] },
  { _id:"8",  name:"Adidas Originals Hoodie",        description:"70% cotton 30% polyester, iconic Trefoil logo, kangaroo pocket, ribbed cuffs and hem",             price:4999,   category:"Fashion",          brand:"Adidas",         ratings:4.6, numOfReviews:890,  stock:200, images:[{url:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=400&fit=crop"}] },
  { _id:"9",  name:"Women's Designer Kurti",         description:"Elegant floral print, 100% soft cotton, 3/4 sleeves, knee length, available in 6 sizes",           price:1299,   category:"Fashion",          brand:"Biba",           ratings:4.6, numOfReviews:1567, stock:350, images:[{url:"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&h=400&fit=crop"}] },
  { _id:"10", name:"Ray-Ban Aviator Sunglasses",     description:"Classic gold metal frame, polarized UV400 green lens, iconic teardrop shape since 1937",            price:7999,   category:"Fashion",          brand:"Ray-Ban",        ratings:4.8, numOfReviews:2345, stock:150, images:[{url:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=400&fit=crop"}] },
  { _id:"45", name:"Puma Training T-Shirt",          description:"Moisture-wicking DryCELL fabric, slim fit, anti-odour, perfect for gym or casual wear",            price:1299,   originalPrice:1799,   discount:28, category:"Fashion",          brand:"Puma",           ratings:4.5, numOfReviews:2100, stock:300, images:[{url:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=400&fit=crop"}] },
  { _id:"46", name:"Men's Formal Shirt – White",     description:"100% premium cotton, slim fit, spread collar, wrinkle-resistant, available sizes S–XXL",            price:1599,   originalPrice:2499,   discount:36, category:"Fashion",          brand:"Van Heusen",     ratings:4.4, numOfReviews:1890, stock:280, images:[{url:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=400&fit=crop"}] },
  { _id:"47", name:"Women's Floral Summer Dress",    description:"Lightweight chiffon, flowy silhouette, V-neck, sleeveless, knee-length, 6 colour options",          price:1999,   originalPrice:2999,   discount:33, category:"Fashion",          brand:"Zara",           ratings:4.7, numOfReviews:1456, stock:220, images:[{url:"https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&h=400&fit=crop"}] },
  { _id:"48", name:"Woodland Leather Casual Shoes",  description:"Full-grain leather upper, rubber lug sole, memory foam insole, water-resistant",                    price:3499,   originalPrice:4999,   discount:30, category:"Fashion",          brand:"Woodland",       ratings:4.6, numOfReviews:1234, stock:160, images:[{url:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop&sat=-100"}] },
  { _id:"49", name:"Women's Leather Handbag",        description:"Genuine PU leather, spacious interior, 3 compartments, gold-tone hardware, detachable strap",       price:2999,   originalPrice:4499,   discount:33, category:"Fashion",          brand:"Baggit",         ratings:4.7, numOfReviews:987,  stock:120, images:[{url:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=400&fit=crop"}] },
  { _id:"50", name:"Titan Analog Watch – Black",     description:"Stainless steel case, sapphire crystal glass, 100m water resistance, leather strap",                price:4999,   originalPrice:7499,   discount:33, category:"Fashion",          brand:"Titan",          ratings:4.6, numOfReviews:2340, stock:180, images:[{url:"https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&h=400&fit=crop"}] },
  { _id:"51", name:"Men's Winter Puffer Jacket",     description:"Water-repellent shell, 400-fill power down insulation, packable, 4 zip pockets",                    price:4999,   originalPrice:7999,   discount:38, category:"Fashion",          brand:"The North Face",  ratings:4.8, numOfReviews:876,  stock:140, images:[{url:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=400&fit=crop"}] },
  { _id:"52", name:"Wildcraft 40L Hiking Backpack",  description:"Water-resistant 600D polyester, padded shoulder straps, laptop sleeve, rain cover included",        price:2499,   originalPrice:3999,   discount:38, category:"Fashion",          brand:"Wildcraft",      ratings:4.5, numOfReviews:1123, stock:200, images:[{url:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop"}] },
  { _id:"53", name:"Women's High-Waist Yoga Pants",  description:"4-way stretch, squat-proof, moisture-wicking, high waist, 7/8 length, 5 pockets",                  price:1499,   originalPrice:2299,   discount:35, category:"Fashion",          brand:"Decathlon",      ratings:4.6, numOfReviews:2890, stock:250, images:[{url:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&h=400&fit=crop"}] },
  { _id:"54", name:"Fastrack Neon Digital Watch",    description:"Resin case, digital display with backlight, stopwatch, alarm, water-resistant 50m",                  price:1299,   originalPrice:1999,   discount:35, category:"Fashion",          brand:"Fastrack",       ratings:4.3, numOfReviews:1567, stock:320, images:[{url:"https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=400&fit=crop"}] },
  { _id:"55", name:"Men's Cargo Shorts",             description:"100% cotton twill, 6 pockets including cargo pockets, belt loops, relaxed fit",                     price:999,    originalPrice:1499,   discount:33, category:"Fashion",          brand:"Roadster",       ratings:4.4, numOfReviews:1890, stock:300, images:[{url:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=400&fit=crop"}] },

  // ── HOME & KITCHEN (14 products) ──────────────────────────────────────────
  { _id:"11", name:"Philips Air Fryer HD9252",       description:"Rapid Air technology, 4.1L, 7 digital presets, touchscreen, dishwasher-safe basket",                price:12999,  category:"Home & Kitchen",   brand:"Philips",        ratings:4.6, numOfReviews:1234, stock:80,  images:[{url:"https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=400&fit=crop"}] },
  { _id:"12", name:"Prestige Induction Cooktop",     description:"2000W, feather-touch panel, 8 preset menus, child-lock, auto-shutoff, ISI certified",               price:3299,   category:"Home & Kitchen",   brand:"Prestige",       ratings:4.4, numOfReviews:890,  stock:150, images:[{url:"https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500&h=400&fit=crop"}] },
  { _id:"13", name:"Milton Thermosteel Bottle 1L",   description:"18/8 stainless steel double wall, 24hr cold & 12hr hot, leak-proof lid, BPA-free",                  price:699,    category:"Home & Kitchen",   brand:"Milton",         ratings:4.5, numOfReviews:2345, stock:500, images:[{url:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=400&fit=crop"}] },
  { _id:"14", name:"Bajaj Mixer Grinder 750W",       description:"3 stainless steel jars (1.5L+1L+0.4L), 750W copper motor, overload protection, 2yr warranty",      price:4499,   category:"Home & Kitchen",   brand:"Bajaj",          ratings:4.5, numOfReviews:890,  stock:120, images:[{url:"https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=400&fit=crop"}] },
  { _id:"56", name:"Instant Pot Duo 7-in-1 Cooker",  description:"Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker & food warmer, 6L",        price:9999,   originalPrice:13999,  discount:29, category:"Home & Kitchen",   brand:"Instant Pot",    ratings:4.8, numOfReviews:3210, stock:60,  images:[{url:"https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=400&fit=crop&hue=200"}] },
  { _id:"57", name:"Godrej Refrigerator 265L",       description:"Frost-free, 3-star energy rating, toughened glass shelves, large vegetable tray, crisper",          price:28999,  originalPrice:36999,  discount:22, category:"Home & Kitchen",   brand:"Godrej",         ratings:4.5, numOfReviews:1450, stock:25,  images:[{url:"https://images.unsplash.com/photo-1584568694244-14fbbc5cef21?w=500&h=400&fit=crop"}] },
  { _id:"58", name:"IFB Front Load Washing Machine", description:"6kg capacity, 6 motion wash, silver nano technology, in-built heater, 2yr warranty",               price:31999,  originalPrice:42999,  discount:26, category:"Home & Kitchen",   brand:"IFB",            ratings:4.6, numOfReviews:987,  stock:20,  images:[{url:"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&h=400&fit=crop"}] },
  { _id:"59", name:"Bosch Dishwasher 12 Place",      description:"12 place settings, 5 programs, half load function, auto door open drying, energy-efficient",        price:34999,  originalPrice:44999,  discount:22, category:"Home & Kitchen",   brand:"Bosch",          ratings:4.7, numOfReviews:654,  stock:15,  images:[{url:"https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500&h=400&fit=crop"}] },
  { _id:"60", name:"Havells Ceiling Fan 1200mm",     description:"BLDC motor, 5-star energy rated, remote control, 52W power consumption, anti-dust blade",           price:3499,   originalPrice:4999,   discount:30, category:"Home & Kitchen",   brand:"Havells",        ratings:4.5, numOfReviews:2345, stock:180, images:[{url:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop"}] },
  { _id:"61", name:"Dyson V12 Detect Slim Vacuum",   description:"Laser dust detection, HEPA filtration, 60-min runtime, LCD screen, lightweight 2.2kg",             price:42900,  originalPrice:54900,  discount:22, category:"Home & Kitchen",   brand:"Dyson",          ratings:4.8, numOfReviews:876,  stock:30,  images:[{url:"https://images.unsplash.com/photo-1558317374-067fb43f03a0?w=500&h=400&fit=crop"}] },
  { _id:"62", name:"Nonstick Cookware Set 5-Piece",  description:"Hard anodised aluminium, PFOA-free coating, induction-compatible, glass lids, 2yr warranty",       price:3999,   originalPrice:5999,   discount:33, category:"Home & Kitchen",   brand:"Prestige",       ratings:4.5, numOfReviews:1890, stock:140, images:[{url:"https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&h=400&fit=crop"}] },
  { _id:"63", name:"Borosil Glass Lunch Box 3-Tier", description:"Borosilicate glass, microwave & oven safe, airtight steel clips, leak-proof, 320ml each tier",     price:1199,   originalPrice:1799,   discount:33, category:"Home & Kitchen",   brand:"Borosil",        ratings:4.4, numOfReviews:1123, stock:300, images:[{url:"https://images.unsplash.com/photo-1547558840-8ad6e0a6fa4f?w=500&h=400&fit=crop"}] },
  { _id:"64", name:"Philips Hand Blender 650W",      description:"Turbo boost button, stainless steel blending shaft, detachable for easy cleaning, BPA-free jar",    price:2499,   originalPrice:3499,   discount:29, category:"Home & Kitchen",   brand:"Philips",        ratings:4.6, numOfReviews:987,  stock:100, images:[{url:"https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=400&fit=crop&hue=60"}] },
  { _id:"65", name:"Solimo Cotton Bed Sheet King",   description:"400 thread count, 100% cotton, king size, 1 flat sheet + 2 pillow covers, machine washable",       price:1499,   originalPrice:2299,   discount:35, category:"Home & Kitchen",   brand:"Amazon Basics",  ratings:4.3, numOfReviews:2345, stock:250, images:[{url:"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=400&fit=crop"}] },

  // ── BOOKS (12 products) ────────────────────────────────────────────────────
  { _id:"15", name:"Rich Dad Poor Dad",              description:"Robert Kiyosaki's revolutionary guide to financial intelligence and building lasting wealth",        price:399,    category:"Books",            brand:"Penguin",        ratings:4.8, numOfReviews:3456, stock:300, images:[{url:"https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500&h=400&fit=crop"}] },
  { _id:"16", name:"Atomic Habits",                  description:"James Clear's proven framework for building good habits, breaking bad ones, mastering tiny behaviors",price:499,   category:"Books",            brand:"Penguin",        ratings:4.9, numOfReviews:4567, stock:280, images:[{url:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=400&fit=crop"}] },
  { _id:"17", name:"The Alchemist",                  description:"Paulo Coelho's global bestseller — Santiago's magical journey following his dream across the desert", price:350,   category:"Books",            brand:"Harper Collins", ratings:4.7, numOfReviews:5678, stock:320, images:[{url:"https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=400&fit=crop"}] },
  { _id:"18", name:"Sapiens",                        description:"Yuval Noah Harari's sweeping narrative of humankind from Stone Age caves to 21st century labs",     price:599,    category:"Books",            brand:"Harper",         ratings:4.8, numOfReviews:2890, stock:220, images:[{url:"https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&h=400&fit=crop"}] },
  { _id:"66", name:"The Psychology of Money",        description:"Morgan Housel's 19 timeless lessons on wealth, greed, and happiness from a behavioural lens",       price:349,    originalPrice:499,    discount:30, category:"Books",            brand:"Jaico",          ratings:4.8, numOfReviews:3100, stock:280, images:[{url:"https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&h=400&fit=crop"}] },
  { _id:"67", name:"Think and Grow Rich",            description:"Napoleon Hill's timeless classic — 13 principles of personal success distilled from 500 rich men",  price:299,    originalPrice:449,    discount:33, category:"Books",            brand:"Rupa",           ratings:4.7, numOfReviews:2678, stock:350, images:[{url:"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=400&fit=crop"}] },
  { _id:"68", name:"Deep Work – Cal Newport",        description:"Rules for focused success in a distracted world — the superpower of the 21st century economy",      price:450,    originalPrice:599,    discount:25, category:"Books",            brand:"Grand Central",  ratings:4.6, numOfReviews:1890, stock:200, images:[{url:"https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&h=400&fit=crop"}] },
  { _id:"69", name:"Harry Potter Box Set (7 Books)", description:"Complete J.K. Rowling collection in a collector's box — Philosopher's Stone to Deathly Hallows",   price:3999,   originalPrice:5999,   discount:33, category:"Books",            brand:"Bloomsbury",     ratings:4.9, numOfReviews:7890, stock:80,  images:[{url:"https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=500&h=400&fit=crop"}] },
  { _id:"70", name:"Zero to One – Peter Thiel",      description:"Notes on startups and how to build the future — essential reading for every entrepreneur",          price:499,    originalPrice:699,    discount:29, category:"Books",            brand:"Currency",       ratings:4.7, numOfReviews:2100, stock:230, images:[{url:"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&h=400&fit=crop"}] },
  { _id:"71", name:"The 5 AM Club – Robin Sharma",   description:"Own your morning, elevate your life — the 20/20/20 formula for peak performance",                  price:399,    originalPrice:599,    discount:33, category:"Books",            brand:"Harper Thorsons", ratings:4.5, numOfReviews:1456, stock:260, images:[{url:"https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&h=400&fit=crop"}] },
  { _id:"72", name:"Ikigai – Japanese Life Philosophy",description:"Discover your reason for being — the Japanese concept for a long, happy, meaningful life",       price:299,    originalPrice:399,    discount:25, category:"Books",            brand:"Arrow",          ratings:4.6, numOfReviews:2345, stock:310, images:[{url:"https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&h=400&fit=crop"}] },
  { _id:"73", name:"Wings of Fire – A.P.J. Kalam",   description:"The inspiring autobiography of India's Missile Man and beloved former President",                  price:199,    originalPrice:299,    discount:33, category:"Books",            brand:"Universities Press", ratings:4.9, numOfReviews:6789, stock:400, images:[{url:"https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=400&fit=crop"}] },

  // ── SPORTS & FITNESS (12 products) ───────────────────────────────────────
  { _id:"19", name:"Yoga Mat Premium 6mm",           description:"Anti-slip TPE surface, eco-friendly, dual-texture reversible design, includes carry strap bag",     price:999,    category:"Sports & Fitness", brand:"Strauss",        ratings:4.4, numOfReviews:890,  stock:200, images:[{url:"https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=400&fit=crop"}] },
  { _id:"20", name:"Dumbbells Set 10kg",             description:"Rubber-coated hexagonal, anti-roll design, chrome handle, pair of 2×5kg, home gym essential",       price:1899,   category:"Sports & Fitness", brand:"Kore",           ratings:4.6, numOfReviews:567,  stock:150, images:[{url:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop"}] },
  { _id:"21", name:"Cricket Bat Kashmir Willow",     description:"Full size Grade-1 Kashmir willow, pre-knocked blade, toe guard, rubber grip, net-practice ready",   price:1499,   category:"Sports & Fitness", brand:"Cosco",          ratings:4.2, numOfReviews:456,  stock:100, images:[{url:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=400&fit=crop"}] },
  { _id:"22", name:"Football Size 5",               description:"FIFA-quality PU construction, butyl inner bladder, 32-panel stitched design, match grade",          price:899,    category:"Sports & Fitness", brand:"Nivia",          ratings:4.4, numOfReviews:789,  stock:180, images:[{url:"https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=500&h=400&fit=crop"}] },
  { _id:"74", name:"Resistance Bands Set (5 Bands)", description:"Latex loop bands, 5 resistance levels, includes handles, door anchor, ankle straps & carry bag",   price:699,    originalPrice:999,    discount:30, category:"Sports & Fitness", brand:"Boldfit",        ratings:4.3, numOfReviews:1890, stock:250, images:[{url:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&h=400&fit=crop"}] },
  { _id:"75", name:"Yonex Nanoflare 001 Racket",    description:"Carbon nanotube frame, slim shaft, super-light 77g, fast swing speed, with full cover",             price:2999,   originalPrice:3999,   discount:25, category:"Sports & Fitness", brand:"Yonex",          ratings:4.7, numOfReviews:1234, stock:90,  images:[{url:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=400&fit=crop"}] },
  { _id:"76", name:"Adjustable Skipping Rope",       description:"Ball-bearing PVC rope, foam ergonomic handles, digital counter display, adjustable length",         price:349,    originalPrice:599,    discount:42, category:"Sports & Fitness", brand:"Cockatoo",       ratings:4.2, numOfReviews:2100, stock:300, images:[{url:"https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&h=400&fit=crop"}] },
  { _id:"77", name:"Adidas Running Shoes – Lite",   description:"Litestrike EVA midsole, Cloudfoam comfort, breathable mesh upper, everyday training shoe",         price:3499,   originalPrice:4999,   discount:30, category:"Sports & Fitness", brand:"Adidas",         ratings:4.6, numOfReviews:2890, stock:160, images:[{url:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=400&fit=crop"}] },
  { _id:"78", name:"Protein Shaker Bottle 700ml",   description:"BPA-free Tritan plastic, leak-proof flip cap, mixing ball, graduated markings, dishwasher safe",    price:499,    originalPrice:799,    discount:38, category:"Sports & Fitness", brand:"Boldfit",        ratings:4.5, numOfReviews:3456, stock:400, images:[{url:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=400&fit=crop"}] },
  { _id:"79", name:"Pull-Up Bar Doorframe",          description:"No-screw steel doorframe bar, 150kg max load, telescopic 70–100cm, foam grips, with resistance band",price:1299,  originalPrice:1999,   discount:35, category:"Sports & Fitness", brand:"Kore",           ratings:4.4, numOfReviews:987,  stock:120, images:[{url:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=400&fit=crop"}] },
  { _id:"80", name:"Nivia Storm Basketball Size 7",  description:"Full-grain rubber, deep channel design, excellent grip, ideal for indoor & outdoor courts",          price:1299,   originalPrice:1799,   discount:28, category:"Sports & Fitness", brand:"Nivia",          ratings:4.5, numOfReviews:876,  stock:140, images:[{url:"https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=400&fit=crop"}] },
  { _id:"81", name:"Gym Duffle Bag 40L",             description:"1680D nylon, separate shoe compartment, wet pocket, adjustable strap, reflective strip",            price:1499,   originalPrice:2199,   discount:32, category:"Sports & Fitness", brand:"Puma",           ratings:4.5, numOfReviews:1234, stock:180, images:[{url:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop"}] },

  // ── FRESH FRUITS (12 products) ────────────────────────────────────────────
  { _id:"23", name:"Fresh Apples – Shimla (1kg)",    description:"Hand-picked Himachal orchards, crisp sweet-tart flavour, rich in dietary fibre & antioxidants",     price:180,    category:"Fresh Fruits",     brand:"Fresh Farm",     ratings:4.7, numOfReviews:1234, stock:500, images:[{url:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=400&fit=crop"}] },
  { _id:"24", name:"Alphonso Mangoes (1 Dozen)",      description:"GI-tagged Ratnagiri Alphonso, naturally ripened, zero carbide, golden flesh, divine sweetness",     price:1200,   category:"Fresh Fruits",     brand:"Farm Fresh",     ratings:4.9, numOfReviews:2456, stock:150, images:[{url:"https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=400&fit=crop"}] },
  { _id:"25", name:"Bananas – Robusta (1 Dozen)",     description:"Farm-fresh Robusta, rich in potassium & vitamin B6, energy-dense, sourced directly from farms",    price:60,     category:"Fresh Fruits",     brand:"Fresh Farm",     ratings:4.6, numOfReviews:890,  stock:800, images:[{url:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=400&fit=crop"}] },
  { _id:"26", name:"Fresh Oranges – Nagpur (1kg)",    description:"Famous Nagpur Santra, vitamin C powerhouse, thin skin, juicy segments, tangy-sweet flavour",       price:80,     category:"Fresh Fruits",     brand:"Citrus Fresh",   ratings:4.5, numOfReviews:678,  stock:600, images:[{url:"https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&h=400&fit=crop"}] },
  { _id:"27", name:"Green Grapes – Seedless (500g)",  description:"Nashik vineyard seedless table grapes, plump, sweet, perfectly hydrating, zero seeds",             price:120,    category:"Fresh Fruits",     brand:"Valley Fresh",   ratings:4.7, numOfReviews:1123, stock:400, images:[{url:"https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&h=400&fit=crop"}] },
  { _id:"28", name:"Fresh Pomegranate (1kg)",         description:"Deep-red antioxidant-rich arils, premium quality, polyphenol-dense, sourced from Solapur farms",   price:200,    category:"Fresh Fruits",     brand:"Fruit Basket",   ratings:4.8, numOfReviews:890,  stock:300, images:[{url:"https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&h=400&fit=crop"}] },
  { _id:"29", name:"Papaya – Ripe (1 piece)",         description:"Golden ripe ~1.2kg papaya, ready-to-eat, high vitamin C & digestive papain enzymes",               price:60,     category:"Fresh Fruits",     brand:"Tropical Fresh", ratings:4.4, numOfReviews:567,  stock:200, images:[{url:"https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=500&h=400&fit=crop"}] },
  { _id:"30", name:"Watermelon – Whole (1 piece)",    description:"Seedless sweet red flesh, summer staple, ~4–5kg, 92% water, naturally cooling & hydrating",        price:40,     category:"Fresh Fruits",     brand:"Farm Direct",    ratings:4.6, numOfReviews:1234, stock:100, images:[{url:"https://images.unsplash.com/photo-1563114773-84221bd62daa?w=500&h=400&fit=crop"}] },
  { _id:"31", name:"Fresh Strawberries (250g)",       description:"Mahabaleshwar hill-station berries, deep red, sweet-tart, harvested at peak morning freshness",    price:150,    category:"Fresh Fruits",     brand:"Berry Fresh",    ratings:4.8, numOfReviews:789,  stock:180, images:[{url:"https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&h=400&fit=crop"}] },
  { _id:"32", name:"Kiwi Fruit (6 pieces)",           description:"Fresh imported kiwi, vitamin K & C rich, tangy-sweet, great for smoothies, salads & desserts",    price:200,    category:"Fresh Fruits",     brand:"Exotic Fresh",   ratings:4.7, numOfReviews:456,  stock:250, images:[{url:"https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500&h=400&fit=crop"}] },
  { _id:"33", name:"Dragon Fruit – White (1 piece)",  description:"Exotic pitaya ~300g, mild sweet kiwi-like flavour, magnesium, fibre & vitamin C rich",             price:80,     category:"Fresh Fruits",     brand:"Exotic Fresh",   ratings:4.5, numOfReviews:345,  stock:150, images:[{url:"https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500&h=400&fit=crop"}] },
  { _id:"34", name:"Fresh Pineapple (1 piece)",       description:"Sweet-tangy tropical pineapple ~1.2kg, vitamin C & bromelain rich, farm-fresh daily delivery",     price:60,     category:"Fresh Fruits",     brand:"Tropical Fresh", ratings:4.6, numOfReviews:678,  stock:200, images:[{url:"https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=500&h=400&fit=crop"}] }
];

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.getElementById('loadingScreen').classList.add('hidden'), 1800);
  loadProducts();
  updateCartCount();
  updateWishlistCount();
  initSlider();
  initCountdown();
  setupScrollEffects();
  setupSearchEnter();
});

/* ═══════════════════════════════════════════════════════════════
   HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */
let slideIndex   = 0;
let slideTimer   = null;
const SLIDE_INTERVAL = 4500;

function initSlider() {
  startSlideTimer();
}

function startSlideTimer() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => changeSlide(1), SLIDE_INTERVAL);
}

function changeSlide(dir) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  slides[slideIndex].classList.remove('active');
  dots[slideIndex].classList.remove('active');
  slideIndex = (slideIndex + dir + slides.length) % slides.length;
  slides[slideIndex].classList.add('active');
  dots[slideIndex].classList.add('active');
  startSlideTimer();
}

function goToSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  slides[slideIndex].classList.remove('active');
  dots[slideIndex].classList.remove('active');
  slideIndex = n;
  slides[slideIndex].classList.add('active');
  dots[slideIndex].classList.add('active');
  startSlideTimer();
}

/* ═══════════════════════════════════════════════════════════════
   DEAL-OF-DAY COUNTDOWN
   ═══════════════════════════════════════════════════════════════ */
function initCountdown() {
  const now    = new Date();
  const end    = new Date(now);
  end.setHours(23, 59, 59, 999);
  countdownTarget = end.getTime();
  tickCountdown();
  setInterval(tickCountdown, 1000);
  renderDealCards();
}

function tickCountdown() {
  const diff = countdownTarget - Date.now();
  if (diff <= 0) {
    document.getElementById('cntH').textContent = '00';
    document.getElementById('cntM').textContent = '00';
    document.getElementById('cntS').textContent = '00';
    return;
  }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cntH').textContent = String(h).padStart(2, '0');
  document.getElementById('cntM').textContent = String(m).padStart(2, '0');
  document.getElementById('cntS').textContent = String(s).padStart(2, '0');
}

function renderDealCards() {
  const deals   = mockProducts.filter(p => p.discount).slice(0, 8);
  const container = document.getElementById('dealCards');
  if (!container) return;
  container.innerHTML = deals.map(p => `
    <div class="deal-card" onclick="showProductDetails(${JSON.stringify(p).replace(/"/g, '&quot;')})">
      <img src="${p.images[0].url}" alt="${p.name}"
           onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'" />
      <div class="deal-card-name">${p.name}</div>
      <div class="deal-card-price">₹${p.price.toLocaleString('en-IN')}</div>
      <span class="deal-card-disc">${p.discount}% OFF</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════
   LOAD PRODUCTS
   ═══════════════════════════════════════════════════════════════ */
async function loadProducts() {
  try {
    document.getElementById('loading').style.display = 'flex';
    if (USE_MOCK_DATA) {
      allProducts = mockProducts;
    } else {
      const res  = await fetch(`${API_URL}/products`);
      const data = await res.json();
      allProducts = (data.success && data.products) ? data.products : mockProducts;
    }
    displayProducts(allProducts);
    document.getElementById('productCount').textContent = `${allProducts.length} Products Found`;
    document.getElementById('loading').style.display = 'none';
  } catch {
    allProducts = mockProducts;
    displayProducts(allProducts);
    document.getElementById('productCount').textContent = `${allProducts.length} Products (Demo Mode)`;
    document.getElementById('loading').style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════════════════════
   DISPLAY PRODUCTS
   ═══════════════════════════════════════════════════════════════ */
function displayProducts(products) {
  const grid       = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');

  if (!products.length) {
    grid.innerHTML = '';
    noProducts.style.display = 'block';
    return;
  }
  noProducts.style.display = 'none';
  grid.innerHTML = '';

  products.forEach((product, index) => {
    const card       = document.createElement('div');
    card.className   = 'product-card';
    card.style.animationDelay = `${index * 0.04}s`;

    const imageUrl   = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop';
    const inStock    = product.stock > 0;
    const inWish     = wishlist.some(w => w._id === product._id);
    const hasDisc    = product.discount && product.originalPrice;
    const stars      = Math.round(product.ratings || 0);

    card.innerHTML = `
      <div class="pc-img-wrap">
        <img src="${imageUrl}" alt="${product.name}" class="product-image" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop'" />
        ${hasDisc ? `<span class="pc-badge">${product.discount}% OFF</span>` : (inStock ? `<span class="pc-badge sale">In Stock</span>` : '')}
        <button class="wishlist-btn ${inWish ? 'active' : ''}"
                onclick="event.stopPropagation(); toggleWishlist('${product._id}')">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="pc-body">
        <span class="product-category">${product.category}</span>
        <div class="product-name">${product.name}</div>
        <div class="pc-price-row">
          <span class="pc-price">₹${product.price.toLocaleString('en-IN')}</span>
          ${hasDisc ? `<span class="pc-mrp">₹${product.originalPrice.toLocaleString('en-IN')}</span>
                       <span class="pc-save">${product.discount}% off</span>` : ''}
        </div>
        <div class="pc-rating">
          <span class="rating-pill">
            ${product.ratings || 0} <i class="fas fa-star"></i>
          </span>
          <span class="rating-count">(${(product.numOfReviews || 0).toLocaleString()})</span>
        </div>
        <div class="pc-stock ${inStock ? 'instock' : 'outstock'}">
          ${inStock ? `<i class="fas fa-check-circle"></i> In Stock (${product.stock})` : '<i class="fas fa-times-circle"></i> Out of Stock'}
        </div>
        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${product._id}')"
                ${!inStock ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
          ${inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    `;

    card.addEventListener('click', () => showProductDetails(product));
    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT DETAIL MODAL
   ═══════════════════════════════════════════════════════════════ */
function showProductDetails(product) {
  const modal    = document.getElementById('productModal');
  const body     = document.getElementById('modalBody');
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=500&fit=crop';
  const inStock  = product.stock > 0;
  const hasDisc  = product.discount && product.originalPrice;
  const inWish   = wishlist.some(w => w._id === product._id);

  body.innerHTML = `
    <div class="pd-wrap">
      <div class="pd-img-col">
        <img src="${imageUrl}" alt="${product.name}"
             onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=500&fit=crop'" />
      </div>
      <div class="pd-info-col">
        <span class="pd-cat">${product.category}</span>
        <div class="pd-title">${product.name}</div>
        <div class="pd-brand">Brand: <strong>${product.brand || 'ShopEase'}</strong></div>
        <div class="pd-rating-row">
          <span class="rating-pill">
            ${product.ratings || 0} <i class="fas fa-star"></i>
          </span>
          <span class="rating-count">${(product.numOfReviews || 0).toLocaleString()} ratings</span>
        </div>
        <div class="pd-price-row">
          <span class="pd-price">₹${product.price.toLocaleString('en-IN')}</span>
          ${hasDisc ? `
            <span class="pd-mrp">MRP ₹${product.originalPrice.toLocaleString('en-IN')}</span>
            <span class="pd-disc-pct">${product.discount}% OFF</span>
          ` : ''}
        </div>
        ${hasDisc ? `<div class="pd-save" style="margin-bottom:12px;font-size:.88rem;">
          <i class="fas fa-tag"></i> You save ₹${(product.originalPrice - product.price).toLocaleString('en-IN')}
        </div>` : ''}
        <p class="pd-desc">${product.description || 'No description available.'}</p>
        <div class="pd-stock ${inStock ? 'in' : 'out'}">
          <i class="fas fa-${inStock ? 'check-circle' : 'times-circle'}"></i>
          ${inStock ? `${product.stock} units in stock` : 'Out of Stock'}
        </div>
        <div class="pd-btn-row">
          <button class="btn-pd-cart" onclick="addToCart('${product._id}'); closeModal('productModal');"
                  ${!inStock ? 'disabled' : ''}>
            <i class="fas fa-shopping-cart"></i> ${inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button class="btn-pd-wish ${inWish ? 'active' : ''}"
                  onclick="toggleWishlist('${product._id}'); this.classList.toggle('active');">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'block';
}

/* ═══════════════════════════════════════════════════════════════
   CART
   ═══════════════════════════════════════════════════════════════ */
function addToCart(productId) {
  const product = allProducts.find(p => p._id === productId);
  if (!product) return;
  const existing = cart.find(i => i._id === productId);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity++;
      showNotification(`${product.name} — quantity updated`, 'success');
    } else {
      showNotification('Stock limit reached!', 'error'); return;
    }
  } else {
    cart.push({ ...product, quantity: 1 });
    showNotification(`${product.name} added to cart!`, 'success');
  }
  saveCart();
  updateCartCount();
}

function showCart() {
  const modal    = document.getElementById('cartModal');
  const itemsEl  = document.getElementById('cartItems');
  const subtotal = document.getElementById('cartSubtotal');
  const totalEl  = document.getElementById('cartTotal');
  const savingsEl = document.getElementById('cartSavings');
  const discountEl = document.getElementById('cartDiscount');
  const discRow  = document.getElementById('cartDiscountRow');

  if (!cart.length) {
    itemsEl.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#999;">
        <i class="fas fa-shopping-cart" style="font-size:4rem;margin-bottom:20px;color:#e0e0e0;"></i>
        <h3 style="margin-bottom:8px;color:#555;">Your cart is empty</h3>
        <p style="font-size:.9rem;">Add products to get started</p>
      </div>`;
    subtotal.textContent = '0'; totalEl.textContent = '0';
    savingsEl.textContent = '0';
    if (discRow) discRow.style.display = 'none';
  } else {
    let total = 0, totalSavings = 0;
    itemsEl.innerHTML = '';
    cart.forEach((item, idx) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      if (item.discount && item.originalPrice) {
        totalSavings += (item.originalPrice - item.price) * item.quantity;
      }
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.images?.[0]?.url || ''}" alt="${item.name}" class="cart-item-img"
             onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=90&h=90&fit=crop'" />
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-brand">${item.brand || ''}</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="ci-price">₹${item.price.toLocaleString('en-IN')}</span>
            ${item.originalPrice ? `<span class="ci-mrp">₹${item.originalPrice.toLocaleString('en-IN')}</span>
              <span class="ci-disc">${item.discount}% off</span>` : ''}
          </div>
          <div class="ci-qty">
            <button class="qty-btn" onclick="updateQuantity(${idx},-1)"><i class="fas fa-minus"></i></button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${idx},1)"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <div class="ci-actions">
          <span class="ci-total">₹${lineTotal.toLocaleString('en-IN')}</span>
          <button class="btn-remove" onclick="removeFromCart(${idx})"><i class="fas fa-trash"></i> Remove</button>
        </div>
      `;
      itemsEl.appendChild(div);
    });
    subtotal.textContent = total.toLocaleString('en-IN');
    totalEl.textContent  = total.toLocaleString('en-IN');
    savingsEl.textContent = totalSavings.toLocaleString('en-IN');
    if (discountEl) discountEl.textContent = totalSavings.toLocaleString('en-IN');
    if (discRow) discRow.style.display = totalSavings > 0 ? 'flex' : 'none';
  }
  modal.style.display = 'block';
}

function updateQuantity(index, change) {
  const item    = cart[index];
  const product = allProducts.find(p => p._id === item._id);
  if (!product) return;
  const newQty = item.quantity + change;
  if (newQty <= 0) { removeFromCart(index); return; }
  if (newQty > product.stock) { showNotification('Stock limit reached!', 'error'); return; }
  item.quantity = newQty;
  saveCart(); updateCartCount(); showCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart(); updateCartCount(); showCart();
  showNotification('Item removed from cart', 'success');
}

function proceedToCheckout() {
  if (!cart.length) { showNotification('Your cart is empty!', 'error'); return; }
  closeModal('cartModal');
  showCheckoutPage();
}

/* ═══════════════════════════════════════════════════════════════
   WISHLIST
   ═══════════════════════════════════════════════════════════════ */
function toggleWishlist(productId) {
  const product = allProducts.find(p => p._id === productId);
  if (!product) return;
  const idx = wishlist.findIndex(i => i._id === productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showNotification('Removed from wishlist', 'success');
  } else {
    wishlist.push(product);
    showNotification('Added to wishlist!', 'success');
  }
  saveWishlist(); updateWishlistCount(); displayProducts(allProducts);
}

function showWishlist() {
  if (!wishlist.length) { showNotification('Your wishlist is empty', 'error'); return; }
  displayProducts(wishlist);
  document.getElementById('productCount').textContent = `${wishlist.length} items in your Wishlist`;
}

/* ═══════════════════════════════════════════════════════════════
   FILTERS & SORT
   ═══════════════════════════════════════════════════════════════ */
function applyFilters() {
  // Sidebar radio values
  const catEl    = document.querySelector('input[name="sbCat"]:checked');
  const priceEl  = document.querySelector('input[name="sbPrice"]:checked');
  const ratingEl = document.querySelector('input[name="sbRating"]:checked');
  const inStockEl = document.getElementById('sbInStock');

  const category  = catEl    ? catEl.value    : '';
  const priceRange = priceEl ? priceEl.value  : '';
  const minRating  = ratingEl ? parseFloat(ratingEl.value || 0) : 0;
  const onlyStock  = inStockEl ? inStockEl.checked : false;

  let filtered = [...allProducts];

  if (category)   filtered = filtered.filter(p => p.category === category);
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(n => n === '' ? Infinity : parseInt(n));
    filtered = filtered.filter(p => p.price >= min && p.price <= (max || Infinity));
  }
  if (minRating)  filtered = filtered.filter(p => (p.ratings || 0) >= minRating);
  if (onlyStock)  filtered = filtered.filter(p => p.stock > 0);

  sortProducts(filtered);
  document.getElementById('productCount').textContent = `${filtered.length} Products Found`;
}

function setSortActive(btn, key) {
  activeSortKey = key;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function sortProducts(list) {
  const sorted = [...list];
  if (activeSortKey === 'price-low')  sorted.sort((a,b) => a.price - b.price);
  if (activeSortKey === 'price-high') sorted.sort((a,b) => b.price - a.price);
  if (activeSortKey === 'rating')     sorted.sort((a,b) => (b.ratings||0) - (a.ratings||0));
  if (activeSortKey === 'newest')     sorted.sort((a,b) => parseInt(b._id) - parseInt(a._id));
  displayProducts(sorted);
}

function filterByCategory(cat) {
  // Tick the matching sidebar radio
  const radios = document.querySelectorAll('input[name="sbCat"]');
  radios.forEach(r => { r.checked = (r.value === cat); });
  applyFilters();
  window.scrollTo({ top: document.querySelector('.shop-section').offsetTop - 130, behavior: 'smooth' });
}

function clearFilters() {
  document.querySelectorAll('input[name="sbCat"]').forEach(r => r.checked = r.value === '');
  document.querySelectorAll('input[name="sbPrice"]').forEach(r => r.checked = r.value === '');
  document.querySelectorAll('input[name="sbRating"]').forEach(r => r.checked = r.value === '');
  const si = document.getElementById('sbInStock'); if (si) si.checked = false;
  activeSortKey = 'popularity';
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === 'popularity'));
  document.getElementById('mainSearch').value = '';
  displayProducts(allProducts);
  document.getElementById('productCount').textContent = `${allProducts.length} Products Found`;
}

function loadHome() { clearFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function showDeals() {
  const deals = allProducts.filter(p => p.discount);
  filterByCategory('');
  setTimeout(() => {
    displayProducts(deals);
    document.getElementById('productCount').textContent = `${deals.length} Deals Available`;
  }, 50);
  window.scrollTo({ top: document.querySelector('.shop-section').offsetTop - 130, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════════════════════════ */
function performSearch() {
  const kw = document.getElementById('mainSearch').value.trim().toLowerCase();
  if (!kw) return;
  const catFilter = document.getElementById('searchCat').value;
  let results = allProducts.filter(p =>
    (p.name.toLowerCase().includes(kw) ||
     (p.description && p.description.toLowerCase().includes(kw)) ||
     (p.brand && p.brand.toLowerCase().includes(kw))) &&
    (!catFilter || p.category === catFilter)
  );
  displayProducts(results);
  document.getElementById('productCount').textContent = `${results.length} results for "${kw}"`;
  window.scrollTo({ top: document.querySelector('.shop-section').offsetTop - 130, behavior: 'smooth' });
}

function setupSearchEnter() {
  const inp = document.getElementById('mainSearch');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(); });
}

/* ═══════════════════════════════════════════════════════════════
   AUTH MODAL
   ═══════════════════════════════════════════════════════════════ */
function showAuthModal(type) {
  const modal   = document.getElementById('authModal');
  const content = document.getElementById('authContent');

  if (type === 'login') {
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:2rem;color:#2874f0;margin-bottom:8px;"><i class="fas fa-user-circle"></i></div>
        <h2 style="font-size:1.4rem;font-weight:800;">Welcome Back!</h2>
        <p style="color:#888;font-size:.88rem;">Sign in to your ShopEase account</p>
      </div>
      <form onsubmit="handleLogin(event)">
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Email Address</label>
          <input type="email" id="loginEmail" required placeholder="you@example.com"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div style="margin-bottom:22px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Password</label>
          <input type="password" id="loginPassword" required placeholder="Enter your password"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <button type="submit" style="width:100%;padding:13px;background:#2874f0;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;">
          Sign In
        </button>
        <p style="text-align:center;margin-top:16px;font-size:.85rem;color:#888;">
          New to ShopEase? <a href="#" onclick="showAuthModal('register')" style="color:#2874f0;font-weight:700;">Create Account</a>
        </p>
      </form>`;
  } else {
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:2rem;color:#2874f0;margin-bottom:8px;"><i class="fas fa-user-plus"></i></div>
        <h2 style="font-size:1.4rem;font-weight:800;">Create Account</h2>
        <p style="color:#888;font-size:.88rem;">Join millions of happy shoppers</p>
      </div>
      <form onsubmit="handleRegister(event)">
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Full Name</label>
          <input type="text" id="regName" required placeholder="Your full name"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Email Address</label>
          <input type="email" id="regEmail" required placeholder="you@example.com"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;" />
        </div>
        <div style="margin-bottom:22px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Password</label>
          <input type="password" id="regPassword" required placeholder="Min 6 characters"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;" />
        </div>
        <button type="submit" style="width:100%;padding:13px;background:#ff6f00;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;">
          Create Free Account
        </button>
        <p style="text-align:center;margin-top:16px;font-size:.85rem;color:#888;">
          Already have an account? <a href="#" onclick="showAuthModal('login')" style="color:#2874f0;font-weight:700;">Sign In</a>
        </p>
      </form>`;
  }
  modal.style.display = 'block';
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  currentUser = { email, name: email.split('@')[0] };
  localStorage.setItem('shopease_user', JSON.stringify(currentUser));
  closeAuthModal();
  showNotification(`Welcome back, ${currentUser.name}!`, 'success');
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  currentUser = { name, email };
  localStorage.setItem('shopease_user', JSON.stringify(currentUser));
  closeAuthModal();
  showNotification(`Account created! Welcome, ${name}!`, 'success');
}

function closeAuthModal() { document.getElementById('authModal').style.display = 'none'; }
function showUserMenu()   { showAuthModal(currentUser ? 'profile' : 'login'); }

/* ═══════════════════════════════════════════════════════════════
   CHECKOUT PAGE (inline)
   ═══════════════════════════════════════════════════════════════ */
function showCheckoutPage() {
  const total    = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings  = cart.reduce((s, i) => s + (i.originalPrice ? (i.originalPrice - i.price) * i.quantity : 0), 0);
  const modal    = document.getElementById('authModal');
  const content  = document.getElementById('authContent');

  content.innerHTML = `
    <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:20px;"><i class="fas fa-lock" style="color:#2874f0;margin-right:8px;"></i>Secure Checkout</h2>
    <div style="background:#e8f5e9;border-radius:8px;padding:14px;margin-bottom:20px;font-size:.88rem;color:#2e7d32;">
      <i class="fas fa-tag"></i> You're saving <strong>₹${savings.toLocaleString('en-IN')}</strong> on this order!
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Full Name</label>
      <input type="text" placeholder="Your full name" style="width:100%;padding:11px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem;outline:none;font-family:inherit;" />
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Delivery Address</label>
      <textarea rows="3" placeholder="House/Flat No., Street, Area, City, State, PIN"
                style="width:100%;padding:11px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.9rem;outline:none;font-family:inherit;resize:none;"></textarea>
    </div>
    <div style="margin-bottom:20px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:8px;color:#555;">Payment Method</label>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${['UPI / PhonePe / GPay','Credit / Debit Card','Net Banking','Cash on Delivery'].map((m,i) => `
          <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:1.5px solid ${i===0?'#2874f0':'#e0e0e0'};border-radius:8px;cursor:pointer;font-size:.88rem;font-weight:500;">
            <input type="radio" name="payMethod" ${i===0?'checked':''} style="accent-color:#2874f0;" />
            ${m}
          </label>`).join('')}
      </div>
    </div>
    <div style="background:#f8f9fa;border-radius:8px;padding:14px;margin-bottom:20px;font-size:.9rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#666;">Order Total</span><span style="font-weight:800;">₹${total.toLocaleString('en-IN')}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#666;">Delivery</span><span style="color:#26a541;font-weight:700;">FREE</span>
      </div>
    </div>
    <button onclick="placeOrder()" style="width:100%;padding:14px;background:#ff6f00;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;">
      <i class="fas fa-lock"></i> Place Order — ₹${total.toLocaleString('en-IN')}
    </button>`;
  modal.style.display = 'block';
}

function placeOrder() {
  cart = []; saveCart(); updateCartCount();
  closeAuthModal();
  showNotification('🎉 Order placed successfully! You will receive a confirmation soon.', 'success');
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */
function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  document.getElementById('cartCount').textContent = count;
}

function updateWishlistCount() {
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

function saveCart()     { localStorage.setItem('shopease_cart',     JSON.stringify(cart));     }
function saveWishlist() { localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist)); }

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function setupScrollEffects() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.pageYOffset > 400);
  });
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function showNotification(msg, type = 'success') {
  const container = document.getElementById('notificationContainer');
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

// Close modals when clicking backdrop
window.addEventListener('click', e => {
  ['authModal','productModal','cartModal'].forEach(id => {
    const el = document.getElementById(id);
    if (e.target === el) el.style.display = 'none';
  });
});

/* ═══════════════════════════════════════════════════════════════
   SELL ON SHOPEASE PAGE
   ═══════════════════════════════════════════════════════════════ */
function showSellPage() {
  const modal   = document.getElementById('authModal');
  const content = document.getElementById('authContent');

  content.innerHTML = `
    <div style="max-width:560px;margin:0 auto;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#2874f0,#ff6f00);border-radius:20px;
                    display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:2rem;color:#fff;">
          <i class="fas fa-store"></i>
        </div>
        <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:6px;">Sell on ShopEase</h2>
        <p style="color:#666;font-size:.92rem;">Join 2 lakh+ sellers across India. Start selling in minutes.</p>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px;">
        ${[
          ['2L+','Active Sellers'],
          ['5Cr+','Happy Customers'],
          ['₹0','Registration Fee']
        ].map(([n,l]) => `
          <div style="text-align:center;background:#f8f9ff;border-radius:12px;padding:16px 8px;">
            <div style="font-size:1.4rem;font-weight:800;color:#2874f0;">${n}</div>
            <div style="font-size:.75rem;color:#666;margin-top:4px;">${l}</div>
          </div>`).join('')}
      </div>

      <!-- Benefits -->
      <div style="margin-bottom:24px;">
        <div style="font-size:.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;">Why sell with us?</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            ['fa-rocket','Zero Registration','Sign up for free in under 5 minutes'],
            ['fa-rupee-sign','Fast Payments','Get paid within 7 days of delivery'],
            ['fa-chart-line','Powerful Dashboard','Track orders, sales & returns in real-time'],
            ['fa-shield-alt','Seller Protection','Full support for genuine seller disputes'],
            ['fa-truck','Logistics Support','We handle pickup & delivery pan-India'],
            ['fa-headset','Dedicated Support','24/7 seller helpline & account manager'],
          ].map(([ic,t,d]) => `
            <div style="display:flex;align-items:center;gap:14px;padding:12px 14px;background:#fafafa;border-radius:10px;border:1px solid #f0f0f0;">
              <div style="width:36px;height:36px;border-radius:10px;background:#e8f0fe;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class="fas ${ic}" style="color:#2874f0;font-size:.9rem;"></i>
              </div>
              <div>
                <div style="font-size:.88rem;font-weight:700;color:#212121;">${t}</div>
                <div style="font-size:.78rem;color:#888;margin-top:2px;">${d}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Register form -->
      <div style="background:#fffbf0;border:1.5px solid #ffe082;border-radius:12px;padding:20px;margin-bottom:20px;">
        <div style="font-size:.9rem;font-weight:700;margin-bottom:14px;color:#e65c00;">
          <i class="fas fa-bolt"></i> Start Selling Today — It's Free!
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input type="text" placeholder="Your Name" style="padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.88rem;outline:none;font-family:inherit;" />
          <input type="tel" placeholder="Mobile Number" style="padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.88rem;outline:none;font-family:inherit;" />
        </div>
        <input type="email" placeholder="Email Address" style="width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.88rem;outline:none;font-family:inherit;margin-bottom:10px;" />
        <select style="width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.88rem;outline:none;font-family:inherit;background:#fff;margin-bottom:14px;">
          <option>Select your business category</option>
          <option>Electronics & Gadgets</option>
          <option>Fashion & Apparel</option>
          <option>Home & Kitchen</option>
          <option>Books & Stationery</option>
          <option>Sports & Fitness</option>
          <option>Fresh Food & Grocery</option>
          <option>Other</option>
        </select>
        <button onclick="sellerSignup()" style="width:100%;padding:13px;background:linear-gradient(135deg,#ff6f00,#ffb300);color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:800;cursor:pointer;font-family:inherit;">
          <i class="fas fa-store"></i> Register as Seller — Free
        </button>
      </div>

      <p style="text-align:center;font-size:.78rem;color:#aaa;">
        By registering you agree to our <a href="#" style="color:#2874f0;">Seller Terms</a> and <a href="#" style="color:#2874f0;">Privacy Policy</a>
      </p>
    </div>
  `;
  modal.style.display = 'block';
}

function sellerSignup() {
  closeAuthModal();
  showNotification('🎉 Seller registration submitted! Our team will contact you within 24 hours.', 'success');
}

/* ═══════════════════════════════════════════════════════════════
   HELP PAGE
   ═══════════════════════════════════════════════════════════════ */
function showHelpPage() {
  const modal   = document.getElementById('authModal');
  const content = document.getElementById('authContent');

  content.innerHTML = `
    <div style="max-width:560px;margin:0 auto;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:72px;height:72px;background:linear-gradient(135deg,#2874f0,#7c4dff);border-radius:20px;
                    display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:2rem;color:#fff;">
          <i class="fas fa-headset"></i>
        </div>
        <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:6px;">How can we help you?</h2>
        <p style="color:#666;font-size:.88rem;">We're available 24/7 — pick a topic below</p>
      </div>

      <!-- Search -->
      <div style="display:flex;background:#f5f5f5;border-radius:10px;overflow:hidden;margin-bottom:24px;">
        <input type="text" placeholder="Search help topics, FAQs..."
               style="flex:1;padding:12px 16px;border:none;background:transparent;font-size:.9rem;outline:none;font-family:inherit;" />
        <button style="padding:12px 18px;background:#2874f0;color:#fff;border:none;font-size:.9rem;cursor:pointer;">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <!-- Quick Topics -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;">
        ${[
          ['fa-box','Track My Order','Check live delivery status'],
          ['fa-undo','Returns & Refunds','Easy 7-day return policy'],
          ['fa-credit-card','Payment Issues','Failed payments, refund status'],
          ['fa-tag','Cancel Order','Cancel before dispatch'],
          ['fa-star','Product Reviews','Review & ratings guide'],
          ['fa-user-cog','Account Help','Login, password, profile'],
        ].map(([ic,t,d]) => `
          <div onclick="showNotification('Opening: ${t}','success')"
               style="display:flex;align-items:center;gap:12px;padding:14px;background:#fafafa;border:1.5px solid #f0f0f0;
                      border-radius:12px;cursor:pointer;transition:all .2s;"
               onmouseover="this.style.borderColor='#2874f0';this.style.background='#f0f5ff'"
               onmouseout="this.style.borderColor='#f0f0f0';this.style.background='#fafafa'">
            <div style="width:38px;height:38px;border-radius:10px;background:#e8f0fe;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fas ${ic}" style="color:#2874f0;font-size:.9rem;"></i>
            </div>
            <div>
              <div style="font-size:.85rem;font-weight:700;color:#212121;">${t}</div>
              <div style="font-size:.73rem;color:#888;margin-top:2px;">${d}</div>
            </div>
          </div>`).join('')}
      </div>

      <!-- FAQs -->
      <div style="margin-bottom:24px;">
        <div style="font-size:.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;">Frequently Asked Questions</div>
        <div id="faqList" style="display:flex;flex-direction:column;gap:8px;">
          ${[
            ['How do I track my order?','Go to "My Orders" in your account and click "Track" next to your order. You\'ll see live GPS tracking once the package is dispatched.'],
            ['What is ShopEase\'s return policy?','We offer a hassle-free 7-day return policy for most items. Electronics have a 10-day replacement guarantee.'],
            ['How long does delivery take?','Standard delivery: 3–5 business days. Express delivery: 1–2 days (available in select cities).'],
            ['Is Cash on Delivery available?','Yes! COD is available on orders up to ₹50,000 across 25,000+ pin codes in India.'],
            ['How do I cancel my order?','You can cancel before the item is dispatched. Go to My Orders → Select Order → Cancel.'],
            ['When will I get my refund?','Refunds are processed within 5–7 business days after the returned item is received.'],
          ].map(([q,a],i) => `
            <div style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
              <div onclick="toggleFaq(${i})" style="padding:13px 16px;font-size:.88rem;font-weight:600;cursor:pointer;
                   display:flex;justify-content:space-between;align-items:center;background:#fff;"
                   id="faqQ${i}">
                ${q}
                <i class="fas fa-chevron-down" style="font-size:.75rem;color:#888;transition:transform .2s;" id="faqIcon${i}"></i>
              </div>
              <div id="faqA${i}" style="display:none;padding:0 16px 14px;font-size:.83rem;color:#555;line-height:1.6;background:#fafafa;">${a}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Contact options -->
      <div style="font-size:.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;">Still need help? Contact us</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
        ${[
          ['fa-phone','Call Us','1800-123-4567','Free 24/7','#26a541'],
          ['fa-comment','Live Chat','Chat Now','Avg. 2 min wait','#2874f0'],
          ['fa-envelope','Email','support@shopease.com','Reply in 4 hrs','#ff6f00'],
        ].map(([ic,t,v,sub,col]) => `
          <div onclick="showNotification('Connecting to ${t}...','success')"
               style="text-align:center;padding:16px 8px;border:1.5px solid #e8e8e8;border-radius:12px;cursor:pointer;transition:all .2s;"
               onmouseover="this.style.borderColor='${col}';this.style.background='#fafafa'"
               onmouseout="this.style.borderColor='#e8e8e8';this.style.background='#fff'">
            <i class="fas ${ic}" style="font-size:1.5rem;color:${col};margin-bottom:8px;display:block;"></i>
            <div style="font-size:.82rem;font-weight:700;color:#212121;">${t}</div>
            <div style="font-size:.75rem;color:#555;margin-top:3px;">${v}</div>
            <div style="font-size:.68rem;color:#aaa;margin-top:2px;">${sub}</div>
          </div>`).join('')}
      </div>

    </div>
  `;
  modal.style.display = 'block';
}

function toggleFaq(i) {
  const ans  = document.getElementById('faqA' + i);
  const icon = document.getElementById('faqIcon' + i);
  const open = ans.style.display === 'block';
  ans.style.display  = open ? 'none' : 'block';
  icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}
