// ShopEase - Professional E-commerce JavaScript
const API_URL = 'http://localhost:5000/api';
let cart = JSON.parse(localStorage.getItem('shopease_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('shopease_wishlist')) || [];
let allProducts = [];
let currentUser = JSON.parse(localStorage.getItem('shopease_user')) || null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1500);
    
    loadProducts();
    updateCartCount();
    updateWishlistCount();
    setupScrollEffects();
});

// Load products from API
async function loadProducts() {
    try {
        document.getElementById('loading').style.display = 'block';
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        
        if (data.success && data.products) {
            allProducts = data.products;
            displayProducts(data.products);
            document.getElementById('productCount').textContent = `${data.products.length} Products Available`;
        } else {
            showNoProducts();
        }
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 20px;"></i>
                <h3>Unable to Connect to Server</h3>
                <p>Please make sure the backend is running at ${API_URL}</p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

// Display products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    if (products.length === 0) {
        showNoProducts();
        return;
    }
    
    noProducts.style.display = 'none';
    grid.innerHTML = '';
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300x250?text=No+Image';
        const inStock = product.stock > 0;
        const isInWishlist = wishlist.some(item => item._id === product._id);
        
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleWishlist('${product._id}')"
                        style="position: absolute; top: 10px; right: 10px; background: white; border: none; 
                               width: 40px; height: 40px; border-radius: 50%; cursor: pointer; 
                               box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: all 0.3s;">
                    <i class="fas fa-heart" style="color: ${isInWishlist ? '#ff6b6b' : '#ccc'};"></i>
                </button>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category || 'Uncategorized'}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                <div class="product-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.ratings || 0))}
                    ${product.ratings || 0} (${product.numOfReviews || 0})
                </div>
                <div class="product-stock ${inStock ? '' : 'out-of-stock'}">
                    ${inStock ? `✅ In Stock (${product.stock})` : '❌ Out of Stock'}
                </div>
                <button class="btn-buy" onclick="event.stopPropagation(); addToCart('${product._id}')" 
                        ${!inStock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i> ${inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        `;
        
        card.addEventListener('click', () => showProductDetails(product));
        grid.appendChild(card);
    });
}

// Show product details
function showProductDetails(product) {
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/600x400?text=No+Image';
    const inStock = product.stock > 0;
    
    modalBody.innerHTML = `
        <div style="padding: 30px;">
            <img src="${imageUrl}" alt="${product.name}" 
                 style="width: 100%; height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 25px;"
                 onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
            <span class="product-category">${product.category}</span>
            <h2 style="font-size: 2rem; margin: 15px 0; color: #333;">${product.name}</h2>
            <div style="display: flex; align-items: center; gap: 20px; margin: 20px 0;">
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                <div class="product-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.ratings || 0))}
                    ${product.ratings || 0}/5 (${product.numOfReviews || 0} reviews)
                </div>
            </div>
            <p style="font-size: 1.1rem; line-height: 1.8; color: #666; margin: 25px 0;">
                ${product.description || 'No description available'}
            </p>
            <div class="product-stock ${inStock ? '' : 'out-of-stock'}" style="font-size: 1.1rem; margin: 20px 0;">
                ${inStock ? `✅ ${product.stock} units available` : '❌ Out of Stock'}
            </div>
            ${product.brand ? `<p style="margin: 10px 0;"><strong>Brand:</strong> ${product.brand}</p>` : ''}
            <button class="btn-buy" onclick="addToCart('${product._id}'); closeModal('productModal');" 
                    ${!inStock ? 'disabled' : ''} style="margin-top: 25px;">
                <i class="fas fa-shopping-cart"></i> ${inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item._id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
            showNotification(`Updated ${product.name} quantity`, 'success');
        } else {
            showNotification('Stock limit reached!', 'error');
            return;
        }
    } else {
        cart.push({ ...product, quantity: 1 });
        showNotification(`${product.name} added to cart!`, 'success');
    }
    
    saveCart();
    updateCartCount();
}

// Show cart
function showCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #999;">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; margin-bottom: 20px;"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
            </div>
        `;
        cartSubtotal.textContent = '0';
        cartTotal.textContent = '0';
    } else {
        let total = 0;
        cartItems.innerHTML = '';
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${item.images?.[0]?.url || 'https://via.placeholder.com/100'}" 
                     alt="${item.name}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/100'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')} × ${item.quantity}</div>
                    <div style="margin-top: 10px;">
                        <button onclick="updateQuantity(${index}, -1)" style="padding: 5px 12px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span style="padding: 0 15px; font-weight: 600;">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" style="padding: 5px 12px; background: #f0f0f0; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary-color); margin-bottom: 10px;">
                        ₹${itemTotal.toLocaleString('en-IN')}
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            `;
            cartItems.appendChild(itemDiv);
        });
        
        cartSubtotal.textContent = total.toLocaleString('en-IN');
        cartTotal.textContent = total.toLocaleString('en-IN');
    }
    
    modal.style.display = 'block';
}

// Update quantity
function updateQuantity(index, change) {
    const item = cart[index];
    const product = allProducts.find(p => p._id === item._id);
    
    if (!product) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    if (newQuantity > product.stock) {
        showNotification('Stock limit reached!', 'error');
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    updateCartCount();
    showCart();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    showCart();
    showNotification('Item removed from cart', 'success');
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} (${item.quantity}x)`).join('\\n');
    
    const message = `🛍️ ORDER SUMMARY\\n\\nTotal Amount: ₹${total.toLocaleString('en-IN')}\\n\\nItems:\\n${itemsList}\\n\\nChoose Payment Method:\\n1️⃣ GPay\\n2️⃣ Cash on Delivery\\n3️⃣ Credit/Debit Card\\n\\nEnter 1, 2, or 3:`;
    
    const choice = prompt(message);
    
    if (choice) {
        const methods = { '1': 'GPay', '2': 'Cash on Delivery', '3': 'Credit/Debit Card' };
        const method = methods[choice] || 'Unknown';
        
        alert(`✅ ORDER PLACED SUCCESSFULLY!\\n\\nOrder Details:\\n━━━━━━━━━━━━━━━━━━━━━\\nTotal: ₹${total.toLocaleString('en-IN')}\\nPayment: ${method}\\nItems: ${cart.length}\\n━━━━━━━━━━━━━━━━━━━━━\\n\\nThank you for shopping with ShopEase!\\n\\n📧 Order confirmation sent to your email\\n📦 Expected delivery: 3-5 business days`);
        
        cart = [];
        saveCart();
        updateCartCount();
        closeModal('cartModal');
        showNotification('Order placed successfully! 🎉', 'success');
    }
}

// Wishlist functions
function toggleWishlist(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    const index = wishlist.findIndex(item => item._id === productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification(`Removed from wishlist`, 'success');
    } else {
        wishlist.push(product);
        showNotification(`Added to wishlist!`, 'success');
    }
    
    saveWishlist();
    updateWishlistCount();
    displayProducts(allProducts);
}

function showWishlist() {
    if (wishlist.length === 0) {
        showNotification('Your wishlist is empty', 'error');
        return;
    }
    displayProducts(wishlist);
    document.getElementById('productCount').textContent = `${wishlist.length} Items in Wishlist`;
}

// Filter and search
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    
    let filtered = [...allProducts];
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(n => n === '' ? Infinity : parseInt(n));
        filtered = filtered.filter(p => {
            if (max === undefined) return p.price >= min;
            return p.price >= min && p.price <= max;
        });
    }
    
    // Sort
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    } else if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    displayProducts(filtered);
    document.getElementById('productCount').textContent = `${filtered.length} Products Found`;
}

function performSearch() {
    const keyword = document.getElementById('mainSearch').value.toLowerCase();
    if (!keyword) return;
    
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        (p.description && p.description.toLowerCase().includes(keyword)) ||
        (p.category && p.category.toLowerCase().includes(keyword))
    );
    
    displayProducts(filtered);
    document.getElementById('productCount').textContent = `${filtered.length} Results for "${keyword}"`;
}

function filterByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    applyFilters();
}

function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortFilter').value = 'popularity';
    document.getElementById('mainSearch').value = '';
    displayProducts(allProducts);
    document.getElementById('productCount').textContent = `${allProducts.length} Products Available`;
}

function loadHome() {
    clearFilters();
}

function showDeals() {
    const deals = allProducts.filter(p => p.price < 5000);
    displayProducts(deals);
    document.getElementById('productCount').textContent = `${deals.length} Deals Available`;
}

// Utility functions
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function updateWishlistCount() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

function saveCart() {
    localStorage.setItem('shopease_cart', JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist));
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function showNoProducts() {
    document.getElementById('productsGrid').innerHTML = '';
    document.getElementById('noProducts').style.display = 'block';
}

function setupScrollEffects() {
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Auth modal functions
function showAuthModal(type) {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authContent');
    
    if (type === 'login') {
        content.innerHTML = `
            <h2 style="margin-bottom: 25px; text-align: center;">Login to ShopEase</h2>
            <form onsubmit="handleLogin(event)" style="max-width: 400px; margin: 0 auto;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email:</label>
                    <input type="email" id="loginEmail" required 
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                </div>
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Password:</label>
                    <input type="password" id="loginPassword" required 
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem;">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            </form>
            <p style="text-align: center; margin-top: 20px;">
                Don't have an account? <a href="#" onclick="showAuthModal('register')" style="color: var(--primary-color); font-weight: 600;">Register here</a>
            </p>
        `;
    } else {
        content.innerHTML = `
            <h2 style="margin-bottom: 25px; text-align: center;">Create Account</h2>
            <form onsubmit="handleRegister(event)" style="max-width: 400px; margin: 0 auto;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Name:</label>
                    <input type="text" id="regName" required 
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email:</label>
                    <input type="email" id="regEmail" required 
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                </div>
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Password:</label>
                    <input type="password" id="regPassword" required minlength="8"
                           style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
                    <small style="color: #666;">Must contain uppercase, lowercase, and number</small>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem;">
                    <i class="fas fa-user-plus"></i> Register
                </button>
            </form>
            <p style="text-align: center; margin-top: 20px;">
                Already have an account? <a href="#" onclick="showAuthModal('login')" style="color: var(--primary-color); font-weight: 600;">Login here</a>
            </p>
        `;
    }
    
    modal.style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('shopease_user', JSON.stringify(data.user));
            localStorage.setItem('shopease_token', data.token);
            showNotification('Login successful! Welcome back! 🎉', 'success');
            closeAuthModal();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Registration successful! Please login.', 'success');
            showAuthModal('login');
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

function showUserMenu() {
    if (currentUser) {
        alert(`Welcome ${currentUser.name}!\\n\\nAccount Options:\\n- View Profile\\n- My Orders\\n- Settings\\n- Logout`);
    } else {
        showAuthModal('login');
    }
}
