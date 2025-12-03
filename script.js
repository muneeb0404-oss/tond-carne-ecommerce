const LSKEYS = {USERS: 'users', PRODUCTS: 'products', ORDERS: 'orders', USER: 'user'};

function initApp() {
  if (!localStorage.getItem(LSKEYS.USERS)) {
    localStorage.setItem(LSKEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LSKEYS.PRODUCTS)) {
    const products = [
      {id: 1, name: 'Spicy Paneer Burger', price: 199},
      {id: 2, name: 'Tandoori Chicken Burger', price: 249},
      {id: 3, name: 'Ghost Pepper Burger', price: 299},
      {id: 4, name: 'Spicy Mutton Burger', price: 279},
      {id: 5, name: 'Chilli Cheese Fries', price: 99},
      {id: 6, name: 'Masala Pizza', price: 189}
    ];
    localStorage.setItem(LSKEYS.PRODUCTS, JSON.stringify(products));
  }
  if (!localStorage.getItem(LSKEYS.ORDERS)) {
    localStorage.setItem(LSKEYS.ORDERS, JSON.stringify([]));
  }
  setupListeners();
  renderProducts();
  updateNav();
}

function setupListeners() {
  document.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const h = a.getAttribute('href');
      if (h === '#home') show('home');
      else if (h === '#login') show('login');
      else if (h === '#register') show('register');
      else if (h === '#cart') {
        if (!getUser()) alert('Login first');
        else show('cart');
      }
      else if (h === '#orders') {
        if (!getUser()) alert('Login first');
        else show('orders');
      }
    });
  });
  const lf = document.getElementById('login-form');
  if (lf) lf.addEventListener('submit', login);
  const rf = document.getElementById('register-form');
  if (rf) rf.addEventListener('submit', register);
  const pb = document.getElementById('btn-place-order');
  if (pb) pb.addEventListener('click', placeOrder);
  const lb = document.getElementById('btn-logout');
  if (lb) lb.addEventListener('click', () => {
    localStorage.removeItem(LSKEYS.USER);
    location.reload();
  });
  renderProducts();
  updateNav();
}

function show(id) {
  document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
  const s = document.getElementById(id);
  if (s) s.style.display = 'block';
  if (id === 'cart') renderCart();
  if (id === 'orders') renderOrders();
}

function getUsers() {
  return JSON.parse(localStorage.getItem(LSKEYS.USERS));
}

function saveUsers(u) {
  localStorage.setItem(LSKEYS.USERS, JSON.stringify(u));
}

function getProducts() {
  return JSON.parse(localStorage.getItem(LSKEYS.PRODUCTS));
}

function getOrders() {
  return JSON.parse(localStorage.getItem(LSKEYS.ORDERS));
}

function saveOrders(o) {
  localStorage.setItem(LSKEYS.ORDERS, JSON.stringify(o));
}

function getUser() {
  const d = localStorage.getItem(LSKEYS.USER);
  return d ? JSON.parse(d) : null;
}

function setUser(u) {
  if (u) localStorage.setItem(LSKEYS.USER, JSON.stringify(u));
  else localStorage.removeItem(LSKEYS.USER);
}

function updateNav() {
  const u = getUser();
  const nu = document.getElementById('nav-user');
  const nl = document.getElementById('nav-login');
  const nr = document.getElementById('nav-register');
  const bl = document.getElementById('btn-logout');
  if (u) {
    nu.textContent = `Hi ${u.name}`;
    if (nl) nl.style.display = 'none';
    if (nr) nr.style.display = 'none';
    if (bl) bl.style.display = 'inline-block';
  } else {
    if (nu) nu.textContent = '';
    if (nl) nl.style.display = 'inline-block';
    if (nr) nr.style.display = 'inline-block';
    if (bl) bl.style.display = 'none';
  }
}

function register(e) {
  e.preventDefault();
  const n = document.getElementById('reg-name').value.trim();
  const em = document.getElementById('reg-email').value.trim().toLowerCase();
  const p = document.getElementById('reg-password').value.trim();
  const m = document.getElementById('register-message');
  const us = getUsers();
  if (us.find(x => x.email === em)) {
    m.textContent = 'Email already registered';
    m.className = 'form-message error';
    return;
  }
  us.push({id: Date.now(), name: n, email: em, password: p});
  saveUsers(us);
  m.textContent = 'Registration successful! Login now.';
  m.className = 'form-message success';
  e.target.reset();
}

function login(e) {
  e.preventDefault();
  const em = document.getElementById('login-email').value.trim().toLowerCase();
  const p = document.getElementById('login-password').value.trim();
  const m = document.getElementById('login-message');
  const us = getUsers();
  const u = us.find(x => x.email === em && x.password === p);
  if (!u) {
    m.textContent = 'Invalid email or password';
    m.className = 'form-message error';
    return;
  }
  setUser({id: u.id, name: u.name, email: u.email});
  m.textContent = 'Login successful!';
  m.className = 'form-message success';
  setTimeout(() => {
    updateNav();
    show('home');
    e.target.reset();
  }, 500);
}

function renderProducts() {
  const c = document.getElementById('product-list');
  if (!c) return;
  const pr = getProducts();
  c.innerHTML = '';
  pr.forEach(pro => {
    const ca = document.createElement('div');
    ca.className = 'card product-card';
    ca.innerHTML = `<img src="https://via.placeholder.com/300x150" alt="${pro.name}"><h3>${pro.name}</h3><p class="price">₹${pro.price}</p><button class="btn primary" onclick="addCart(${pro.id})">Add Cart</button>`;
    c.appendChild(ca);
  });
}

function getCartKey() {
  const u = getUser();
  return u ? `cart_${u.id}` : null;
}

function getCart() {
  const k = getCartKey();
  if (!k) return [];
  return JSON.parse(localStorage.getItem(k)) || [];
}

function saveCart(ca) {
  const k = getCartKey();
  if (!k) return;
  localStorage.setItem(k, JSON.stringify(ca));
}

function addCart(id) {
  const u = getUser();
  if (!u) { alert('Login first'); return; }
  const pr = getProducts();
  const pro = pr.find(x => x.id === id);
  if (!pro) return;
  const ca = getCart();
  const ex = ca.find(x => x.productId === id);
  if (ex) ex.quantity += 1;
  else ca.push({productId: id, quantity: 1});
  saveCart(ca);
  alert(`${pro.name} added!`);
}

function renderCart() {
  const u = getUser();
  const c = document.getElementById('cart-items');
  const t = document.getElementById('cart-total');
  if (!c) return;
  if (!u) {
    c.innerHTML = '<p>Login to view cart</p>';
    t.textContent = '0';
    return;
  }
  const ca = getCart();
  const pr = getProducts();
  c.innerHTML = '';
  if (ca.length === 0) {
    c.innerHTML = '<p>Cart empty</p>';
    t.textContent = '0';
    return;
  }
  let tot = 0;
  ca.forEach(it => {
    const pro = pr.find(x => x.id === it.productId);
    if (!pro) return;
    const lt = pro.price * it.quantity;
    tot += lt;
    const r = document.createElement('div');
    r.className = 'cart-item';
    r.innerHTML = `<div>${pro.name} x${it.quantity}</div><div>₹${lt}</div>`;
    c.appendChild(r);
  });
  t.textContent = tot;
}

function placeOrder() {
  const u = getUser();
  const m = document.getElementById('cart-message');
  if (!u) { alert('Login'); return; }
  const ca = getCart();
  if (ca.length === 0) {
    m.textContent = 'Cart empty';
    m.className = 'form-message error';
    return;
  }
  const pr = getProducts();
  let tot = 0;
  const oi = ca.map(it => {
    const pro = pr.find(x => x.id === it.productId);
    if (!pro) return null;
    tot += pro.price * it.quantity;
    return {productId: pro.id, name: pro.name, price: pro.price, quantity: it.quantity};
  }).filter(Boolean);
  const os = getOrders();
  os.push({
    id: Date.now(),
    userId: u.id,
    userName: u.name,
    items: oi,
    total: tot,
    status: 'Placed',
    createdAt: new Date().toLocaleString()
  });
  saveOrders(os);
  saveCart([]);
  m.textContent = 'Order placed!';
  m.className = 'form-message success';
  renderCart();
}

function renderOrders() {
  const u = getUser();
  const c = document.getElementById('orders-list');
  if (!c) return;
  if (!u) {
    c.innerHTML = '<p>Login to view</p>';
    return;
  }
  const os = getOrders().filter(o => o.userId === u.id);
  if (os.length === 0) {
    c.innerHTML = '<p>No orders</p>';
    return;
  }
  c.innerHTML = os.map(o => 
    `<div class="card orders-card"><h3>Order ${o.id}</h3><p>Total: ₹${o.total} | Status: ${o.status} | ${o.createdAt}</p><ul>${o.items.map(i => `<li>${i.name} x${i.quantity} - ₹${i.price}</li>`).join('')}</ul></div>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', initApp);
