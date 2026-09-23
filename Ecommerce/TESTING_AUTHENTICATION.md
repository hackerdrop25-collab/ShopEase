# 🚀 Quick Start: Authentication Testing

## ✅ Test Credentials

Use these credentials to test the login:

```
Email:    test@shopease.com
Password: TestPass123
```

**Note:** If this user doesn't exist, register with these details first.

---

## 📝 Step-by-Step Testing Guide

### 1️⃣ Test Registration (Create New Account)

```
1. Open http://localhost:3000
2. Click "Join Free" button (top right)
3. Fill in the form:
   ├─ Name: John Doe
   ├─ Email: john.doe@example.com
   ├─ Password: MySecure123
   └─ Phone: 9876543210 (optional)
4. Watch password strength indicator: 🟢 Good
5. Click "Create Account & Sign In"
6. ✅ Should see: "Account created! Welcome to ShopEase!"
7. Check your email for verification link
```

### 2️⃣ Test Login

```
1. Click "Login" button (top right)
2. Enter:
   ├─ Email: john.doe@example.com
   └─ Password: MySecure123
3. Click "Sign In"
4. ✅ Should see: "Welcome back, John!"
5. User name appears in header
```

### 3️⃣ Test Password Visibility Toggle

```
1. Open Login modal
2. Focus on Password field
3. Click eye icon to show/hide password
4. ✅ Password should toggle between hidden/visible
```

### 4️⃣ Test Password Strength Indicator (Register)

```
1. Open Register modal
2. Click Password field
3. Type: "pass" → 🔴 Weak
4. Type: "Pass12" → 🟡 Fair
5. Type: "Pass123" → 🟢 Good
6. Type: "Pass123!@#" → ✅ Excellent
```

### 5️⃣ Test Invalid Password Rejection

```
1. Register modal
2. Name: Test User
3. Email: test@test.com
4. Password: "short" (too short, no uppercase/number)
5. Click "Create Account"
6. ✅ Should see error: "Password must contain uppercase, lowercase, and number"
```

### 6️⃣ Test Email Validation

```
1. Login modal
2. Email: "invalidemail" (missing @domain)
3. Password: TestPass123
4. Click "Sign In"
5. ✅ Should see error: "Please enter a valid email address"
```

### 7️⃣ Test Duplicate Email Prevention

```
1. Register with email: john.doe@example.com
2. Try to register again with same email
3. ✅ Should see: "An account with this email already exists"
```

### 8️⃣ Test Logout

```
1. Log in with valid credentials
2. Click user name in header
3. Click "Sign Out" button
4. ✅ Should see: "You have been signed out"
5. Redirect to home page
6. Login link reappears in header
```

### 9️⃣ Test Forgot Password

```
1. Open Login modal
2. Click "Forgot password?" link
3. Enter email: test@example.com
4. Click "Send Reset Link"
5. ✅ Should see: "Reset link sent! Check your email"
6. Check email for password reset link
```

### 🔟 Test Session Persistence

```
1. Log in with credentials
2. Refresh the page (F5)
3. ✅ Should still be logged in
4. Check localStorage: console.log(localStorage.getItem('shopease_user'))
```

---

## 🔐 Security Features to Verify

### ✅ Password Hashing
```
❌ Passwords should NEVER appear in console logs
❌ Passwords should NEVER be stored in localStorage
✅ Only user data (name, email) stored in localStorage
```

**Check:** 
```javascript
// Open Browser DevTools → Console
console.log(localStorage.getItem('shopease_user'));
// Should show: {"name":"John Doe","email":"john.doe@example.com"}
// NOT the password!
```

### ✅ Secure Cookies
```javascript
// Open Browser DevTools → Application → Cookies
// Should see: "token" cookie
// Should have: HttpOnly ✅, Secure ✅, SameSite=Strict ✅
```

### ✅ JWT Authentication
```javascript
// All API requests automatically include token in cookie
// No JavaScript access to token (security feature!)
fetch('http://localhost:5000/api/auth/profile', {
  credentials: 'include'  // ← This sends the cookie
})
```

---

## 🐛 Common Issues & Solutions

### Issue: "Login failed. Please check your credentials"
```
Solution:
1. Verify email exists in database
2. Check password is exactly correct
3. Ensure MongoDB is running
4. Check backend server logs
```

### Issue: "CORS error" or "Request blocked"
```
Solution:
1. Ensure backend is running on port 5000
2. Check API_URL in client/app.js matches backend URL
3. Verify CORS headers in backend server.js
```

### Issue: "Password field not showing strength indicator"
```
Solution:
1. Refresh the page
2. Check browser console for JavaScript errors
3. Verify Font Awesome icons are loaded (for strength indicators)
```

### Issue: Can't see password when typing
```
Solution:
1. Click eye icon next to password field to toggle visibility
2. Verify JavaScript is enabled in browser
```

### Issue: Can't login after registration
```
Solution:
1. Check email was entered correctly
2. Verify password was remembered correctly
3. Try forgot password if password is unclear
```

---

## 📊 Testing Checklist

- [ ] Registration works with valid data
- [ ] Registration rejects invalid email
- [ ] Registration rejects weak password
- [ ] Registration rejects duplicate email
- [ ] Login works with correct credentials
- [ ] Login fails with wrong password
- [ ] Password strength indicator appears
- [ ] Password visibility toggle works
- [ ] Logout works correctly
- [ ] User stays logged in after page refresh
- [ ] Cookies are set in browser
- [ ] Token is sent with API requests
- [ ] Forgot password modal appears
- [ ] User data is stored in localStorage (not password)
- [ ] User name appears in header when logged in

---

## 🎯 Demo Accounts (Pre-created)

If these accounts were pre-seeded in the database:

| Email | Password | Role |
|-------|----------|------|
| test@shopease.com | TestPass123 | User |
| admin@shopease.com | AdminPass123 | Admin |
| john@example.com | JohnPass123 | User |

**Note:** If they don't exist, create them using the registration form.

---

## 📱 Testing on Different Devices

### Desktop
```
✅ Chrome DevTools → Responsive Design Mode (toggle mobile)
✅ Test on Chrome, Firefox, Safari, Edge
```

### Mobile
```
✅ Test on actual phone using: http://<YOUR_PC_IP>:3000
✅ Find PC IP: Open CMD → `ipconfig` → Copy IPv4 Address
```

---

## 🔍 Debugging Commands

### Check if backend is running:
```bash
curl http://localhost:5000/api/auth/login -X POST
# Should return CORS error or 400 (not "Cannot GET")
```

### Check if frontend can reach backend:
```javascript
// In browser console:
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  credentials: 'include',
  body: JSON.stringify({email: 'test@example.com', password: 'test'})
})
.then(r => r.json())
.then(d => console.log(d))
```

### Check localStorage:
```javascript
console.log(JSON.parse(localStorage.getItem('shopease_user')))
```

### Check cookies:
```javascript
// Open DevTools → Application → Cookies → http://localhost:3000
// Should see "token" cookie with HttpOnly flag
```

---

## 📚 API Endpoints Reference

### Public Endpoints (No Login Required)
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
PUT  /api/auth/reset-password/:token
GET  /api/auth/verify-email/:token
POST /api/auth/resend-verification
```

### Private Endpoints (Login Required)
```
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
DELETE /api/auth/delete-account
```

---

## 🆘 Need Help?

1. **Check browser console** for JavaScript errors
2. **Check Network tab** to see API requests/responses
3. **Check backend logs** (terminal where server is running)
4. **Read AUTHENTICATION_GUIDE.md** for detailed information
5. **Verify .env file** has all required variables

---

**Happy Testing! 🎉**

Last Updated: 2024
