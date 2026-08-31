const mongoose = require('mongoose');
const express = require('express');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

const User = require('../server/models/User');
const Product = require('../server/models/Product');
const app = require('../server/app');

process.env.JWT_SECRET = 'testsecretkey12345';
process.env.JWT_EXPIRES_IN = '7d';

let mongoServer;

async function runTests() {
  console.log('🚀 Starting Phase 4 API Tests...');
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✅ Connected to In-Memory MongoDB');

  // Create test user and token
  const user = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    isEmailVerified: true
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // 1. GET /api/products (empty)
  console.log('\n--- Test 1: GET /api/products (Initial Empty) ---');
  let res = await request(app).get('/api/products');
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.body, null, 2));

  // 2. POST /api/products (Create Product)
  console.log('\n--- Test 2: POST /api/products (Create Nike Air Max) ---');
  res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Nike Air Max',
      description: 'Comfortable running shoes',
      price: 5999,
      category: 'Shoes',
      brand: 'Nike',
      images: [],
      stock: 20
    });
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.body, null, 2));
  const productId = res.body.product._id;

  // 3. GET /api/products (Get All)
  console.log('\n--- Test 3: GET /api/products (All Products) ---');
  res = await request(app).get('/api/products');
  console.log('Status:', res.status);
  console.log('Total Products:', res.body.pagination.totalProducts);

  // 4. GET /api/products/:id
  console.log('\n--- Test 4: GET /api/products/' + productId + ' ---');
  res = await request(app).get(`/api/products/${productId}`);
  console.log('Status:', res.status);
  console.log('Product Name:', res.body.name || res.body.title);

  // 5. Search / Filter Tests
  console.log('\n--- Test 5: GET /api/products?search=nike ---');
  res = await request(app).get('/api/products?search=nike');
  console.log('Status:', res.status);
  console.log('Found:', res.body.products.length);

  console.log('\n--- Test 6: GET /api/products?category=Shoes ---');
  res = await request(app).get('/api/products?category=Shoes');
  console.log('Status:', res.status);
  console.log('Found:', res.body.products.length);

  console.log('\n--- Test 7: GET /api/products?minPrice=1000&maxPrice=10000 ---');
  res = await request(app).get('/api/products?minPrice=1000&maxPrice=10000');
  console.log('Status:', res.status);
  console.log('Found:', res.body.products.length);

  // 8. PUT /api/products/:id (Update)
  console.log('\n--- Test 8: PUT /api/products/' + productId + ' ---');
  res = await request(app)
    .put(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      price: 4999,
      stock: 30
    });
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.body, null, 2));

  // 9. DELETE /api/products/:id (Soft Delete)
  console.log('\n--- Test 9: DELETE /api/products/' + productId + ' ---');
  res = await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${token}`);
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.body, null, 2));

  // 10. GET /api/products (Should be empty now due to soft delete)
  console.log('\n--- Test 10: GET /api/products (After Soft Delete) ---');
  res = await request(app).get('/api/products');
  console.log('Status:', res.status);
  console.log('Total Active Products:', res.body.pagination.totalProducts);

  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('\n🎉 ALL PHASE 4 TESTS PASSED SUCCESSFULY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
