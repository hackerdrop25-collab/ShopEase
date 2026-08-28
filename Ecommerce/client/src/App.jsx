import { useEffect, useState } from 'react'
import './App.css'

const categories = [
  { name: 'Electronics', count: '120+ items' },
  { name: 'Fashion', count: '90+ items' },
  { name: 'Home', count: '70+ items' },
  { name: 'Accessories', count: '55+ items' },
]

const perks = [
  'Free shipping over $50',
  'Secure payments',
  'Fast 2-day delivery',
  'Easy returns within 7 days',
]

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
}

const emptyCheckout = {
  name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
}

function App() {
  const [apiStatus, setApiStatus] = useState({
    status: 'Checking...',
    healthy: false,
    message: 'Connecting to ShopEase API...',
  })
  const [products, setProducts] = useState([])
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopease_user')
    return saved ? JSON.parse(saved) : null
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shopease_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckout)
  const [orderMessage, setOrderMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('shopease_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to reach API')
        }

        setApiStatus({
          status: 'Connected',
          healthy: true,
          message: data.message || 'ShopEase API is running',
        })
      })
      .catch((error) => {
        setApiStatus({
          status: 'Offline',
          healthy: false,
          message: error.message || 'Backend is unavailable',
        })
      })

    fetch('/api/products?limit=6')
      .then(async (response) => {
        const data = await response.json()
        if (response.ok && data.products) {
          setProducts(data.products)
        }
      })
      .catch(() => setProducts([]))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target
    setCheckoutForm((current) => ({ ...current, [name]: value }))
  }

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      return [
        ...current,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price || 0),
          image: product.image,
          quantity: 1,
        },
      ]
    })

    setOrderMessage('Item added to cart.')
  }

  const updateQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 0 ? 12 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = authMode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, phone: form.phone }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      const currentUser = data.user || { email: form.email, name: form.name || 'ShopEase User' }
      localStorage.setItem('shopease_token', data.token || '')
      localStorage.setItem('shopease_user', JSON.stringify(currentUser))
      setUser(currentUser)
      setForm(emptyForm)
      setMessage(data.message || 'Success!')
      setAuthMode('login')
    } catch (error) {
      setMessage(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('shopease_token')
    localStorage.removeItem('shopease_user')
    setUser(null)
    setMessage('Logged out successfully')
  }

  const handleCheckout = async (event) => {
    event.preventDefault()

    if (!cart.length) {
      setOrderMessage('Your cart is empty.')
      return
    }

    if (!user) {
      setOrderMessage('Please log in before checkout.')
      return
    }

    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.city || !checkoutForm.state || !checkoutForm.zip) {
      setOrderMessage('Please fill in your shipping details.')
      return
    }

    setOrderMessage('Submitting your order...')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('shopease_token') || ''}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product: item.id,
            title: item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: {
            name: checkoutForm.name,
            phone: checkoutForm.phone,
            street: checkoutForm.address,
            city: checkoutForm.city,
            state: checkoutForm.state,
            pincode: checkoutForm.zip,
          },
          paymentMethod: 'cod',
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not place order')
      }

      setOrderMessage(`Order ${data.order.orderNumber} placed successfully!`)
      setCart([])
      setCheckoutForm(emptyCheckout)
    } catch (error) {
      setOrderMessage(error.message || 'Could not place order')
    }
  }

  return (
    <div className={user ? 'page-shell' : 'page-shell login-only'}>
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">ShopEase</div>
            <small>smart shopping</small>
          </div>
        </div>

        <nav className="main-nav">
          <a href="#">Home</a>
          <a href="#">Products</a>
          <a href="#">Deals</a>
          <a href="#">Support</a>
        </nav>

        <button className="nav-button">Cart ({cart.reduce((count, item) => count + item.quantity, 0)})</button>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">2026 collection • fresh deals</span>
            <h1>Shop smarter, live better.</h1>
            <p>
              Discover high-quality essentials, trending gadgets, and everyday lifestyle
              upgrades designed for modern living.
            </p>

            <div className="hero-actions">
              <button className="primary-btn">Shop now</button>
              <button className="secondary-btn">Explore deals</button>
            </div>

            <div className="stats-row">
              <div>
                <strong>20k+</strong>
                <span>happy shoppers</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>average rating</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>support</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="feature-card large">
              <div className="card-badge">Trending</div>
              <div className="product-visual gradient-one" />
              <h3>Premium Audio Set</h3>
              <div className="meta-row">
                <span>$249</span>
                <button>Buy now</button>
              </div>
            </div>

            <div className="mini-card">
              <div className="mini-visual gradient-two" />
              <div>
                <strong>Smart Home</strong>
                <small>Up to 40% off</small>
              </div>
            </div>
          </div>
        </section>

        <section className="status-panel">
          <div className="status-copy">
            <span>API connection</span>
            <strong className={apiStatus.healthy ? 'online' : 'offline'}>
              {apiStatus.status}
            </strong>
          </div>
          <p>{apiStatus.message}</p>
        </section>

        <section className="auth-panel">
          {user ? (
            <div className="user-card">
              <div>
                <span className="eyebrow">Account</span>
                <h3>Welcome back, {user.name || user.email}</h3>
                <p>{user.email}</p>
              </div>
              <button className="secondary-btn" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-card">
              <div className="auth-toggle">
                <button
                  type="button"
                  className={authMode === 'login' ? 'tab active' : 'tab'}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={authMode === 'register' ? 'tab active' : 'tab'}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {authMode === 'register' && (
                  <label>
                    Full name
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </label>
                )}

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                {authMode === 'register' && (
                  <label>
                    Phone
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                    />
                  </label>
                )}

                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </label>

                {message && <p className="form-message">{message}</p>}

                <button type="submit" className="primary-btn submit-btn" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
                </button>
              </form>
            </div>
          )}
        </section>

        <section className="cart-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your cart</span>
              <h2>Ready for checkout</h2>
            </div>
          </div>

          <div className="cart-layout">
            <div className="cart-list">
              {cart.length === 0 ? (
                <div className="empty-cart">Your cart is empty. Add products to continue.</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.title} />
                    <div className="cart-details">
                      <h3>{item.title}</h3>
                      <p>${item.price}</p>
                    </div>
                    <div className="quantity-controls">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <button className="remove-btn" type="button" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <aside className="checkout-panel">
              <h3>Order summary</h3>
              <div className="summary-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
              <div className="summary-row"><span>Shipping</span><strong>${shipping.toFixed(2)}</strong></div>
              <div className="summary-row"><span>Tax</span><strong>${tax.toFixed(2)}</strong></div>
              <div className="summary-row total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>

              <form className="checkout-form" onSubmit={handleCheckout}>
                <label>
                  Full name
                  <input type="text" name="name" value={checkoutForm.name} onChange={handleCheckoutChange} placeholder="John Doe" />
                </label>
                <label>
                  Phone
                  <input type="tel" name="phone" value={checkoutForm.phone} onChange={handleCheckoutChange} placeholder="9876543210" />
                </label>
                <label>
                  Address
                  <input type="text" name="address" value={checkoutForm.address} onChange={handleCheckoutChange} placeholder="123 Market Street" />
                </label>
                <div className="mini-fields">
                  <label>
                    City
                    <input type="text" name="city" value={checkoutForm.city} onChange={handleCheckoutChange} placeholder="Bengaluru" />
                  </label>
                  <label>
                    State
                    <input type="text" name="state" value={checkoutForm.state} onChange={handleCheckoutChange} placeholder="Karnataka" />
                  </label>
                </div>
                <div className="mini-fields">
                  <label>
                    ZIP
                    <input type="text" name="zip" value={checkoutForm.zip} onChange={handleCheckoutChange} placeholder="560001" />
                  </label>
                </div>
                {orderMessage && <p className="order-message">{orderMessage}</p>}
                <button type="submit" className="primary-btn checkout-btn">Place order</button>
              </form>
            </aside>
          </div>
        </section>

        <section className="categories-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Browse categories</span>
              <h2>Shop by interest</h2>
            </div>
            <a href="#">View all</a>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <div key={category.name} className="category-card">
                <div className="category-icon">✦</div>
                <h3>{category.name}</h3>
                <p>{category.count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="featured-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Featured picks</span>
              <h2>Best sellers this week</h2>
            </div>
            <a href="#">See more</a>
          </div>

          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <article key={product.id} className="product-card">
                  <img className="product-thumb" src={product.image} alt={product.title} />
                  <span className="product-tag">{product.isFeatured ? 'Best Seller' : 'Popular'}</span>
                  <h3>{product.title}</h3>
                  <p>{product.shortDescription}</p>
                  <div className="product-row">
                    <strong>{product.priceLabel}</strong>
                    <button type="button" onClick={() => addToCart(product)}>Add to cart</button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">Loading products...</p>
            )}
          </div>
        </section>

        <section className="benefits-section">
          {perks.map((perk) => (
            <div key={perk} className="benefit-item">
              <span>✓</span>
              <p>{perk}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
