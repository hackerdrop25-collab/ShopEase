# 🌱 ShopEase Product Seeding Guide

## ✅ What Has Been Set Up

I've created **16 sample products** with real prices in Indian Rupees (₹):

### 📦 Product Categories:

1. **Electronics** (4 products)
   - iPhone 15 Pro: ₹1,34,900
   - Samsung Galaxy S24 Ultra: ₹1,29,999
   - Sony Headphones: ₹29,990
   - Dell XPS Laptop: ₹1,54,999

2. **Fashion** (5 products)
   - Levi's Jeans: ₹3,499
   - Nike Shoes: ₹8,999
   - Formal Shirt: ₹1,299
   - Women's Kurti: ₹999
   - Leather Handbag: ₹2,499

3. **Home & Kitchen** (3 products)
   - Philips Air Fryer: ₹8,999
   - Induction Cooktop: ₹2,799
   - Water Bottle: ₹499

4. **Books** (2 products)
   - Rich Dad Poor Dad: ₹399
   - Atomic Habits: ₹450

5. **Sports & Fitness** (2 products)
   - Yoga Mat: ₹799
   - Dumbbells Set: ₹1,599

---

## 🚀 How to Add Products to Database

### **IMPORTANT: First Fix MongoDB Connection**

Before seeding, you MUST whitelist your IP in MongoDB Atlas:

1. Go to: https://cloud.mongodb.com/
2. Click: **"Network Access"** (left sidebar)
3. Click: **"+ ADD IP ADDRESS"**
4. Click: **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
5. Click: **"Confirm"**
6. Wait 2 minutes

---

### **Step 1: Run the Seeder Script**

Open a new terminal and run:

```powershell
cd c:\Users\NAVEEN\Downloads\ShopEase\Ecommerce\server
npm run seed
```

This will:
- ✅ Clear any existing products
- ✅ Add all 16 sample products with prices
- ✅ Create an admin user (email: admin@shopease.com, password: Admin@123)

---

### **Step 2: Verify Products Were Added**

Test the products API:

```powershell
curl http://localhost:5000/api/products
```

You should see all products with prices in Rupees!

---

### **Step 3: View Products in Browser**

Open your browser and go to:
- **All Products**: http://localhost:5000/api/products
- **Single Product**: http://localhost:5000/api/products/{id}
- **By Category**: http://localhost:5000/api/products/category/Electronics

---

## 🛒 Example API Responses

### All Products:
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Apple iPhone 15 Pro",
      "price": 134900,
      "category": "Electronics",
      "stock": 50,
      "ratings": 4.8
    }
  ],
  "productsCount": 16
}
```

### When You Buy a Product:
```json
{
  "product": "iPhone 15 Pro",
  "price": "₹1,34,900",
  "quantity": 1,
  "total": "₹1,34,900",
  "paymentMethod": "GPay or Cash"
}
```

---

## 🗑️ To Delete All Products

If you want to remove all products and start fresh:

```powershell
npm run seed:delete
```

---

## 💡 Next Steps

After seeding products, you can:

1. ✅ Browse products: `GET /api/products`
2. ✅ Search products: `GET /api/products?keyword=phone`
3. ✅ Filter by price: `GET /api/products?price[gte]=1000&price[lte]=10000`
4. ✅ Filter by category: `GET /api/products/category/Electronics`
5. ✅ View cart with total price in Rupees
6. ✅ Place orders with GPay or Cash payment

---

## 🎯 What You Asked For

✅ Products now have **real prices in Rupees**
✅ When you click "Buy", you'll see the **₹ amount**
✅ Payment methods available: **GPay or Cash**
✅ No more empty rupee values!

---

## 🔧 Troubleshooting

**Issue**: "Operation timed out"
**Fix**: Whitelist your IP in MongoDB Atlas (see above)

**Issue**: "Products not showing"
**Fix**: Make sure the server is running (`npm run dev`)

**Issue**: "Cannot find module"
**Fix**: Run `npm install` in the server folder

---

Ready to seed your products? Run `npm run seed` now! 🚀
