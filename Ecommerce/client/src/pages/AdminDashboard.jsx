/**
 * AgriFresh - Admin Dashboard
 *
 * Store analytics overview, catalog management (seed/add/edit products),
 * and order status management for AgriFresh store.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/shopping.css';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // New Product Form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Fresh Fruits',
    subcategory: 'Apples & Pears',
    brand: 'AgriFresh',
    unit: '1 kg',
    farmOrigin: 'Organic Valley Farms',
    stock: 50,
    imageUrl: '',
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const prodRes = await api.get('/products?limit=100');
      setProducts(prodRes.data.products || []);

      const orderRes = await api.get('/orders');
      setOrders(orderRes.data.orders || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedCatalog = async () => {
    try {
      setLoading(true);
      await api.post('/products/seed');
      await fetchAdminData();
      setMessage('✅ 100+ Agriculture Catalog Seeded Successfully!');
    } catch (err) {
      setMessage('❌ Failed to seed catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        images: newProduct.imageUrl ? [{ public_id: 'custom', url: newProduct.imageUrl }] : []
      });
      setMessage('✅ Agricultural Product Created Successfully!');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'Fresh Fruits',
        subcategory: 'Apples & Pears',
        brand: 'AgriFresh',
        unit: '1 kg',
        farmOrigin: 'Organic Valley Farms',
        stock: 50,
        imageUrl: ''
      });
      await fetchAdminData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to soft-delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage('✅ Product deleted.');
      await fetchAdminData();
    } catch (err) {
      setMessage('Failed to delete product.');
    }
  };

  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalPrice || 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '28px', color: '#0f172a', margin: 0, fontWeight: '800' }}>🌾 AgriFresh Admin Dashboard</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage farm produce catalog, view metrics, and seed agriculture catalog</p>
        </div>

        <button
          onClick={handleSeedCatalog}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          🚀 Seed 100+ Agri Catalog
        </button>
      </div>

      {message && (
        <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '14px', borderRadius: '12px', marginBottom: '25px', fontWeight: '600', border: '1px solid #bbf7d0' }}>
          {message}
        </div>
      )}

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '35px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#15803d', marginTop: '6px' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Farm Orders</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#16a34a', marginTop: '6px' }}>{orders.length}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Active Agri Products</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#059669', marginTop: '6px' }}>{products.length}</div>
        </div>
      </div>

      {/* Add New Product Form */}
      <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '35px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '18px', fontWeight: '700' }}>➕ Add New Agricultural Item</h3>
        <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input
            type="text"
            placeholder="Product Name (e.g. Organic Shimla Apples)"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <input
            type="text"
            placeholder="Brand / Farm Name (e.g. Himalayan Orchards)"
            value={newProduct.brand}
            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
            required
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <input
            type="number"
            placeholder="Price (₹)"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <input
            type="text"
            placeholder="Unit / Quantity (e.g. 1 kg, 500g, 1 Pack)"
            value={newProduct.unit}
            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
            required
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          >
            <option value="Fresh Fruits">Fresh Fruits</option>
            <option value="Fresh Vegetables">Fresh Vegetables</option>
            <option value="Seeds & Saplings">Seeds & Saplings</option>
            <option value="Farming Tools">Farming Tools</option>
            <option value="Organic Staples">Organic Staples</option>
          </select>

          <input
            type="text"
            placeholder="Farm Location Origin (e.g. Shimla, HP)"
            value={newProduct.farmOrigin}
            onChange={(e) => setNewProduct({ ...newProduct, farmOrigin: e.target.value })}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <input
            type="number"
            placeholder="Stock Quantity"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            required
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <input
            type="text"
            placeholder="Image URL (Unsplash/Direct link)"
            value={newProduct.imageUrl}
            onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <textarea
            placeholder="Item Description & Nutritional Info..."
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            required
            rows={3}
            style={{ gridColumn: 'span 2', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
          />

          <button
            type="submit"
            style={{
              gridColumn: 'span 2',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '15px'
            }}
          >
            🌿 Create Agricultural Item
          </button>
        </form>
      </div>

      {/* Product List Table */}
      <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '15px', fontWeight: '700' }}>🥦 Farm Catalog List</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '10px' }}>Item</th>
              <th style={{ padding: '10px' }}>Category</th>
              <th style={{ padding: '10px' }}>Unit</th>
              <th style={{ padding: '10px' }}>Price</th>
              <th style={{ padding: '10px' }}>Stock</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 15).map((prod) => (
              <tr key={prod._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '600', color: '#0f172a' }}>{prod.title || prod.name}</td>
                <td style={{ padding: '10px', color: '#16a34a', fontWeight: '600' }}>{prod.category}</td>
                <td style={{ padding: '10px', color: '#64748b' }}>{prod.unit || '1 kg'}</td>
                <td style={{ padding: '10px', fontWeight: '700', color: '#15803d' }}>₹{prod.price?.toLocaleString('en-IN')}</td>
                <td style={{ padding: '10px', color: prod.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: '600' }}>{prod.stock}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => handleDeleteProduct(prod._id)}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
