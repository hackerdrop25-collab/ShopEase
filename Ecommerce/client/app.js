/* ═══════════════════════════════════════════════════════════════
   ShopEase — Professional E-Commerce App (Standalone Mode)
   ═══════════════════════════════════════════════════════════════ */

const API_URL = 'http://localhost:5000/api';
const USE_MOCK_DATA = false;

function safeGetStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage for key "${key}":`, err);
    return fallback;
  }
}

let cart = safeGetStorage('shopease_cart', []);
let wishlist = safeGetStorage('shopease_wishlist', []);
let allProducts = [];
let currentUser = safeGetStorage('shopease_user', null);
let activeSortKey = 'popularity';
let countdownTarget = null;

// Helper: build Authorization header from stored JWT token
function getAuthHeaders() {
  const token = localStorage.getItem('shopease_token');
  return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
               : { 'Content-Type': 'application/json' };
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT DATA
   ═══════════════════════════════════════════════════════════════ */
const mockProducts = [];

function getProductFallbackImage(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('sport') || cat.includes('fitness')) {
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500';
  }
  if (cat.includes('book')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500';
  }
  if (cat.includes('kitchen') || cat.includes('home')) {
    return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500';
  }
  if (cat.includes('fashion') || cat.includes('cloth') || cat.includes('wear') || cat.includes('shoe')) {
    return 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500';
  }
  if (cat.includes('fruit') || cat.includes('veg') || cat.includes('staple') || cat.includes('seed')) {
    return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500';
  }
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
}

/* ═══════════════════════════════════════════════════════════════
   LIVE PRODUCT NORMALIZER (Full MongoDB Schema Support)
   ═══════════════════════════════════════════════════════════════ */
function normalizeProduct(p) {
  const name = p.name || p.title || 'Product';
  const price = Number(p.price) || 0;
  const originalPrice = Number(p.comparePrice || p.originalPrice || 0);
  const discount = p.discount || p.discountPercent || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const ratings = Number(p.ratings || p.rating || 4.7);
  const numOfReviews = Number(p.numOfReviews || p.numReviews || 120);

  const fallback = getProductFallbackImage(p.category);
  let imageUrl = fallback;
  if (p.images && p.images.length > 0) {
    imageUrl = typeof p.images[0] === 'string' ? p.images[0] : (p.images[0].url || fallback);
  } else if (p.imageUrl) {
    imageUrl = p.imageUrl;
  }

  return {
    ...p,
    _id: String(p._id),
    name,
    title: name,
    price,
    costPrice: Number(p.costPrice || 0),
    originalPrice,
    comparePrice: originalPrice,
    discount,
    discountPercent: discount,
    ratings,
    numOfReviews,
    imageUrl,
    images: Array.isArray(p.images) && p.images.length > 0
      ? p.images.map(img => typeof img === 'string' ? { url: img } : img)
      : [{ url: imageUrl }],
    stock: p.stock !== undefined ? Number(p.stock) : 0,
    category: p.category || 'General',
    brand: p.brand || 'ShopEase',
    description: p.description || '',
  };
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
function hideLoaderAndPromptAuth() {
  const loader = document.getElementById('loadingScreen');
  if (loader) loader.classList.add('hidden');

  const path = (window.location.pathname || '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();

  if (path.includes('login') || hash.includes('login')) {
    showAuthModal('login');
  } else if (path.includes('register') || hash.includes('register')) {
    showAuthModal('register');
  } else if (!currentUser) {
    // Prompt sign in first on app startup if user is not signed in
    showAuthModal('login');
  }
}

function initApp() {
  setTimeout(hideLoaderAndPromptAuth, 1000);

  const safeInit = (fn, name) => {
    try { fn(); } catch (err) { console.warn(`Error during ${name}:`, err); }
  };

  safeInit(initAmbientBg, 'initAmbientBg');
  safeInit(initTheme, 'initTheme');
  safeInit(loadProducts, 'loadProducts');
  safeInit(updateCartCount, 'updateCartCount');
  safeInit(updateWishlistCount, 'updateWishlistCount');
  safeInit(updateOrdersCount, 'updateOrdersCount');
  safeInit(updateUserUI, 'updateUserUI');
  safeInit(initSlider, 'initSlider');
  safeInit(initCountdown, 'initCountdown');
  safeInit(setupScrollEffects, 'setupScrollEffects');
  safeInit(setupSearchEnter, 'setupSearchEnter');
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ═══════════════════════════════════════════════════════════════
   THEME ENGINE
   ═══════════════════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('shopease_theme') || 'dark';
  changeTheme(saved);
}

function changeTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('shopease_theme', themeName);
  const sel = document.getElementById('themeSelect');
  if (sel) sel.value = themeName;
}

/* Ambient background is handled purely via CSS gradient — no canvas needed */
function initAmbientBg() {
  // Subtle parallax tilt on hero section for polish
  const hero = document.querySelector('.hero-slider-section');
  if (!hero) return;
  hero.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = hero.getBoundingClientRect();
    const cx = (e.clientX - left) / width - 0.5;
    const cy = (e.clientY - top) / height - 0.5;
    hero.style.setProperty('--tilt-x', `${cy * 4}deg`);
    hero.style.setProperty('--tilt-y', `${cx * -4}deg`);
  });
  hero.addEventListener('mouseleave', () => {
    hero.style.setProperty('--tilt-x', '0deg');
    hero.style.setProperty('--tilt-y', '0deg');
  });
}

/* ═══════════════════════════════════════════════════════════════
   HERO SLIDER
   ═══════════════════════════════════════════════════════════════ */
let slideIndex = 0;
let slideTimer = null;
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
  const dots = document.querySelectorAll('.dot');
  slides[slideIndex].classList.remove('active');
  dots[slideIndex].classList.remove('active');
  slideIndex = (slideIndex + dir + slides.length) % slides.length;
  slides[slideIndex].classList.add('active');
  dots[slideIndex].classList.add('active');
  startSlideTimer();
}

function goToSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
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
  const now = new Date();
  const end = new Date(now);
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
  const deals = (allProducts || []).filter(p => (p.discount > 0 || (p.comparePrice && p.comparePrice > p.price))).slice(0, 8);
  const container = document.getElementById('dealCards');
  if (!container) return;
  if (!deals.length) {
    container.innerHTML = '<div style="color:var(--txt3);padding:20px;font-size:0.9rem;">Fresh deals updating soon!</div>';
    return;
  }
  container.innerHTML = deals.map(p => {
    const fb = getProductFallbackImage(p.category);
    const img = p.imageUrl || (p.images && p.images[0]?.url) || fb;
    return `
    <div class="deal-card" onclick="showProductDetails(${JSON.stringify(p).replace(/"/g, '&quot;')})">
      <img src="${img}" alt="${p.name}" onerror="this.src='${fb}'" />
      <div class="deal-card-name">${p.name}</div>
      <div class="deal-card-price">₹${p.price.toLocaleString('en-IN')}</div>
      <span class="deal-card-disc">${p.discount}% OFF</span>
    </div>
  `;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════
   LOAD PRODUCTS (Live from MongoDB Backend API)
   ═══════════════════════════════════════════════════════════════ */
async function loadProducts() {
  const loadingEl = document.getElementById('loading');
  try {
    if (loadingEl) loadingEl.style.display = 'flex';

    const res = await fetch(`${API_URL}/products?limit=1000`);
    const data = await res.json();
    const raw = (data.success && data.products) ? data.products : (Array.isArray(data) ? data : []);

    allProducts = raw.map(normalizeProduct);
    displayProducts(allProducts);
    renderDealCards();
    updateDynamicCategories();

    const countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = `${allProducts.length} Products Found`;
    if (loadingEl) loadingEl.style.display = 'none';
  } catch (err) {
    console.error('Error loading products from MongoDB:', err);
    allProducts = [];
    displayProducts(allProducts);
    const countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = `0 Products (Connect API)`;
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function updateDynamicCategories() {
  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();
  const searchCat = document.getElementById('searchCat');
  if (searchCat && categories.length) {
    const currentVal = searchCat.value;
    searchCat.innerHTML = '<option value="">All Categories</option>' +
      categories.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`).join('');
  }
}

/* ═══════════════════════════════════════════════════════════════
   DISPLAY PRODUCTS
   ═══════════════════════════════════════════════════════════════ */
function displayProducts(products) {
  const grid = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');

  if (!products.length) {
    grid.innerHTML = '';
    noProducts.style.display = 'block';
    return;
  }
  noProducts.style.display = 'none';
  grid.innerHTML = '';

  products.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.04}s`;

    const fb = getProductFallbackImage(product.category);
    const imageUrl = product.images?.[0]?.url || product.imageUrl || fb;
    const inStock = product.stock > 0;
    const inWish = wishlist.some(w => w._id === product._id);
    const hasDisc = product.discount && product.originalPrice;

    card.innerHTML = `
      <div class="pc-img-wrap">
        <img src="${imageUrl}" alt="${product.name}" loading="lazy"
             onerror="this.src='${fb}'" />
        ${hasDisc ? `<span class="pc-badge">${product.discount}% OFF</span>` : (inStock ? `<span class="pc-badge" style="background:linear-gradient(135deg,var(--accent-emerald),var(--primary));">In Stock</span>` : '')}
        <button class="pc-wishlist ${inWish ? 'active' : ''}"
                onclick="event.stopPropagation(); toggleWishlist('${product._id}')">
          <i class="fas fa-heart"></i>
        </button>
        <button class="pc-quickview" onclick="event.stopPropagation(); showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
          <i class="fas fa-eye"></i> Quick View
        </button>
      </div>
      <div class="pc-body">
        <div>
          <div class="pc-cat">${product.category}</div>
          <div class="pc-title">${product.name}</div>
          <div class="pc-rating">
            <span class="stars"><i class="fas fa-star"></i> ${product.ratings || 0}</span>
            <span class="rcount">(${(product.numOfReviews || 0).toLocaleString()})</span>
          </div>
        </div>
        <div class="pc-footer">
          <div class="pc-price-wrap">
            <span class="pc-price">₹${product.price.toLocaleString('en-IN')}</span>
            ${hasDisc ? `<span class="pc-old-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div class="pc-btn-group">
            <button class="pc-add-btn" onclick="event.stopPropagation(); addToCart('${product._id}', true)" ${!inStock ? 'disabled style="opacity:0.5;"' : ''} title="Add to Cart & View Cart">
              <i class="fas fa-shopping-bag"></i> ${inStock ? 'Add' : 'Sold'}
            </button>
            ${inStock ? `<button class="pc-buy-btn" onclick="event.stopPropagation(); buyNow('${product._id}')" title="Buy Now — 1 click checkout">
              <i class="fas fa-bolt"></i>
            </button>` : ''}
          </div>
        </div>
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
  const modal = document.getElementById('productModal');
  const body = document.getElementById('modalBody');
  const fb = getProductFallbackImage(product.category);
  const imageUrl = product.images?.[0]?.url || product.imageUrl || fb;
  const inStock = product.stock > 0;
  const hasDisc = product.discount && product.originalPrice;
  const inWish = wishlist.some(w => w._id === product._id);

  body.innerHTML = `
    <div class="pd-wrap">
      <div class="pd-img-col">
        <img src="${imageUrl}" alt="${product.name}"
             onerror="this.src='${fb}'" />
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
        ${hasDisc ? `<div class="pd-save">
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

  if (modal) {
    modal.classList.add('active');
  }
}

/* ═══════════════════════════════════════════════════════════════
   CART
   ═══════════════════════════════════════════════════════════════ */
function addToCart(productId, autoShowCart = false) {
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
  // Auto-open cart drawer so user can immediately proceed to checkout
  if (autoShowCart) {
    setTimeout(() => showCart(), 200);
  }
}

function buyNow(productId) {
  const product = allProducts.find(p => p._id === productId);
  if (!product || product.stock <= 0) { showNotification('This product is out of stock!', 'error'); return; }
  // Add to cart if not already there
  const existing = cart.find(i => i._id === productId);
  if (!existing) {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartCount();
  showNotification(`Proceeding to checkout for ${product.name}`, 'success');
  // Go directly to checkout — 1 click purchase
  setTimeout(() => showCheckoutPage(), 200);
}

function showCart() {
  const modal = document.getElementById('cartModal');
  const itemsEl = document.getElementById('cartItems');
  const subtotal = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const savingsEl = document.getElementById('cartSavings');
  const discountEl = document.getElementById('cartDiscount');
  const discRow = document.getElementById('cartDiscountRow');

  if (!cart.length) {
    itemsEl.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--txt3);">
        <i class="fas fa-shopping-bag" style="font-size:4rem;margin-bottom:20px;color:var(--primary);"></i>
        <h3 style="margin-bottom:8px;color:var(--txt1);">Your cart is empty</h3>
        <p style="font-size:.9rem;color:var(--txt2);">Add products to get started</p>
      </div>`;
    if (subtotal) subtotal.textContent = '0';
    if (totalEl) totalEl.textContent = '0';
    if (savingsEl) savingsEl.textContent = '0';
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
      const fb = getProductFallbackImage(item.category);
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.images?.[0]?.url || item.imageUrl || fb}" alt="${item.name}"
             onerror="this.src='${fb}'" />
        <div class="ci-details">
          <div class="ci-title">${item.name}</div>
          <div class="ci-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div class="ci-qty">
            <button onclick="updateQuantity(${idx},-1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${idx},1)">+</button>
          </div>
        </div>
        <i class="fas fa-trash ci-remove" onclick="removeFromCart(${idx})"></i>
      `;
      itemsEl.appendChild(div);
    });
    if (subtotal) subtotal.textContent = total.toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = total.toLocaleString('en-IN');
    if (savingsEl) savingsEl.textContent = totalSavings.toLocaleString('en-IN');
    if (discountEl) discountEl.textContent = totalSavings.toLocaleString('en-IN');
    if (discRow) discRow.style.display = totalSavings > 0 ? 'flex' : 'none';
  }
  if (modal) {
    modal.classList.add('active');
  }
}

function updateQuantity(index, change) {
  const item = cart[index];
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

function ensureShopViewActive() {
  const ordersSec = document.getElementById('ordersSection');
  const shopSec = document.getElementById('shopSection');
  if (ordersSec) ordersSec.style.display = 'none';
  if (shopSec) shopSec.style.display = '';

  document.querySelectorAll('.hero-section, .cat-strip-section, .deal-strip, .trust-section, .promo-section').forEach(el => {
    if (el) el.style.display = '';
  });
}

function showWishlist() {
  ensureShopViewActive();
  if (!wishlist.length) { showNotification('Your wishlist is empty', 'error'); return; }
  displayProducts(wishlist);
  document.getElementById('productCount').textContent = `${wishlist.length} items in your Wishlist`;
  const shopEl = document.getElementById('shopSection') || document.querySelector('.shop-section');
  if (shopEl) window.scrollTo({ top: shopEl.offsetTop - 110, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════════
   FILTERS & SORT
   ═══════════════════════════════════════════════════════════════ */
function applyFilters() {
  ensureShopViewActive();
  // Sidebar radio values
  const catEl = document.querySelector('input[name="sbCat"]:checked');
  const priceEl = document.querySelector('input[name="sbPrice"]:checked');
  const ratingEl = document.querySelector('input[name="sbRating"]:checked');
  const inStockEl = document.getElementById('sbInStock');

  const category = catEl ? catEl.value : '';
  const priceRange = priceEl ? priceEl.value : '';
  const minRating = ratingEl ? parseFloat(ratingEl.value || 0) : 0;
  const onlyStock = inStockEl ? inStockEl.checked : false;

  let filtered = [...allProducts];

  if (category) filtered = filtered.filter(p => p.category === category);
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(n => n === '' ? Infinity : parseInt(n));
    filtered = filtered.filter(p => p.price >= min && p.price <= (max || Infinity));
  }
  if (minRating) filtered = filtered.filter(p => (p.ratings || 0) >= minRating);
  if (onlyStock) filtered = filtered.filter(p => p.stock > 0);

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
  if (activeSortKey === 'price-low') sorted.sort((a, b) => a.price - b.price);
  if (activeSortKey === 'price-high') sorted.sort((a, b) => b.price - a.price);
  if (activeSortKey === 'rating') sorted.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
  if (activeSortKey === 'newest') sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) || String(b._id).localeCompare(String(a._id)));
  displayProducts(sorted);
}

function filterByCategory(cat) {
  if (window.event) window.event.preventDefault();
  ensureShopViewActive();

  // Reset search and secondary filters so user sees all items in category
  document.querySelectorAll('input[name="sbPrice"]').forEach(r => r.checked = (r.value === ''));
  document.querySelectorAll('input[name="sbRating"]').forEach(r => r.checked = (r.value === ''));
  const inStockEl = document.getElementById('sbInStock');
  if (inStockEl) inStockEl.checked = false;
  const searchInput = document.getElementById('mainSearch');
  if (searchInput) searchInput.value = '';

  // Update navbar active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => {
    const txt = item.textContent.trim().toLowerCase();
    if (cat && (txt.includes(cat.toLowerCase()) || (cat === 'Fresh Fruits' && (txt.includes('organics') || txt.includes('fruits'))))) {
      item.classList.add('active');
    }
  });

  // Tick the matching sidebar radio
  const radios = document.querySelectorAll('input[name="sbCat"]');
  radios.forEach(r => { r.checked = (r.value === cat); });

  // Filter products directly
  let filtered = [...allProducts];
  if (cat) {
    filtered = filtered.filter(p => p.category === cat);
  }
  sortProducts(filtered);
  document.getElementById('productCount').textContent = `${filtered.length} Products Found in ${cat || 'All Categories'}`;

  const shopEl = document.getElementById('shopSection') || document.querySelector('.shop-section');
  if (shopEl) {
    window.scrollTo({ top: shopEl.offsetTop - 110, behavior: 'smooth' });
  }
}

function clearFilters() {
  ensureShopViewActive();
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

function loadHome() {
  if (window.event) window.event.preventDefault();
  ensureShopViewActive();
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navHomeBtn')?.classList.add('active');
  clearFilters();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDeals() {
  ensureShopViewActive();
  const deals = allProducts.filter(p => p.discount);
  filterByCategory('');
  setTimeout(() => {
    displayProducts(deals);
    document.getElementById('productCount').textContent = `${deals.length} Deals Available`;
  }, 50);
  const shopEl = document.getElementById('shopSection') || document.querySelector('.shop-section');
  if (shopEl) window.scrollTo({ top: shopEl.offsetTop - 110, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════════════════════════ */
function performSearch() {
  ensureShopViewActive();
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
  const shopEl = document.getElementById('shopSection') || document.querySelector('.shop-section');
  if (shopEl) window.scrollTo({ top: shopEl.offsetTop - 110, behavior: 'smooth' });
}

function setupSearchEnter() {
  const inp = document.getElementById('mainSearch');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(); });
}

/* ═══════════════════════════════════════════════════════════════
   AUTH MODAL
   ═══════════════════════════════════════════════════════════════ */
function updateUserUI() {
  const subEl = document.getElementById('userAccountSub');
  const mainEl = document.getElementById('userAccountMain');
  if (!subEl || !mainEl) return;
  if (currentUser) {
    subEl.textContent = 'Account';
    mainEl.innerHTML = `Hi, ${currentUser.name || 'User'} <i class="fas fa-chevron-down" style="font-size:.7rem;"></i>`;
  } else {
    subEl.textContent = 'Welcome';
    mainEl.innerHTML = `Sign In <i class="fas fa-chevron-down" style="font-size:.7rem;"></i>`;
  }
}

function showAuthModal(type) {
  const modal = document.getElementById('authModal');
  const content = document.getElementById('authContent');

  if (type === 'login') {
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:2.2rem;color:#2874f0;margin-bottom:8px;"><i class="fas fa-user-circle"></i></div>
        <h2 style="font-size:1.4rem;font-weight:800;">Welcome Back to ShopEase!</h2>
        <p style="color:#888;font-size:.88rem;">Please sign in to access your account and start shopping</p>
      </div>
      <form onsubmit="handleLogin(event)">
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Email Address *</label>
          <input type="email" id="loginEmail" required placeholder="you@example.com"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div style="margin-bottom:22px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Password *</label>
          <div style="position:relative;">
            <input type="password" id="loginPassword" required placeholder="Enter your password"
                   style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                   onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
            <button type="button" onclick="togglePasswordVisibility('loginPassword')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#2874f0;font-size:.9rem;">
              <i class="fas fa-eye" id="loginPasswordToggle"></i>
            </button>
          </div>
          <div style="text-align:right;margin-top:8px;">
            <a href="#" onclick="showForgotPasswordModal()" style="font-size:.8rem;color:#2874f0;text-decoration:none;font-weight:600;">Forgot password?</a>
          </div>
        </div>
        <button type="submit" style="width:100%;padding:13px;background:#2874f0;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;"
                onmouseover="this.style.background='#1e53e5'" onmouseout="this.style.background='#2874f0'">
          <i class="fas fa-sign-in-alt" style="margin-right:8px;"></i> Sign In
        </button>
        <p style="text-align:center;margin-top:16px;font-size:.85rem;color:#888;">
          New to ShopEase? <a href="#" onclick="showAuthModal('register')" style="color:#2874f0;font-weight:700;">Create Account</a>
        </p>
      </form>`;
  } else if (type === 'register') {
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:2.2rem;color:#2874f0;margin-bottom:8px;"><i class="fas fa-user-plus"></i></div>
        <h2 style="font-size:1.4rem;font-weight:800;">Create Your Account</h2>
        <p style="color:#888;font-size:.88rem;">Join millions of happy shoppers on ShopEase</p>
      </div>
      <form onsubmit="handleRegister(event)">
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Full Name *</label>
          <input type="text" id="regName" required placeholder="Your full name"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Email Address *</label>
          <input type="email" id="regEmail" required placeholder="you@example.com"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Phone Number (Optional)</label>
          <input type="tel" id="regPhone" placeholder="10-digit Indian mobile number"
                 style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div style="margin-bottom:22px;">
          <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Password *</label>
          <div style="position:relative;">
            <input type="password" id="regPassword" required placeholder="Min 8 characters (uppercase, lowercase, number)"
                   style="width:100%;padding:12px 14px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;"
                   onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'"
                   oninput="updatePasswordStrength()" />
            <button type="button" onclick="togglePasswordVisibility('regPassword')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#2874f0;font-size:.9rem;">
              <i class="fas fa-eye" id="regPasswordToggle"></i>
            </button>
          </div>
          <div id="passwordStrength" style="margin-top:8px;font-size:.75rem;display:none;">
            <div style="height:4px;background:#e0e0e0;border-radius:2px;overflow:hidden;">
              <div id="strengthBar" style="height:100%;background:#ff9800;width:0%;transition:width .3s,background .3s;"></div>
            </div>
            <p id="strengthText" style="margin-top:4px;color:#ff9800;">Weak password</p>
          </div>
        </div>
        <button type="submit" style="width:100%;padding:13px;background:#ff6f00;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;"
                onmouseover="this.style.background='#e65100'" onmouseout="this.style.background='#ff6f00'">
          Create Account & Sign In
        </button>
        <p style="text-align:center;margin-top:16px;font-size:.85rem;color:#888;">
          Already have an account? <a href="#" onclick="showAuthModal('login')" style="color:#2874f0;font-weight:700;">Sign In</a>
        </p>
      </form>`;
  } else if (type === 'profile') {
    content.innerHTML = `
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:70px;height:70px;background:linear-gradient(135deg,#2874f0,#7c4dff);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#fff;font-size:2rem;">
          <i class="fas fa-user"></i>
        </div>
        <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:4px;">${currentUser ? currentUser.name : 'ShopEase User'}</h2>
        <p style="color:#888;font-size:.88rem;">${currentUser ? currentUser.email : ''}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <a href="admin.html" style="width:100%;padding:12px;background:linear-gradient(135deg,#06b6d4,#6366f1);color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:700;cursor:pointer;font-family:inherit;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
          <i class="fas fa-crown"></i> Open Admin Panel
        </a>
        <button onclick="closeAuthModal(); loadHome();" style="width:100%;padding:12px;background:#2874f0;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:700;cursor:pointer;font-family:inherit;">
          <i class="fas fa-home" style="margin-right:8px;"></i> Go to Home Page
        </button>
        <button onclick="handleLogout()" style="width:100%;padding:12px;background:#fff;color:#d32f2f;border:1.5px solid #d32f2f;border-radius:8px;font-size:.95rem;font-weight:700;cursor:pointer;font-family:inherit;">
          <i class="fas fa-sign-out-alt" style="margin-right:8px;"></i> Sign Out
        </button>
      </div>`;
  }
  // Always show the modal regardless of which type was requested
  modal.classList.add('active');
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginForm = e.target;
  const loginBtn = loginForm.querySelector('button[type="submit"]');

  // Frontend validation
  if (!email || !password) {
    showNotification('Email and password are required.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address.', 'error');
    return;
  }

  try {
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    // Call backend API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: Send cookies with the request
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    // Store user data from backend response (API returns flat { success, token, user })
    currentUser = data.user;
    localStorage.setItem('shopease_user', JSON.stringify(currentUser));
    if (data.token) localStorage.setItem('shopease_token', data.token);

    updateUserUI();
    closeAuthModal();
    loadHome();
    showNotification(`Welcome back, ${currentUser.name}! 🎉`, 'success');

  } catch (error) {
    console.error('Login error:', error);
    showNotification(error.message || 'Login failed. Please try again.', 'error');
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const phone = document.getElementById('regPhone')?.value.trim() || '';

  // Frontend validation
  const validation = validateRegistration(name, email, password, phone);
  if (!validation.valid) {
    showNotification(validation.message, 'error');
    return;
  }

  try {
    // Show loading state
    const registerBtn = event.target.querySelector('button');
    const originalText = registerBtn.textContent;
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating Account...';

    // Call backend API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    // Store user data from backend response (API returns flat { success, token, user })
    currentUser = data.user;
    localStorage.setItem('shopease_user', JSON.stringify(currentUser));
    if (data.token) localStorage.setItem('shopease_token', data.token);

    updateUserUI();
    closeAuthModal();
    loadHome();
    showNotification(`Welcome to ShopEase, ${currentUser.name}! 🚀 Please verify your email.`, 'success');

  } catch (error) {
    console.error('Registration error:', error);
    showNotification(error.message || 'Registration failed. Please try again.', 'error');
  } finally {
    const registerBtn = event.target.querySelector('button');
    if (registerBtn) {
      registerBtn.disabled = false;
      registerBtn.textContent = 'Create Account';
    }
  }
}

async function handleLogout() {
  try {
    // Call backend logout API to clear httpOnly cookie
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.warn('Logout API call failed:', error);
  }

  // Clear local state
  currentUser = null;
  localStorage.removeItem('shopease_user');
  localStorage.removeItem('shopease_token');
  localStorage.removeItem('shopease_cart');
  localStorage.removeItem('shopease_wishlist');

  updateUserUI();
  closeAuthModal();
  loadHome();
  showNotification('You have been signed out. See you soon! 👋', 'success');
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRegistration(name, email, password, phone) {
  // Name validation
  if (!name || name.length < 2 || name.length > 50) {
    return { valid: false, message: 'Name must be between 2 and 50 characters.' };
  }

  // Email validation
  if (!email || !isValidEmail(email)) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }

  // Password validation (min 8 chars, uppercase, lowercase, number)
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      valid: false,
      message: 'Password must contain uppercase, lowercase, and number (e.g., Pass123).'
    };
  }

  // Phone validation (optional, but if provided must be valid 10-digit Indian number)
  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    return { valid: false, message: 'Please provide a valid 10-digit Indian mobile number.' };
  }

  return { valid: true };
}

function updatePasswordStrength() {
  const password = document.getElementById('regPassword')?.value || '';
  const strengthDiv = document.getElementById('passwordStrength');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  if (!strengthDiv || !password) return;

  strengthDiv.style.display = 'block';

  let strength = 0;
  let message = 'Weak password';
  let color = '#ff3b30';

  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;

  // Character variety
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 20;

  if (strength <= 30) {
    message = '🔴 Weak - Add numbers & uppercase';
    color = '#ff3b30';
  } else if (strength <= 60) {
    message = '🟡 Fair - Add special characters';
    color = '#ff9800';
  } else if (strength <= 85) {
    message = '🟢 Good - Strong password';
    color = '#4caf50';
  } else {
    message = '✅ Excellent - Very strong password';
    color = '#00c853';
  }

  strengthBar.style.width = Math.min(strength, 100) + '%';
  strengthBar.style.background = color;
  strengthText.textContent = message;
  strengthText.style.color = color;
}

function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  const toggleBtn = document.getElementById(fieldId + 'Toggle');

  if (!field || !toggleBtn) return;

  if (field.type === 'password') {
    field.type = 'text';
    toggleBtn.classList.remove('fa-eye');
    toggleBtn.classList.add('fa-eye-slash');
  } else {
    field.type = 'password';
    toggleBtn.classList.remove('fa-eye-slash');
    toggleBtn.classList.add('fa-eye');
  }
}

function showForgotPasswordModal(initialEmail = '') {
  const modal = document.getElementById('authModal');
  const content = document.getElementById('authContent');

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:2.2rem;color:#2874f0;margin-bottom:8px;"><i class="fas fa-shield-alt"></i></div>
      <h2 style="font-size:1.4rem;font-weight:800;">Forgot Password</h2>
      <p style="color:#888;font-size:.88rem;line-height:1.4;margin-top:4px;">
        Enter your registered email address and we'll send a 6-digit verification code to reset your password.
      </p>
    </div>
    <form onsubmit="handleForgotPassword(event)">
      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Email Address *</label>
        <div style="position:relative;">
          <i class="fas fa-envelope" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#999;"></i>
          <input type="email" id="forgotEmail" required placeholder="you@example.com" value="${initialEmail || ''}"
                 style="width:100%;padding:12px 14px 12px 40px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;box-sizing:border-box;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
      </div>
      <button type="submit" id="forgotSubmitBtn" style="width:100%;padding:13px;background:#2874f0;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:8px;"
              onmouseover="this.style.background='#1e5bc6'" onmouseout="this.style.background='#2874f0'">
        <i class="fas fa-paper-plane"></i> Send Verification Code
      </button>
      <p style="text-align:center;margin-top:16px;font-size:.85rem;color:#888;">
        Remembered password? <a href="#" onclick="showAuthModal('login')" style="color:#2874f0;font-weight:700;">Back to Sign In</a>
      </p>
    </form>`;

  modal.classList.add('active');
  setTimeout(() => document.getElementById('forgotEmail')?.focus(), 100);
}

async function handleForgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById('forgotEmail')?.value.trim();

  if (!email) {
    showNotification('Please enter your email address.', 'error');
    return;
  }

  const btn = document.getElementById('forgotSubmitBtn') || event.target.querySelector('button[type="submit"]');
  const originalText = btn ? btn.innerHTML : 'Send Verification Code';

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Code...';
    }

    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification code.');
    }

    showNotification('6-digit verification code sent to your email! ✉️', 'success');
    showResetWithCodeModal(email, data.resetCode || '');

  } catch (error) {
    console.error('Forgot password error:', error);
    showNotification(error.message || 'Failed to send verification code.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

function showResetWithCodeModal(email, codeHint = '') {
  const modal = document.getElementById('authModal');
  const content = document.getElementById('authContent');

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:2.2rem;color:#2e7d32;margin-bottom:8px;"><i class="fas fa-unlock-alt"></i></div>
      <h2 style="font-size:1.4rem;font-weight:800;">Enter Verification Code</h2>
      <p style="color:#666;font-size:.85rem;line-height:1.4;margin-top:4px;">
        A 6-digit code was sent to <strong style="color:#2874f0;">${email}</strong>
      </p>
    </div>

    ${codeHint ? `
      <div style="background:#f0f9ff;border:1px dashed #0284c7;border-radius:8px;padding:8px 12px;margin-bottom:16px;text-align:center;font-size:.85rem;color:#0369a1;cursor:pointer;"
           onclick="document.getElementById('resetCode').value='${codeHint}'" title="Click to auto-fill code">
        🔑 <strong>Dev OTP Code:</strong> <span style="font-family:monospace;font-weight:bold;letter-spacing:2px;">${codeHint}</span> <span style="font-size:.75rem;text-decoration:underline;margin-left:6px;">(Click to fill)</span>
      </div>
    ` : ''}

    <form onsubmit="handleResetPasswordWithCode(event)">
      <input type="hidden" id="resetEmail" value="${email}" />

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">6-Digit Verification Code *</label>
        <div style="position:relative;">
          <i class="fas fa-key" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#999;"></i>
          <input type="text" id="resetCode" required maxlength="6" pattern="[0-9]{6}" placeholder="123456" value="${codeHint || ''}"
                 style="width:100%;padding:12px 14px 12px 40px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:1.1rem;letter-spacing:4px;font-weight:bold;text-align:center;outline:none;font-family:monospace;transition:border-color .2s;box-sizing:border-box;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">New Password *</label>
        <div style="position:relative;">
          <i class="fas fa-lock" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#999;"></i>
          <input type="password" id="resetNewPassword" required minlength="8" placeholder="At least 8 chars (letters + numbers)"
                 style="width:100%;padding:12px 40px 12px 40px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;box-sizing:border-box;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'"
                 oninput="checkPasswordStrength(this.value)" />
          <i class="fas fa-eye" id="resetNewPasswordToggle" onclick="togglePasswordVisibility('resetNewPassword')"
             style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#999;cursor:pointer;"></i>
        </div>
        <div class="password-strength" style="margin-top:6px;">
          <div class="strength-bar" id="strengthBar"></div>
        </div>
        <div class="strength-text" id="strengthText"></div>
      </div>

      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:#555;">Confirm New Password *</label>
        <div style="position:relative;">
          <i class="fas fa-lock" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#999;"></i>
          <input type="password" id="resetConfirmPassword" required minlength="8" placeholder="Confirm your new password"
                 style="width:100%;padding:12px 40px 12px 40px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:.95rem;outline:none;font-family:inherit;transition:border-color .2s;box-sizing:border-box;"
                 onfocus="this.style.borderColor='#2874f0'" onblur="this.style.borderColor='#e0e0e0'" />
          <i class="fas fa-eye" id="resetConfirmPasswordToggle" onclick="togglePasswordVisibility('resetConfirmPassword')"
             style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#999;cursor:pointer;"></i>
        </div>
      </div>

      <button type="submit" id="resetSubmitBtn" style="width:100%;padding:13px;background:#2874f0;color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;display:flex;align-items:center;justify-content:center;gap:8px;"
              onmouseover="this.style.background='#1e5bc6'" onmouseout="this.style.background='#2874f0'">
        <i class="fas fa-check-circle"></i> Reset Password & Sign In
      </button>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:.85rem;">
        <a href="#" onclick="showForgotPasswordModal('${email}')" style="color:#ff6f00;font-weight:600;"><i class="fas fa-redo"></i> Resend Code</a>
        <a href="#" onclick="showAuthModal('login')" style="color:#2874f0;font-weight:700;">Back to Sign In</a>
      </div>
    </form>`;

  modal.classList.add('active');
  setTimeout(() => document.getElementById('resetCode')?.focus(), 100);
}

async function handleResetPasswordWithCode(event) {
  event.preventDefault();

  const email = document.getElementById('resetEmail')?.value.trim();
  const code = document.getElementById('resetCode')?.value.trim();
  const password = document.getElementById('resetNewPassword')?.value;
  const confirmPassword = document.getElementById('resetConfirmPassword')?.value;

  if (!code || code.length !== 6) {
    showNotification('Please enter the valid 6-digit verification code.', 'error');
    return;
  }

  if (!password || password.length < 8) {
    showNotification('Password must be at least 8 characters long.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showNotification('Passwords do not match. Please recheck.', 'error');
    return;
  }

  const btn = document.getElementById('resetSubmitBtn') || event.target.querySelector('button[type="submit"]');
  const originalText = btn ? btn.innerHTML : 'Reset Password & Sign In';

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting Password...';
    }

    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password.');
    }

    if (data.user) {
      currentUser = data.user;
      localStorage.setItem('shopease_user', JSON.stringify(currentUser));
    }
    if (data.token) {
      localStorage.setItem('shopease_token', data.token);
    }

    updateUserUI();
    closeAuthModal();
    loadHome();
    showNotification('Password reset successfully! Welcome back! 🎉', 'success');

  } catch (error) {
    console.error('Reset password error:', error);
    showNotification(error.message || 'Password reset failed. Please check the code.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

function closeAuthModal() {
  const m = document.getElementById('authModal');
  if (m) { m.classList.remove('active'); }
}
function showUserMenu() { showAuthModal(currentUser ? 'profile' : 'login'); }

/* ═══════════════════════════════════════════════════════════════
   CHECKOUT PAGE (inline)
   ═══════════════════════════════════════════════════════════════ */
function showCheckoutPage() {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = cart.reduce((s, i) => s + (i.originalPrice ? (i.originalPrice - i.price) * i.quantity : 0), 0);
  const customerName = currentUser?.name || '';
  const modal = document.getElementById('authModal');
  const content = document.getElementById('authContent');

  content.innerHTML = `
    <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:10px;color:var(--txt1);">
      <i class="fas fa-shield-alt" style="color:var(--primary);"></i> Delivery & Payment Details
    </h2>
    ${savings > 0 ? `
      <div style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:.88rem;color:#34d399;display:flex;align-items:center;gap:8px;">
        <i class="fas fa-tag"></i> You're saving <strong>₹${savings.toLocaleString('en-IN')}</strong> on this order!
      </div>` : ''}
    
    <div style="margin-bottom:14px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:var(--txt2);">Full Name</label>
      <input type="text" id="checkoutName" value="${customerName}" required autocomplete="name" placeholder="Full Name" 
             style="width:100%;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:.92rem;color:var(--txt1);outline:none;font-family:inherit;" />
    </div>
    <div style="margin-bottom:14px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:var(--txt2);">Mobile Number</label>
      <input type="tel" id="checkoutPhone" required autocomplete="tel" inputmode="numeric" pattern="[0-9]{10}" placeholder="10-digit mobile number" 
             style="width:100%;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:.92rem;color:var(--txt1);outline:none;font-family:inherit;" />
    </div>
    <div style="margin-bottom:14px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:var(--txt2);">Delivery Address</label>
      <textarea id="checkoutAddress" rows="2" required autocomplete="street-address" placeholder="Flat / House No., Street, Area"
                style="width:100%;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:.92rem;color:var(--txt1);outline:none;font-family:inherit;resize:none;"></textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
      <div>
        <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:var(--txt2);">City</label>
        <input type="text" id="checkoutCity" required autocomplete="address-level2" placeholder="City" 
               style="width:100%;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:.92rem;color:var(--txt1);outline:none;font-family:inherit;" />
      </div>
      <div>
        <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:var(--txt2);">State</label>
        <input type="text" id="checkoutState" required autocomplete="address-level1" placeholder="State" 
               style="width:100%;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:.92rem;color:var(--txt1);outline:none;font-family:inherit;" />
      </div>
    </div>
    <div style="margin-bottom:18px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:6px;color:var(--txt2);">PIN Code</label>
      <input type="text" id="checkoutPincode" required autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{6}" placeholder="6-digit PIN code" 
             style="width:100%;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:.92rem;color:var(--txt1);outline:none;font-family:inherit;" />
    </div>

    <!-- Payment Options -->
    <div style="margin-bottom:18px;">
      <label style="display:block;font-size:.82rem;font-weight:700;margin-bottom:8px;color:var(--txt2);">Select Payment Method</label>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <label style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(99,102,241,0.1);border:1.5px solid var(--primary);border-radius:10px;cursor:pointer;font-size:.9rem;font-weight:700;color:var(--txt1);">
          <div style="display:flex;align-items:center;gap:10px;">
            <input type="radio" name="payMethod" value="UPI" checked style="accent-color:var(--primary);width:16px;height:16px;" />
            <span><i class="fas fa-qrcode" style="color:var(--accent-cyan);margin-right:6px;"></i> Scan UPI QR Code (Instant & 50+ Apps)</span>
          </div>
          <span style="font-size:.75rem;background:var(--primary);color:#fff;padding:2px 8px;border-radius:99px;">FASTEST</span>
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:.9rem;font-weight:600;color:var(--txt2);">
          <input type="radio" name="payMethod" value="Card" style="accent-color:var(--primary);width:16px;height:16px;" />
          <span><i class="fas fa-credit-card" style="margin-right:6px;"></i> Credit / Debit Card</span>
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:.9rem;font-weight:600;color:var(--txt2);">
          <input type="radio" name="payMethod" value="NetBanking" style="accent-color:var(--primary);width:16px;height:16px;" />
          <span><i class="fas fa-university" style="margin-right:6px;"></i> Net Banking</span>
        </label>
        <label style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:.9rem;font-weight:600;color:var(--txt2);">
          <input type="radio" name="payMethod" value="COD" style="accent-color:var(--primary);width:16px;height:16px;" />
          <span><i class="fas fa-money-bill-wave" style="margin-right:6px;"></i> Cash on Delivery</span>
        </label>
      </div>
    </div>

    <!-- Order Summary Box -->
    <div style="background:var(--surface-card);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:.9rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:var(--txt2);">
        <span>Cart Items (${cart.reduce((s, i) => s + i.quantity, 0)})</span>
        <span style="font-weight:700;color:var(--txt1);">₹${total.toLocaleString('en-IN')}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:var(--txt2);">
        <span>Express Delivery</span>
        <span style="color:#10b981;font-weight:700;">FREE</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border);font-size:1.05rem;font-weight:800;color:var(--txt1);">
        <span>Grand Total</span>
        <span style="color:var(--primary);">₹${total.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <button onclick="placeOrder()" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--primary),var(--accent-purple));color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 4px 20px rgba(99,102,241,0.4);display:flex;align-items:center;justify-content:center;gap:10px;transition:var(--trans);">
      <i class="fas fa-lock"></i> Proceed to Pay — ₹${total.toLocaleString('en-IN')}
    </button>`;
  modal.classList.add('active');
}

let upiCountdownInterval = null;
let currentPendingOrder = null;

function placeOrder() {
  const shippingAddress = {
    fullName: document.getElementById('checkoutName')?.value.trim(),
    phone: document.getElementById('checkoutPhone')?.value.trim(),
    address: document.getElementById('checkoutAddress')?.value.trim(),
    city: document.getElementById('checkoutCity')?.value.trim(),
    state: document.getElementById('checkoutState')?.value.trim(),
    pincode: document.getElementById('checkoutPincode')?.value.trim(),
    country: 'India'
  };
  const missingField = Object.entries(shippingAddress).find(([field, value]) => field !== 'country' && !value);
  if (missingField) {
    showNotification('Please fill all required address fields.', 'error');
    const fieldIds = { fullName: 'checkoutName', phone: 'checkoutPhone', address: 'checkoutAddress', city: 'checkoutCity', state: 'checkoutState', pincode: 'checkoutPincode' };
    document.getElementById(fieldIds[missingField[0]])?.focus();
    return;
  }
  if (!/^\d{10}$/.test(shippingAddress.phone) || !/^\d{6}$/.test(shippingAddress.pincode)) {
    showNotification('Enter a valid 10-digit phone number and 6-digit PIN code.', 'error');
    return;
  }

  const selectedMethodRadio = document.querySelector('input[name="payMethod"]:checked');
  const paymentMethod = selectedMethodRadio ? selectedMethodRadio.value : 'UPI';
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderId = `ORD-${Date.now()}`;

  const orderData = {
    id: orderId,
    items: [...cart],
    shippingAddress,
    paymentMethod,
    total,
    placedAt: new Date().toISOString()
  };

  currentPendingOrder = orderData;
  closeAuthModal();

  if (paymentMethod === 'UPI') {
    // Launch Dedicated UPI QR Code Payment Scanner Window
    showUpiQrPaymentModal(orderData);
  } else {
    // Standard order completion
    finalizeOrder(orderData);
  }
}

function showUpiQrPaymentModal(order) {
  const modal = document.getElementById('upiModal');
  const body = document.getElementById('upiModalBody');
  if (!modal || !body) return;

  const upiUri = `upi://pay?pa=shopease@icici&pn=ShopEase%20Retail&am=${order.total}&cu=INR&tn=${order.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  let remainingSeconds = 299; // 4:59

  body.innerHTML = `
    <!-- Top QR Card -->
    <div class="upi-qr-card">
      <div class="upi-qr-viewport">
        <div class="upi-corner tl"></div>
        <div class="upi-corner tr"></div>
        <div class="upi-corner bl"></div>
        <div class="upi-corner br"></div>
        <div class="upi-scan-beam"></div>
        <img src="${qrUrl}" alt="UPI QR Code" 
             onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi%3A%2F%2Fpay%3Fpa%3Dshopease%40icici%26am%3D${order.total}'" />
      </div>
      <div class="upi-merchant-name">ShopEase Retail</div>
      <div class="upi-amount-pill">
        <i class="fas fa-rupee-sign"></i> ₹${order.total.toLocaleString('en-IN')}
      </div>
      <div class="upi-timer-row">
        <span>Complete this action within</span>
        <span id="upiTimer" class="upi-timer-val">4:59</span>
      </div>
    </div>

    <!-- Instructions & Apps -->
    <div class="upi-instructions-card">
      <h4>Instructions</h4>
      <p>Scan this QR code using any of the 50+ UPI apps.</p>
      <div class="upi-apps-row">
        <span class="upi-app-pill gpay"><i class="fab fa-google-pay" style="font-size:1.1rem;"></i> GPay</span>
        <span class="upi-app-pill phonepe"><i class="fas fa-mobile-alt"></i> PhonePe</span>
        <span class="upi-app-pill paytm"><i class="fas fa-wallet"></i> Paytm</span>
        <span class="upi-app-pill bhim"><i class="fas fa-university"></i> BHIM</span>
        <span class="upi-app-pill amazon"><i class="fab fa-amazon-pay"></i> Amazon Pay</span>
      </div>
      <p style="margin-bottom:0;font-size:.82rem;color:var(--txt3);">
        <i class="fas fa-info-circle" style="color:var(--accent-cyan);margin-right:4px;"></i> Approve UPI Payment in your app.
      </p>
    </div>

    <!-- Live Radar Status -->
    <div class="upi-status-pill">
      <div class="upi-radar-dot"></div>
      <span>Waiting for UPI payment confirmation…</span>
    </div>

    <!-- Action Buttons -->
    <div class="upi-actions">
      <button class="btn-upi-simulate" onclick="simulateUpiPaymentSuccess()">
        <i class="fas fa-bolt"></i> Simulate UPI Scan & Pay (Instant Verify)
      </button>
      <button class="btn-upi-copy" onclick="copyUpiId('shopease@icici')">
        <i class="fas fa-copy"></i> Copy UPI ID: <strong>shopease@icici</strong>
      </button>
    </div>
  `;

  modal.classList.add('active');

  // Start live countdown timer
  if (upiCountdownInterval) clearInterval(upiCountdownInterval);
  upiCountdownInterval = setInterval(() => {
    remainingSeconds--;
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    const timerEl = document.getElementById('upiTimer');
    if (timerEl) {
      timerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    }
    if (remainingSeconds <= 0) {
      clearInterval(upiCountdownInterval);
      showNotification('Payment session expired. Please try again.', 'error');
      closeModal('upiModal');
    }
  }, 1000);
}

function copyUpiId(upiId) {
  navigator.clipboard.writeText(upiId).then(() => {
    showNotification(`UPI ID "${upiId}" copied to clipboard!`, 'success');
  }).catch(() => {
    showNotification(`UPI ID: ${upiId}`, 'info');
  });
}

function simulateUpiPaymentSuccess() {
  if (upiCountdownInterval) clearInterval(upiCountdownInterval);
  const body = document.getElementById('upiModalBody');
  if (!body || !currentPendingOrder) return;

  const order = currentPendingOrder;

  // Render animated verified screen
  body.innerHTML = `
    <div class="upi-success-view">
      <div class="upi-check-circle">
        <i class="fas fa-check"></i>
      </div>
      <h3>Payment Verified!</h3>
      <p style="color:var(--txt2);font-size:.92rem;margin-top:-8px;">Your order has been placed successfully.</p>
      
      <div class="upi-order-info">
        <div><span>Order ID</span><strong>${order.id}</strong></div>
        <div><span>Amount Paid</span><strong style="color:#10b981;">₹${order.total.toLocaleString('en-IN')}</strong></div>
        <div><span>Payment Mode</span><strong>UPI (Instant Verified)</strong></div>
        <div><span>Deliver To</span><strong>${order.shippingAddress.fullName} (${order.shippingAddress.pincode})</strong></div>
        <div><span>Estimated Delivery</span><strong style="color:var(--primary);">3 Business Days</strong></div>
      </div>

      <div style="display:flex;gap:10px;width:100%;margin-top:14px;">
        <button onclick="finalizeOrder(currentPendingOrder, true); showMyOrdersPage();" class="btn-checkout" style="flex:1;">
          <i class="fas fa-box-open"></i> View in My Orders
        </button>
        <button onclick="finalizeOrder(currentPendingOrder, true); loadHome();" class="btn-upi-copy" style="flex:1;font-weight:700;">
          Continue Shopping
        </button>
      </div>
    </div>
  `;

  showNotification('🎉 UPI Payment Successful! Order Confirmed.', 'success');
}

function finalizeOrder(orderData, isAlreadyVerified = false) {
  const orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');
  orders.unshift(orderData);
  localStorage.setItem('shopease_orders', JSON.stringify(orders));

  cart = [];
  saveCart();
  updateCartCount();
  updateOrdersCount();

  if (document.getElementById('cartModal')) {
    closeModal('cartModal');
  }
  if (document.getElementById('upiModal')) {
    closeModal('upiModal');
  }
  if (document.getElementById('authModal')) {
    closeAuthModal();
  }

  if (!isAlreadyVerified) {
    showNotification('🎉 Order placed successfully! You can track it in My Orders.', 'success');
  }

  currentPendingOrder = null;
}

/* ═══════════════════════════════════════════════════════════════
   MY ORDERS PAGE CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
let currentOrderTab = 'all';

function updateOrdersCount() {
  const orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');
  const countEls = document.querySelectorAll('#ordersCount');
  countEls.forEach(el => el.textContent = orders.length);
}

function showMyOrdersPage() {
  if (window.event) window.event.preventDefault();
  const ordersSec = document.getElementById('ordersSection');
  const shopSec = document.getElementById('shopSection');
  if (!ordersSec) return;

  // Hide other homepage sections
  document.querySelectorAll('.hero-section, .cat-strip-section, .deal-strip, .trust-section, .promo-section').forEach(el => {
    if (el) el.style.display = 'none';
  });
  if (shopSec) shopSec.style.display = 'none';

  ordersSec.style.display = 'block';

  // Update navbar active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('navOrdersBtn')?.classList.add('active');

  renderOrdersList(currentOrderTab);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterOrdersTab(tab, btnEl) {
  currentOrderTab = tab;
  document.querySelectorAll('.order-tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderOrdersList(tab);
}

function renderOrdersList(filter = 'all') {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  let orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');

  if (filter === 'active') {
    orders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  } else if (filter === 'delivered') {
    orders = orders.filter(o => o.status === 'Delivered');
  }

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="orders-empty-state">
        <i class="fas fa-box-open"></i>
        <h3>No Orders Found</h3>
        <p>${filter === 'all' ? 'You haven’t placed any orders yet. Explore our futuristic gear today!' : `No ${filter} orders found in your history.`}</p>
        <button class="btn-checkout" style="max-width:260px;margin:0 auto;" onclick="loadHome()">
          <i class="fas fa-shopping-bag"></i> Start Shopping
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map((order, idx) => {
    const status = order.status || 'Confirmed';
    const statusClass = status.toLowerCase().includes('transit') || status.toLowerCase().includes('shipped') ? 'transit' :
                        status.toLowerCase().includes('delivered') ? 'delivered' :
                        status.toLowerCase().includes('cancelled') ? 'cancelled' : 'confirmed';

    const orderDate = new Date(order.placedAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const isUPI = (order.paymentMethod || '').includes('UPI');

    const itemsHtml = (order.items || []).map(item => {
      const fb = getProductFallbackImage(item.category);
      const itemImg = item.images?.[0]?.url || item.imageUrl || fb;
      return `
      <div class="order-item-row">
        <img src="${itemImg}" alt="${item.name}" onerror="this.src='${fb}'" />
        <div class="oir-info">
          <div class="oir-title">${item.name}</div>
          <div class="oir-meta"><span style="color:var(--primary);font-weight:700;">${item.category}</span> • Qty: <strong>${item.quantity}</strong></div>
        </div>
        <div class="oir-price">
          <div>₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
          <small style="color:var(--txt3);font-size:.75rem;font-weight:500;">₹${item.price.toLocaleString('en-IN')} each</small>
        </div>
      </div>
      `;
    }).join('');

    return `
      <div class="order-card" id="order-card-${order.id}">
        <!-- Header -->
        <div class="order-card-header">
          <div class="och-left">
            <span class="order-id-tag"><i class="fas fa-receipt" style="color:var(--primary);"></i> Order ${order.id}</span>
            <span class="order-date">Placed on ${orderDate}</span>
          </div>
          <div class="och-right">
            <span class="order-paymode-badge">
              <i class="${isUPI ? 'fas fa-qrcode' : 'fas fa-credit-card'}" style="color:${isUPI ? 'var(--accent-cyan)' : 'inherit'};margin-right:4px;"></i>
              ${order.paymentMethod || 'UPI'}
            </span>
            <span class="order-status-badge ${statusClass}">
              <i class="fas fa-${statusClass === 'confirmed' ? 'check-circle' : statusClass === 'transit' ? 'truck-fast' : statusClass === 'delivered' ? 'box-circle-check' : 'times-circle'}"></i>
              ${status}
            </span>
            <span class="order-total-badge">₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- 4-Step Stepper -->
        <div class="order-stepper-wrap">
          <div class="order-stepper">
            <div class="order-step done">
              <div class="order-step-icon"><i class="fas fa-check"></i></div>
              <div class="order-step-title">Order Placed</div>
              <div class="order-step-sub">Verified</div>
            </div>
            <div class="order-step ${statusClass !== 'cancelled' ? 'active' : ''}">
              <div class="order-step-icon"><i class="fas fa-box"></i></div>
              <div class="order-step-title">Packed</div>
              <div class="order-step-sub">Hub Ready</div>
            </div>
            <div class="order-step ${statusClass === 'transit' || statusClass === 'delivered' ? 'active' : ''}">
              <div class="order-step-icon"><i class="fas fa-truck-fast"></i></div>
              <div class="order-step-title">Dispatched</div>
              <div class="order-step-sub">Express Delivery</div>
            </div>
            <div class="order-step ${statusClass === 'delivered' ? 'done' : ''}">
              <div class="order-step-icon"><i class="fas fa-house"></i></div>
              <div class="order-step-title">Delivered</div>
              <div class="order-step-sub">ETA 3 Days</div>
            </div>
          </div>
        </div>

        <!-- Items Breakdown -->
        <div class="order-items-grid">
          ${itemsHtml}
        </div>

        <!-- Footer -->
        <div class="order-card-footer">
          <div class="order-delivery-address-mini">
            <i class="fas fa-location-dot" style="color:var(--accent-pink);"></i>
            <span>Deliver to: <strong>${order.shippingAddress?.fullName || 'Customer'}</strong>, ${order.shippingAddress?.city || ''} (${order.shippingAddress?.pincode || ''})</span>
          </div>
          <div class="order-action-btns">
            <button class="btn-order-track" onclick="showLiveTrackingModal('${order.id}')">
              <i class="fas fa-location-crosshairs"></i> Live GPS Track
            </button>
            <button class="btn-order-invoice" onclick="showInvoiceModal('${order.id}')">
              <i class="fas fa-file-invoice"></i> Invoice
            </button>
            <button class="btn-order-invoice" onclick="reorderAll('${order.id}')" title="Add items to cart">
              <i class="fas fa-rotate-right"></i> Reorder
            </button>
            ${statusClass !== 'cancelled' && statusClass !== 'delivered' ? `
              <button class="btn-order-cancel" onclick="cancelOrder('${order.id}')">
                <i class="fas fa-times"></i> Cancel
              </button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showLiveTrackingModal(orderId) {
  const orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('trackingModal');
  const body = document.getElementById('trackingModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <h3 style="font-size:1.35rem;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:10px;color:var(--txt1);">
      <i class="fas fa-location-arrow" style="color:var(--accent-cyan);"></i> Live Delivery Radar — ${order.id}
    </h3>

    <!-- Map Simulator -->
    <div style="position:relative;height:200px;background:radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, rgba(15,23,42,0.95) 100%), #0b1120;border:1px solid var(--border-glow);border-radius:16px;overflow:hidden;margin-bottom:20px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);background-size:25px 25px;"></div>
      
      <!-- Courier Pin -->
      <div style="position:relative;z-index:3;text-align:center;">
        <div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--accent-cyan),var(--primary));display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;margin:0 auto 6px;box-shadow:0 0 20px var(--accent-cyan);animation:upiRadarPulse 2s infinite;">
          <i class="fas fa-truck-fast"></i>
        </div>
        <span style="font-size:.78rem;font-weight:800;background:rgba(0,0,0,0.8);color:#fff;padding:3px 10px;border-radius:99px;border:1px solid var(--border);">
          Courier on way (2.4 km away)
        </span>
      </div>
    </div>

    <!-- Agent & ETA Card -->
    <div style="background:var(--surface-card);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:18px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:40px;height:40px;border-radius:50%;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--txt1);">
            <i class="fas fa-user-ninja"></i>
          </div>
          <div>
            <div style="font-weight:800;color:var(--txt1);font-size:.92rem;">Rohan Varma (HyperFast Rider)</div>
            <div style="font-size:.78rem;color:var(--txt3);"><i class="fas fa-star" style="color:#fbbf24;"></i> 4.9 Rating • Hero Electric EV</div>
          </div>
        </div>
        <a href="tel:9876543210" style="padding:6px 12px;border-radius:8px;background:rgba(16,185,129,0.15);color:#34d399;font-weight:700;font-size:.82rem;display:flex;align-items:center;gap:6px;">
          <i class="fas fa-phone"></i> Call
        </a>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:10px;font-size:.85rem;color:var(--txt2);">
        <span>Estimated Delivery</span>
        <strong style="color:var(--accent-emerald);">Today within 45 Mins</strong>
      </div>
    </div>

    <button onclick="closeModal('trackingModal')" class="btn-checkout" style="width:100%;">
      Close Tracking
    </button>
  `;

  modal.classList.add('active');
}

function showInvoiceModal(orderId) {
  const orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('invoiceModal');
  const body = document.getElementById('invoiceModalBody');
  if (!modal || !body) return;

  const subtotal = order.total;
  const gst = Math.round(subtotal * 0.18);
  const basePrice = subtotal - gst;

  body.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid var(--border);padding-bottom:18px;margin-bottom:18px;">
      <div>
        <h2 style="font-size:1.5rem;font-weight:800;color:var(--txt1);"><i class="fas fa-bolt" style="color:var(--primary);"></i> Shop<em>Ease</em> Retail</h2>
        <p style="font-size:.82rem;color:var(--txt3);">Tax Invoice / Cash Receipt</p>
      </div>
      <div style="text-align:right;">
        <strong style="font-size:.95rem;color:var(--txt1);">${order.id}</strong>
        <div style="font-size:.8rem;color:var(--txt3);">${new Date(order.placedAt).toLocaleDateString('en-IN')}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;font-size:.85rem;">
      <div style="background:var(--surface);padding:12px;border-radius:8px;border:1px solid var(--border);">
        <strong style="color:var(--txt1);display:block;margin-bottom:4px;">Billed & Shipped To:</strong>
        <div style="color:var(--txt2);">${order.shippingAddress?.fullName}</div>
        <div style="color:var(--txt3);">${order.shippingAddress?.address}, ${order.shippingAddress?.city} - ${order.shippingAddress?.pincode}</div>
        <div style="color:var(--txt3);">Phone: ${order.shippingAddress?.phone}</div>
      </div>
      <div style="background:var(--surface);padding:12px;border-radius:8px;border:1px solid var(--border);">
        <strong style="color:var(--txt1);display:block;margin-bottom:4px;">Payment Summary:</strong>
        <div style="color:var(--txt2);">Mode: <strong>${order.paymentMethod || 'UPI (Verified)'}</strong></div>
        <div style="color:var(--txt2);">Status: <span style="color:#10b981;font-weight:700;">Paid in Full</span></div>
        <div style="color:var(--txt3);">Ref: ${order.id}</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:.88rem;margin-bottom:18px;">
      <thead>
        <tr style="border-bottom:1px solid var(--border);color:var(--txt3);text-align:left;">
          <th style="padding:8px 4px;">Item</th>
          <th style="padding:8px 4px;text-align:center;">Qty</th>
          <th style="padding:8px 4px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || []).map(i => `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06);color:var(--txt1);">
            <td style="padding:10px 4px;"><strong>${i.name}</strong></td>
            <td style="padding:10px 4px;text-align:center;">${i.quantity}</td>
            <td style="padding:10px 4px;text-align:right;">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="background:var(--surface-card);padding:14px;border-radius:10px;margin-bottom:20px;font-size:.88rem;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--txt3);"><span>Taxable Amount</span><span>₹${basePrice.toLocaleString('en-IN')}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--txt3);"><span>GST (18% Included)</span><span>₹${gst.toLocaleString('en-IN')}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:800;color:var(--txt1);border-top:1px solid var(--border);padding-top:8px;">
        <span>Total Paid</span>
        <span style="color:var(--primary);">₹${subtotal.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div style="display:flex;gap:10px;">
      <button onclick="window.print()" class="btn-checkout" style="flex:1;">
        <i class="fas fa-print"></i> Print / Download PDF
      </button>
      <button onclick="closeModal('invoiceModal')" class="btn-upi-copy" style="flex:1;">
        Close
      </button>
    </div>
  `;

  modal.classList.add('active');
}

function cancelOrder(orderId) {
  if (!confirm(`Are you sure you want to cancel Order #${orderId}? Instant refund will be credited.`)) return;

  const orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = 'Cancelled';
    localStorage.setItem('shopease_orders', JSON.stringify(orders));
    showNotification(`Order #${orderId} cancelled. Refund initiated.`, 'info');
    renderOrdersList(currentOrderTab);
  }
}

function reorderAll(orderId) {
  const orders = JSON.parse(localStorage.getItem('shopease_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order || !order.items) return;

  order.items.forEach(item => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push({ ...item });
    }
  });

  saveCart();
  updateCartCount();
  showNotification('Items added back to your cart!', 'success');
  showCart();
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

function saveCart() { localStorage.setItem('shopease_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist)); }

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('active');
    // Do NOT set style.display — modals are shown/hidden via CSS .active class only
  }
  if (id === 'upiModal' && typeof upiCountdownInterval !== 'undefined' && upiCountdownInterval) {
    clearInterval(upiCountdownInterval);
  }
}

function setupScrollEffects() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.pageYOffset > 400 ? 'flex' : 'none';
  });
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function showNotification(msg, type = 'success') {
  const container = document.getElementById('notificationContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.style.background = 'var(--surface-solid)';
  el.style.border = '1px solid var(--border-glow)';
  el.style.color = 'var(--txt1)';
  el.style.padding = '12px 18px';
  el.style.borderRadius = 'var(--radius-md)';
  el.style.boxShadow = 'var(--shadow-neon)';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.gap = '10px';
  el.style.transition = 'all 0.3s var(--ease)';
  el.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" style="color:var(--primary);"></i>
    <span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

// Close modals when clicking backdrop
window.addEventListener('click', e => {
  ['authModal', 'productModal', 'cartModal', 'upiModal', 'trackingModal', 'invoiceModal'].forEach(id => {
    const el = document.getElementById(id);
    if (e.target === el) {
      closeModal(id);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   SELL ON SHOPEASE PAGE
   ═══════════════════════════════════════════════════════════════ */
function showSellPage() {
  const modal = document.getElementById('authModal');
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
      ['2L+', 'Active Sellers'],
      ['5Cr+', 'Happy Customers'],
      ['₹0', 'Registration Fee']
    ].map(([n, l]) => `
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
      ['fa-rocket', 'Zero Registration', 'Sign up for free in under 5 minutes'],
      ['fa-rupee-sign', 'Fast Payments', 'Get paid within 7 days of delivery'],
      ['fa-chart-line', 'Powerful Dashboard', 'Track orders, sales & returns in real-time'],
      ['fa-shield-alt', 'Seller Protection', 'Full support for genuine seller disputes'],
      ['fa-truck', 'Logistics Support', 'We handle pickup & delivery pan-India'],
      ['fa-headset', 'Dedicated Support', '24/7 seller helpline & account manager'],
    ].map(([ic, t, d]) => `
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
  const modal = document.getElementById('authModal');
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
      ['fa-box', 'Track My Order', 'Check live delivery status'],
      ['fa-undo', 'Returns & Refunds', 'Easy 7-day return policy'],
      ['fa-credit-card', 'Payment Issues', 'Failed payments, refund status'],
      ['fa-tag', 'Cancel Order', 'Cancel before dispatch'],
      ['fa-star', 'Product Reviews', 'Review & ratings guide'],
      ['fa-user-cog', 'Account Help', 'Login, password, profile'],
    ].map(([ic, t, d]) => `
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
      ['How do I track my order?', 'Go to "My Orders" in your account and click "Track" next to your order. You\'ll see live GPS tracking once the package is dispatched.'],
      ['What is ShopEase\'s return policy?', 'We offer a hassle-free 7-day return policy for most items. Electronics have a 10-day replacement guarantee.'],
      ['How long does delivery take?', 'Standard delivery: 3–5 business days. Express delivery: 1–2 days (available in select cities).'],
      ['Is Cash on Delivery available?', 'Yes! COD is available on orders up to ₹50,000 across 25,000+ pin codes in India.'],
      ['How do I cancel my order?', 'You can cancel before the item is dispatched. Go to My Orders → Select Order → Cancel.'],
      ['When will I get my refund?', 'Refunds are processed within 5–7 business days after the returned item is received.'],
    ].map(([q, a], i) => `
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
      ['fa-phone', 'Call Us', '1800-123-4567', 'Free 24/7', '#26a541'],
      ['fa-comment', 'Live Chat', 'Chat Now', 'Avg. 2 min wait', '#2874f0'],
      ['fa-envelope', 'Email', 'support@shopease.com', 'Reply in 4 hrs', '#ff6f00'],
    ].map(([ic, t, v, sub, col]) => `
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
  const ans = document.getElementById('faqA' + i);
  const icon = document.getElementById('faqIcon' + i);
  const open = ans.style.display === 'block';
  ans.style.display = open ? 'none' : 'block';
  icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}
