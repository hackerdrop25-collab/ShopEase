const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI)
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
