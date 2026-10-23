/**
 * ShopEase - Initial Store & Admin Setup Script
 * Populates MongoDB with ShopEase products and ensures Admin credentials are ready
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const User = require('./models/User');
const productsSeed = require('./seed/products.seed');

async function setup() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agrifresh';

  const urisToTry = [
    'mongodb://127.0.0.1:27017/agrifresh',
    'mongodb://localhost:27017/agrifresh',
    uri,
  ].filter(Boolean);

  let connected = false;
  for (const u of urisToTry) {
    try {
      await mongoose.connect(u, { serverSelectionTimeoutMS: 4000 });
      console.log(`✅ Connected to MongoDB: ${u}`);
      connected = true;
      break;
    } catch (e) {
      console.warn(`Connection attempt to ${u} failed: ${e.message}`);
    }
  }

  if (!connected) {
    console.error('❌ Could not connect to any MongoDB instance.');
    process.exit(1);
  }

  try {
    // 1. Setup Admin Users
    console.log('\n--- 1. Setting Up Admin Users ---');
    const adminEmail = 'admin@shopease.com';
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin ShopEase',
        email: adminEmail,
        password: 'Admin@123',
        phone: '9876543210',
        role: 'admin',
        isVerified: true,
        isActive: true,
        avatar: {
          public_id: 'admin_avatar',
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
      });
      console.log(`🎉 Admin user created: ${adminEmail} (Password: Admin@123)`);
    } else {
      adminUser.role = 'admin';
      adminUser.isActive = true;
      adminUser.password = 'Admin@123';
      await adminUser.save();
      console.log(`✅ Admin user verified & password reset: ${adminEmail} (Role: admin, Pass: Admin@123)`);
    }

    // Also elevate existing developer accounts to admin
    await User.updateMany(
      { email: { $in: ['naveenpalani1712@gmail.com', 'hackerdrop25@gmail.com'] } },
      { $set: { role: 'admin' } }
    );
    console.log('✅ Promoted naveenpalani1712@gmail.com and hackerdrop25@gmail.com to admin.');

    // 2. Ensure existing products have costPrice
    console.log('\n--- 2. Updating Existing Products with Cost Price ---');
    const existingProducts = await Product.find({});
    for (const p of existingProducts) {
      let needsSave = false;
      if (!p.costPrice || p.costPrice === 0) {
        p.costPrice = Math.round(p.price * 0.68);
        needsSave = true;
      }
      if (!p.comparePrice || p.comparePrice <= p.price) {
        p.comparePrice = Math.round(p.price * 1.25);
        needsSave = true;
      }
      if (needsSave) {
        await p.save();
      }
    }
    console.log(`✅ Verified/Updated cost prices for ${existingProducts.length} existing products.`);

    // 3. Import ShopEase electronics, fashion, books, sports, etc. if not present
    console.log('\n--- 3. Checking ShopEase Catalog Data ---');
    let addedCount = 0;
    for (const seedItem of productsSeed) {
      const exists = await Product.findOne({ name: seedItem.name });
      if (!exists) {
        const price = Number(seedItem.price) || 999;
        const costPrice = Math.round(price * 0.7); // 30% margin
        const comparePrice = Math.round(price * 1.3);

        const newProd = {
          name: seedItem.name,
          title: seedItem.name,
          description: seedItem.description || `High quality ${seedItem.name}`,
          price,
          costPrice,
          comparePrice,
          stock: seedItem.stock !== undefined ? seedItem.stock : 25,
          category: seedItem.category || 'Electronics',
          brand: seedItem.brand || 'ShopEase',
          rating: seedItem.ratings || 4.7,
          numReviews: seedItem.numOfReviews || 250,
          images: seedItem.images && seedItem.images.length > 0 ? seedItem.images : [
            {
              public_id: `prod_${Date.now()}`,
              url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
              altText: seedItem.name,
            },
          ],
          isActive: true,
          isFeatured: true,
        };

        await Product.create(newProd);
        addedCount++;
      }
    }

    console.log(`🎉 Added ${addedCount} ShopEase items to database.`);
    const totalCount = await Product.countDocuments();
    const categories = await Product.distinct('category');
    console.log(`📦 Total active products in MongoDB: ${totalCount}`);
    console.log(`📂 Categories in MongoDB:`, categories);

    console.log('\n========================================');
    console.log('✨ Setup complete!');
    console.log('   Admin Email: admin@shopease.com');
    console.log('   Admin Password: Admin@123');
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

setup();
