const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopease';
mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB.');
    const count = await Product.countDocuments({});
    console.log(`Total products in database: ${count}`);
    const products = await Product.find({});
    console.log(JSON.stringify(products, null, 2));
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
  });
