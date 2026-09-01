/**
 * ShopEase - Database Seeder
 * Run this script to populate the database with sample products
 * 
 * Usage:
 *   node seed/seeder.js           - Add sample products
 *   node seed/seeder.js --delete  - Remove all products
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const productsData = require('./products.seed');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Import/Seed Products
const importProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany();
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(productsData);
    console.log(`✅ ${products.length} products added successfully!`);

    // Display some sample products
    console.log('\n📦 Sample Products Added:');
    products.slice(0, 5).forEach(product => {
      console.log(`   - ${product.name}: ₹${product.price.toLocaleString('en-IN')}`);
    });

    console.log('\n💰 Total Products Value: ₹' + 
      products.reduce((sum, p) => sum + p.price, 0).toLocaleString('en-IN'));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing products:', error.message);
    process.exit(1);
  }
};

// Delete all products
const deleteProducts = async () => {
  try {
    await Product.deleteMany();
    console.log('🗑️  All products deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting products:', error.message);
    process.exit(1);
  }
};

// Create admin user for testing
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@shopease.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@shopease.com',
        password: 'Admin@123',
        role: 'admin',
        avatar: {
          public_id: 'admin_avatar',
          url: 'https://i.pravatar.cc/150?img=12'
        }
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@shopease.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

// Main execution
const run = async () => {
  await connectDB();

  if (process.argv[2] === '--delete' || process.argv[2] === '-d') {
    await deleteProducts();
  } else {
    await importProducts();
    await createAdminUser();
  }
};

run();
