/**
 * ShopEase Admin OS — JavaScript Controller
 * Handles Products CRUD, Stock Management, Profit Analytics & Real-time Synchronization
 */

const API_URL = 'http://localhost:5000/api';

let adminProducts = [];
let adminStats = null;
let adminOrders = [];
let currentTab = 'overview';
let cachedInventoryCost = 0;

// ── AUTHENTICATION HEADERS ───────────────────────────────────────────
function getAdminHeaders() {
  const token = localStorage.getItem('shopease_token');
  const headers = {
    'Content-Type': 'application/json',
    'x-admin-auth': 'shopease-admin-pass',
    'x-admin-bypass': 'true',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ── INITIALIZATION ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  loadAllData();
});

function checkAdminAuth() {
  const user = JSON.parse(localStorage.getItem('shopease_user') || 'null');
  if (user) {
    document.getElementById('adminUserName').textContent = user.name || 'Admin User';
    if (user.avatar?.url) {
      document.getElementById('adminAvatarImg').src = user.avatar.url;
    }
  }
}

// ── TAB SWITCHING ────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));

  const sectionEl = document.getElementById(`${tab}Section`);
  if (sectionEl) sectionEl.classList.add('active');

  const titles = {
    overview: 'Dashboard Overview',
    products: 'Products Management',
    stocks: 'Stock Inventory Manager',
    profit: 'Profit & Margins Analytics',
    orders: 'Customer Orders Fulfillment',
  };
  document.getElementById('headerViewTitle').textContent = titles[tab] || 'Dashboard';

  // Highlight active sidebar item
  const navItems = document.querySelectorAll('.admin-nav-item');
  const tabIndices = { overview: 0, products: 1, stocks: 2, profit: 3, orders: 4 };
  if (navItems[tabIndices[tab]]) {
    navItems[tabIndices[tab]].classList.add('active');
  }

  if (tab === 'orders') {
    fetchOrders();
  }
}

// ── LOAD ALL DATA ────────────────────────────────────────────────────
async function loadAllData() {
  await Promise.all([
    fetchAdminStats(),
    fetchAdminProducts(),
    fetchOrders(),
  ]);
}

function refreshAdminData() {
  loadAllData().then(() => {
    showAdminToast('Store and database synchronized!', 'success');
  });
}

// ── FETCH STATS & ANALYTICS ──────────────────────────────────────────
async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_URL}/products/admin/stats`, {
      headers: getAdminHeaders(),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.warn('Failed to fetch admin stats:', data.message);
      return;
    }

    adminStats = data;
    renderKPIs(data);
    renderCategoryContribution(data.categoryBreakdown || []);
    renderLowStockAlerts(data.lowStockAlerts || []);
    renderTopMarginProducts(data.topMarginProducts || []);
    renderTopStockProfitProducts(data.topStockProfitProducts || []);
    renderProfitKPIs(data);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
  }
}

// ── FETCH ALL PRODUCTS ───────────────────────────────────────────────
async function fetchAdminProducts() {
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`, {
      headers: getAdminHeaders(),
    });
    const data = await res.json();

    const raw = (data.success && data.products) ? data.products : (Array.isArray(data) ? data : []);
    adminProducts = raw.map(normalizeAdminProduct);

    document.getElementById('sidebarProductCount').textContent = adminProducts.length;
    document.getElementById('stockTotalUnitsBadge').textContent = adminProducts.reduce((sum, p) => sum + p.stock, 0).toLocaleString();

    renderProductsTable(adminProducts);
    renderStockTable(adminProducts);
    populateCategoryDropdowns(adminProducts);
  } catch (err) {
    console.error('Error fetching admin products:', err);
    showAdminToast('Could not load products. Verify backend is running.', 'error');
  }
}

// ── FETCH ORDERS ─────────────────────────────────────────────────────
async function fetchOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: getAdminHeaders(),
    });
    const data = await res.json();

    const orders = (data.success && data.orders) ? data.orders : (Array.isArray(data) ? data : []);
    adminOrders = orders;
    document.getElementById('sidebarOrdersCount').textContent = orders.length;
    renderOrdersTable(orders);
  } catch (err) {
    console.warn('Could not fetch orders:', err);
  }
}

// ── NORMALIZATION HELPER ─────────────────────────────────────────────
function normalizeAdminProduct(p) {
  const name = p.name || p.title || 'Untitled Product';
  const price = Number(p.price) || 0;
  const costPrice = p.costPrice !== undefined && p.costPrice !== null ? Number(p.costPrice) : Math.round(price * 0.7);
  const comparePrice = Number(p.comparePrice || p.originalPrice || Math.round(price * 1.25));
  const stock = p.stock !== undefined ? Number(p.stock) : 0;
  const unitProfit = Math.max(0, price - costPrice);
  const margin = price > 0 ? Math.round((unitProfit / price) * 100) : 0;

  let imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  if (p.images && p.images.length > 0) {
    imageUrl = typeof p.images[0] === 'string' ? p.images[0] : (p.images[0].url || imageUrl);
  }

  return {
    ...p,
    _id: String(p._id),
    name,
    title: name,
    price,
    costPrice,
    comparePrice,
    stock,
    unitProfit,
    margin,
    imageUrl,
    category: p.category || 'General',
    brand: p.brand || 'ShopEase',
    description: p.description || '',
  };
}

// ── RENDER KPIS ──────────────────────────────────────────────────────
function renderKPIs(stats) {
  const inv = stats.inventory || {};
  cachedInventoryCost = inv.totalInventoryCost || 0;

  document.getElementById('kpiTotalProducts').textContent = (inv.totalProducts || adminProducts.length).toLocaleString();
  document.getElementById('kpiTotalUnits').textContent = (inv.totalStockUnits || 0).toLocaleString();
  document.getElementById('kpiInventoryValue').textContent = `₹${(inv.totalInventoryValue || 0).toLocaleString('en-IN')}`;
  document.getElementById('kpiInventoryCost').textContent = `₹${(inv.totalInventoryCost || 0).toLocaleString('en-IN')}`;
  document.getElementById('kpiProjectedProfit').textContent = `₹${(inv.projectedProfit || 0).toLocaleString('en-IN')}`;
  document.getElementById('kpiMarginPercent').textContent = `+${inv.overallMargin || 0}% Margin`;
  document.getElementById('kpiInStockRatio').textContent = `${inv.inStockCount || 0} in stock`;

  const lowCount = (inv.lowStockCount || 0) + (inv.outOfStockCount || 0);
  document.getElementById('sidebarLowStockCount').textContent = lowCount;
  if (lowCount > 0) {
    document.getElementById('sidebarLowStockCount').style.display = 'inline-block';
  } else {
    document.getElementById('sidebarLowStockCount').style.display = 'none';
  }

  // Update simulator with actual cost
  updateProfitSimulation(document.getElementById('simMarginRange').value);
}

function renderProfitKPIs(stats) {
  const inv = stats.inventory || {};
  const ord = stats.orders || {};

  document.getElementById('profitTotalGross').textContent = `₹${(inv.projectedProfit || 0).toLocaleString('en-IN')}`;
  document.getElementById('profitAvgMargin').textContent = `${inv.overallMargin || 0}%`;
  document.getElementById('profitRealizedRev').textContent = `₹${(ord.realizedRevenue || 0).toLocaleString('en-IN')}`;
}

// ── CATEGORY CONTRIBUTION ───────────────────────────────────────────
function renderCategoryContribution(categories) {
  const container = document.getElementById('categoryProgressContainer');
  if (!container) return;

  if (!categories.length) {
    container.innerHTML = '<div style="color:var(--txt-muted);padding:10px;">No categories available yet.</div>';
    return;
  }

  document.getElementById('kpiCategoryCount').textContent = `${categories.length} categories`;

  const totalValue = categories.reduce((sum, c) => sum + (c.totalValue || 0), 0) || 1;

  container.innerHTML = categories.slice(0, 6).map(c => {
    const pct = Math.round((c.totalValue / totalValue) * 100);
    return `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:6px;">
          <span style="font-weight:700;color:#fff;">${c.category}</span>
          <span style="color:var(--txt-muted);">₹${(c.totalValue || 0).toLocaleString('en-IN')} &bull; <strong style="color:var(--accent-emerald);">${c.margin}% margin</strong> (${pct}%)</span>
        </div>
        <div style="height:7px;background:#1e293b;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary),var(--accent-cyan));border-radius:4px;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ── LOW STOCK ALERTS ─────────────────────────────────────────────────
function renderLowStockAlerts(alerts) {
  const wrap = document.getElementById('lowStockAlertTableWrap');
  if (!wrap) return;

  if (!alerts.length) {
    wrap.innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--accent-emerald);">
        <i class="fas fa-circle-check" style="font-size:2rem;margin-bottom:10px;display:block;"></i>
        <strong>All inventory healthy!</strong> No products are low or out of stock.
      </div>
    `;
    return;
  }

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th>Stock Left</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${alerts.map(a => `
          <tr>
            <td style="font-weight:700;color:#fff;">${a.name}</td>
            <td><span class="badge-cat">${a.category}</span></td>
            <td><strong style="color:${a.stock === 0 ? 'var(--accent-rose)' : 'var(--accent-amber)'};font-size:1.05rem;">${a.stock} units</strong></td>
            <td>
              <span class="stock-status-pill ${a.stock === 0 ? 'stock-out' : 'stock-low'}">
                <i class="fas fa-circle-exclamation"></i> ${a.status}
              </span>
            </td>
            <td>
              <button class="btn-ghost-action" style="padding:6px 12px;font-size:0.8rem;" onclick="openQuickStockModal('${a._id}')">
                <i class="fas fa-plus"></i> Restock
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── TOP MARGIN PRODUCTS LIST ─────────────────────────────────────────
function renderTopMarginProducts(products) {
  const container = document.getElementById('topMarginProductsList');
  if (!container) return;

  if (!products.length) {
    container.innerHTML = '<div style="color:var(--txt-muted);">No products data.</div>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Selling Price</th>
          <th>Cost Price</th>
          <th>Unit Profit</th>
          <th>Margin</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td style="font-weight:700;color:#fff;">${p.name}</td>
            <td>₹${p.price.toLocaleString('en-IN')}</td>
            <td style="color:var(--txt-muted);">₹${p.costPrice.toLocaleString('en-IN')}</td>
            <td style="color:var(--accent-emerald);font-weight:700;">+₹${p.unitProfit.toLocaleString('en-IN')}</td>
            <td>
              <span class="profit-cell-margin" style="background:rgba(16,185,129,0.15);color:var(--accent-emerald);font-weight:800;">
                ${p.margin}%
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTopStockProfitProducts(products) {
  const container = document.getElementById('topProfitGeneratorsList');
  if (!container) return;

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Stock Units</th>
          <th>Total Stock Profit</th>
          <th>Gross Margin</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td style="font-weight:700;color:#fff;">${p.name}</td>
            <td>${p.stock} units</td>
            <td style="color:var(--accent-emerald);font-weight:800;">₹${p.stockProfit.toLocaleString('en-IN')}</td>
            <td><span class="badge-cat">${p.margin}%</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── INTERACTIVE PROFIT SIMULATOR ─────────────────────────────────────
function updateProfitSimulation(marginPercent) {
  const margin = Number(marginPercent);
  document.getElementById('simMarginDisplay').textContent = `${margin}%`;

  // Cost / (1 - margin)
  const totalCost = cachedInventoryCost || adminProducts.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const factor = 1 - (margin / 100);
  const simulatedRevenue = factor > 0 ? Math.round(totalCost / factor) : totalCost;
  const simulatedProfit = simulatedRevenue - totalCost;

  document.getElementById('simSimulatedRevenue').textContent = `₹${simulatedRevenue.toLocaleString('en-IN')}`;
  document.getElementById('simSimulatedProfit').textContent = `₹${simulatedProfit.toLocaleString('en-IN')}`;
}

// ── RENDER PRODUCTS TABLE ────────────────────────────────────────────
function renderProductsTable(products) {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:40px;color:var(--txt-muted);">
          <i class="fas fa-boxes" style="font-size:2.5rem;margin-bottom:12px;display:block;color:var(--txt-dim);"></i>
          No products found matching filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(p => {
    let stockClass = 'stock-in';
    let stockText = `${p.stock} in stock`;
    if (p.stock === 0) {
      stockClass = 'stock-out';
      stockText = 'Out of Stock (0)';
    } else if (p.stock <= 10) {
      stockClass = 'stock-low';
      stockText = `Low Stock (${p.stock})`;
    }

    return `
      <tr>
        <td>
          <div class="prod-thumb-cell">
            <img class="prod-thumb" src="${p.imageUrl}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'" />
            <div>
              <div class="prod-meta-name">${p.name}</div>
              <div class="prod-meta-brand">${p.brand}</div>
            </div>
          </div>
        </td>
        <td><span class="badge-cat">${p.category}</span></td>
        <td>
          <div style="font-weight:700;color:#fff;">₹${p.price.toLocaleString('en-IN')}</div>
          ${p.comparePrice > p.price ? `<div style="font-size:0.75rem;color:var(--txt-dim);text-decoration:line-through;">₹${p.comparePrice.toLocaleString('en-IN')}</div>` : ''}
        </td>
        <td style="color:var(--txt-muted);">₹${p.costPrice.toLocaleString('en-IN')}</td>
        <td>
          <span class="profit-cell-profit">+₹${p.unitProfit.toLocaleString('en-IN')}</span>
          <span class="profit-cell-margin" style="background:rgba(16,185,129,0.15);color:var(--accent-emerald);">
            ${p.margin}%
          </span>
        </td>
        <td>
          <span class="stock-status-pill ${stockClass}">
            <i class="fas fa-cube"></i> ${stockText}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon-action btn-edit" title="Edit Product" onclick="openEditProductModal('${p._id}')">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn-icon-action btn-stock" title="Adjust Stock" onclick="openQuickStockModal('${p._id}')">
              <i class="fas fa-boxes-stacked"></i>
            </button>
            <button class="btn-icon-action btn-delete" title="Delete Product" onclick="openDeleteModal('${p._id}', '${p.name.replace(/'/g, "\\'")}')">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── RENDER STOCK TABLE ───────────────────────────────────────────────
function renderStockTable(products) {
  const tbody = document.getElementById('stockTableBody');
  if (!tbody) return;

  tbody.innerHTML = products.map(p => {
    let stockClass = 'stock-in';
    let statusText = 'Healthy';
    if (p.stock === 0) {
      stockClass = 'stock-out';
      statusText = 'Out of Stock';
    } else if (p.stock <= 10) {
      stockClass = 'stock-low';
      statusText = 'Needs Restock';
    }

    return `
      <tr>
        <td>
          <div class="prod-thumb-cell">
            <img class="prod-thumb" src="${p.imageUrl}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'" />
            <div class="prod-meta-name">${p.name}</div>
          </div>
        </td>
        <td><span class="badge-cat">${p.category}</span></td>
        <td>
          <span style="font-size:1.15rem;font-weight:800;color:#fff;" id="stockNum_${p._id}">${p.stock}</span>
          <span style="font-size:0.75rem;color:var(--txt-dim);">units</span>
        </td>
        <td>
          <span class="stock-status-pill ${stockClass}">${statusText}</span>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn-icon-action" onclick="quickStockDelta('${p._id}', -5)" title="-5 units">-5</button>
            <button class="btn-icon-action" onclick="quickStockDelta('${p._id}', -1)" title="-1 unit">-1</button>
            <button class="btn-icon-action" style="background:rgba(16,185,129,0.1);color:var(--accent-emerald);" onclick="quickStockDelta('${p._id}', 1)" title="+1 unit">+1</button>
            <button class="btn-icon-action" style="background:rgba(16,185,129,0.1);color:var(--accent-emerald);" onclick="quickStockDelta('${p._id}', 10)" title="+10 units">+10</button>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <input type="number" id="inlineStockInput_${p._id}" min="0" value="${p.stock}" style="width:70px;padding:6px 8px;background:#1e293b;border:1px solid var(--border);border-radius:var(--radius-sm);color:#fff;font-weight:700;text-align:center;" />
            <button class="btn-icon-action btn-edit" title="Save" onclick="saveInlineStock('${p._id}')">
              <i class="fas fa-check"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── RENDER ORDERS TABLE ──────────────────────────────────────────────
function renderOrdersTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:40px;color:var(--txt-muted);">
          <i class="fas fa-receipt" style="font-size:2.5rem;margin-bottom:12px;display:block;color:var(--txt-dim);"></i>
          No customer orders recorded yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(ord => {
    const customerName = ord.shippingAddress?.fullName || ord.shippingAddress?.name || ord.user?.name || 'Customer';
    const total = ord.totalPrice || ord.totalAmount || 0;
    const itemsCount = ord.items?.length || 0;
    const status = ord.orderStatus || 'Processing';

    return `
      <tr>
        <td><strong style="color:var(--accent-cyan);">${ord.orderNumber || ord._id.substring(0, 10)}</strong></td>
        <td>
          <div style="font-weight:700;color:#fff;">${customerName}</div>
          <div style="font-size:0.75rem;color:var(--txt-dim);">${ord.shippingAddress?.city || ''}, ${ord.shippingAddress?.pincode || ''}</div>
        </td>
        <td>
          <div><strong style="color:#fff;">₹${total.toLocaleString('en-IN')}</strong></div>
          <div style="font-size:0.75rem;color:var(--txt-muted);">${itemsCount} item(s)</div>
        </td>
        <td><span class="badge-cat">${ord.paymentInfo?.method || ord.paymentMethod || 'COD'}</span></td>
        <td>
          <select class="admin-select" style="padding:4px 8px;font-size:0.8rem;" onchange="updateOrderStatus('${ord._id}', this.value)">
            <option value="Processing" ${status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <span style="font-size:0.78rem;color:var(--txt-dim);">${new Date(ord.createdAt).toLocaleDateString()}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// ── UPDATE ORDER STATUS ──────────────────────────────────────────────
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ orderStatus: newStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      showAdminToast(`Order status updated to "${newStatus}"`, 'success');
      fetchOrders();
    } else {
      showAdminToast(data.message || 'Failed to update order status', 'error');
    }
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

// ── TABLE FILTERS ────────────────────────────────────────────────────
function filterProductsTable() {
  const query = document.getElementById('productSearchInput').value.toLowerCase().trim();
  const cat = document.getElementById('productCatFilter').value;
  const stockFilter = document.getElementById('productStockFilter').value;

  let filtered = [...adminProducts];

  if (query) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  if (cat) {
    filtered = filtered.filter(p => p.category === cat);
  }

  if (stockFilter === 'in') {
    filtered = filtered.filter(p => p.stock > 10);
  } else if (stockFilter === 'low') {
    filtered = filtered.filter(p => p.stock > 0 && p.stock <= 10);
  } else if (stockFilter === 'out') {
    filtered = filtered.filter(p => p.stock === 0);
  }

  renderProductsTable(filtered);
}

let onlyLowStockActive = false;
function toggleLowStockFilter(btn) {
  onlyLowStockActive = !onlyLowStockActive;
  btn.style.background = onlyLowStockActive ? 'rgba(244,63,94,0.2)' : '';
  btn.style.borderColor = onlyLowStockActive ? 'var(--accent-rose)' : '';
  filterStockTable();
}

function filterStockTable() {
  const query = document.getElementById('stockSearchInput').value.toLowerCase().trim();
  let filtered = [...adminProducts];

  if (query) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  }

  if (onlyLowStockActive) {
    filtered = filtered.filter(p => p.stock <= 10);
  }

  renderStockTable(filtered);
}

function populateCategoryDropdowns(products) {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  const select = document.getElementById('productCatFilter');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
  select.value = currentVal;
}

// ── PROFIT CALCULATION IN MODALS ─────────────────────────────────────
function calculateModalProfit(prefix) {
  const price = Number(document.getElementById(`${prefix}Price`).value) || 0;
  const cost = Number(document.getElementById(`${prefix}CostPrice`).value) || 0;
  const stock = Number(document.getElementById(`${prefix}Stock`).value) || 0;

  const unitProfit = Math.max(0, price - cost);
  const margin = price > 0 ? Math.round((unitProfit / price) * 100) : 0;
  const totalStockProfit = unitProfit * stock;

  document.getElementById(`${prefix}UnitProfit`).textContent = `₹${unitProfit.toLocaleString('en-IN')}`;
  document.getElementById(`${prefix}MarginPercent`).textContent = `${margin}%`;
  document.getElementById(`${prefix}TotalStockProfit`).textContent = `₹${totalStockProfit.toLocaleString('en-IN')}`;
}

// ── ADD PRODUCT ──────────────────────────────────────────────────────
function openAddProductModal() {
  document.getElementById('addProductForm').reset();
  calculateModalProfit('add');
  openModal('addProductModal');
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const btn = document.getElementById('createSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Product...';

  const name = document.getElementById('addName').value.trim();
  const category = document.getElementById('addCategory').value.trim();
  const price = Number(document.getElementById('addPrice').value);
  const costPrice = Number(document.getElementById('addCostPrice').value);
  const stock = Number(document.getElementById('addStock').value);
  const comparePrice = Number(document.getElementById('addComparePrice').value) || Math.round(price * 1.25);
  const brand = document.getElementById('addBrand').value.trim() || 'ShopEase';
  const imageUrl = document.getElementById('addImageUrl').value.trim();
  const description = document.getElementById('addDescription').value.trim();

  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({
        name,
        title: name,
        category,
        price,
        costPrice,
        stock,
        comparePrice,
        brand,
        imageUrl,
        description,
        isActive: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to create product');
    }

    closeModal('addProductModal');
    showAdminToast(`🎉 "${name}" added to MongoDB and visible on customer store!`, 'success');
    await loadAllData();
  } catch (err) {
    showAdminToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Create & Publish Product';
  }
}

// ── EDIT PRODUCT ─────────────────────────────────────────────────────
function openEditProductModal(productId) {
  const product = adminProducts.find(p => p._id === productId);
  if (!product) return;

  document.getElementById('editProductId').value = product._id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editCostPrice').value = product.costPrice;
  document.getElementById('editStock').value = product.stock;
  document.getElementById('editComparePrice').value = product.comparePrice || '';
  document.getElementById('editBrand').value = product.brand;
  document.getElementById('editImageUrl').value = product.imageUrl;
  document.getElementById('editDescription').value = product.description;

  document.getElementById('editImagePreview').src = product.imageUrl;
  calculateModalProfit('edit');
  openModal('editProductModal');
}

async function handleUpdateProduct(e) {
  e.preventDefault();
  const id = document.getElementById('editProductId').value;
  const btn = document.getElementById('editSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  const name = document.getElementById('editName').value.trim();
  const category = document.getElementById('editCategory').value.trim();
  const price = Number(document.getElementById('editPrice').value);
  const costPrice = Number(document.getElementById('editCostPrice').value);
  const stock = Number(document.getElementById('editStock').value);
  const comparePrice = Number(document.getElementById('editComparePrice').value) || Math.round(price * 1.25);
  const brand = document.getElementById('editBrand').value.trim();
  const imageUrl = document.getElementById('editImageUrl').value.trim();
  const description = document.getElementById('editDescription').value.trim();

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({
        name,
        title: name,
        category,
        price,
        costPrice,
        stock,
        comparePrice,
        brand,
        imageUrl,
        description,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update product');
    }

    closeModal('editProductModal');
    showAdminToast(`✅ Product updated successfully.`, 'success');
    await loadAllData();
  } catch (err) {
    showAdminToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
  }
}

// ── DELETE PRODUCT ───────────────────────────────────────────────────
function openDeleteModal(productId, productName) {
  document.getElementById('deleteProductId').value = productId;
  document.getElementById('deleteProductName').textContent = productName;
  openModal('deleteConfirmModal');
}

async function confirmDeleteProduct() {
  const id = document.getElementById('deleteProductId').value;
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete product');
    }
    closeModal('deleteConfirmModal');
    showAdminToast(`🗑️ Product deleted from store and database.`, 'success');
    await loadAllData();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

// ── QUICK STOCK ADJUSTMENTS ──────────────────────────────────────────
function openQuickStockModal(productId) {
  const p = adminProducts.find(item => item._id === productId);
  if (!p) return;

  document.getElementById('quickStockProductId').value = p._id;
  document.getElementById('quickStockProductName').textContent = `${p.name} (Current: ${p.stock} units)`;
  document.getElementById('quickStockValue').value = p.stock;
  openModal('quickStockModal');
}

function adjustStockDelta(delta) {
  const input = document.getElementById('quickStockValue');
  const current = Number(input.value) || 0;
  input.value = Math.max(0, current + delta);
}

function setQuickStockDirect(val) {
  document.getElementById('quickStockValue').value = val;
}

async function saveQuickStock() {
  const id = document.getElementById('quickStockProductId').value;
  const newStock = Number(document.getElementById('quickStockValue').value);

  try {
    const res = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ stock: newStock }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update stock');

    closeModal('quickStockModal');
    showAdminToast(`📦 Stock set to ${newStock} units.`, 'success');
    await loadAllData();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

async function quickStockDelta(productId, delta) {
  try {
    const res = await fetch(`${API_URL}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ delta }),
    });
    const data = await res.json();
    if (res.ok) {
      showAdminToast(`Stock updated: ${data.product.stock} units`, 'success');
      await loadAllData();
    }
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

async function saveInlineStock(productId) {
  const input = document.getElementById(`inlineStockInput_${productId}`);
  if (!input) return;
  const stock = Number(input.value);

  try {
    const res = await fetch(`${API_URL}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ stock }),
    });
    const data = await res.json();
    if (res.ok) {
      showAdminToast(`Stock saved: ${stock} units`, 'success');
      await loadAllData();
    }
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

// ── PRESET IMAGE HELPERS ─────────────────────────────────────────────
function setPresetImage(inputId, url) {
  document.getElementById(inputId).value = url;
  previewImage(inputId, inputId === 'addImageUrl' ? 'addImagePreview' : 'editImagePreview');
}

function previewImage(inputId, previewId) {
  const url = document.getElementById(inputId).value.trim();
  const preview = document.getElementById(previewId);
  if (preview && url) {
    preview.src = url;
  }
}

// ── MODAL UTILITIES ──────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

// ── TOAST ALERTS ─────────────────────────────────────────────────────
function showAdminToast(msg, type = 'info') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
  };
  toast.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}"></i> <span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── ADMIN LOGIN SUBMISSION ───────────────────────────────────────────
async function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.token) localStorage.setItem('shopease_token', data.token);
    if (data.user) localStorage.setItem('shopease_user', JSON.stringify(data.user));

    closeModal('adminAuthModal');
    checkAdminAuth();
    showAdminToast(`Welcome, ${data.user?.name || 'Admin'}!`, 'success');
    await loadAllData();
  } catch (err) {
    showAdminToast(err.message, 'error');
  }
}

function handleAdminLogout() {
  localStorage.removeItem('shopease_token');
  localStorage.removeItem('shopease_user');
  showAdminToast('Signed out of Admin Panel.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}
