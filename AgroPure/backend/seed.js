const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");

dotenv.config();

const SAMPLE_PRODUCTS = [
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
  {
    name: "Lady's Finger / Okra",
    description: "Fresh crisp green bhindi grown without chemical sprays.",
    category: "Vegetables",
    price: 65,
    unit: "kg",
    stock: 70,
    images: ["https://images.unsplash.com/photo-1425543103986-22bad73d384a?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Salem, Tamil Nadu",
    organicCertified: true,
    certification: "Organic Farmers Co-op",
  },
  {
    name: "Organic Beetroot",
    description: "Deep red nutrient-dense beetroots packed with essential antioxidants and minerals.",
    category: "Vegetables",
    price: 70,
    unit: "kg",
    stock: 90,
    images: ["https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Hosur, Tamil Nadu",
    organicCertified: true,
    certification: "NPOP Organic",
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
  {
    name: "Organic Papaya",
    description: "Sweet naturally grown red papaya, great for digestion and skin health.",
    category: "Fruits",
    price: 50,
    unit: "kg",
    stock: 55,
    images: ["https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Pollachi, Tamil Nadu",
    organicCertified: true,
    certification: "PGS-India",
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
    name: "Organic Brown Rice",
    description: "Whole grain fiber-rich brown rice for diabetes management and weight loss.",
    category: "Grains & Pulses",
    price: 110,
    unit: "kg",
    stock: 120,
    images: ["https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Cauvery Organic Belt",
    organicCertified: true,
    certification: "PGS-India",
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
  {
    name: "Foxtail Millets (Thinai)",
    description: "Ancient heritage millet rich in dietary fiber, protein, and essential minerals.",
    category: "Grains & Pulses",
    price: 130,
    unit: "kg",
    stock: 90,
    images: ["https://images.unsplash.com/photo-1627735640769-6638062086e9?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Salem, Tamil Nadu",
    organicCertified: true,
    certification: "Traditional Bio-Farm",
  },
  {
    name: "Organic Toor Dal",
    description: "Unpolished split pigeon peas grown naturally without synthetic polish or dyes.",
    category: "Grains & Pulses",
    price: 160,
    unit: "kg",
    stock: 110,
    images: ["https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Gulbarga Organic Cluster",
    organicCertified: true,
    certification: "NPOP Organic",
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
  {
    name: "Green Cardamom",
    description: "Aromatic 8mm bold green cardamom pods with intense natural fragrance.",
    category: "Spices",
    price: 1800,
    unit: "kg",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1608797178974-15b35a64057b?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Idukki, Kerala",
    organicCertified: true,
    certification: "NPOP Organic",
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
  {
    name: "Organic Palm Jaggery",
    description: "Unrefined iron-rich palm jaggery made from fresh palmyra sap.",
    category: "Natural Products",
    price: 160,
    unit: "kg",
    stock: 75,
    images: ["https://images.unsplash.com/photo-1608797178974-15b35a64057b?w=600&auto=format&fit=crop&q=60"],
    farmLocation: "Tirunelveli, Tamil Nadu",
    organicCertified: true,
    certification: "Heritage Organic",
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

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully!");

    // Create or find default seed farmer
    let farmer = await User.findOne({ role: "farmer" });
    if (!farmer) {
      console.log("Creating default Organic Farmer account...");
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

    console.log(`Using farmer ID: ${farmer._id} (${farmer.name})`);

    // Add farmer reference to each sample product
    const productsToInsert = SAMPLE_PRODUCTS.map((item) => ({
      ...item,
      farmer: farmer._id,
      isActive: true,
    }));

    // Optional: remove existing sample products or keep
    console.log(`Seeding ${productsToInsert.length} organic products...`);
    await Product.deleteMany({});
    const inserted = await Product.insertMany(productsToInsert);

    console.log(`✅ Success! Seeded ${inserted.length} products into AgroPure MongoDB database.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
