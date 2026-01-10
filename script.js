// Sample products (expand this array)
const products = [
  { id: 1, name: 'Product 1', price: 29.99, img: 'https://via.placeholder.com/250x200?text=Product+1', desc: 'Description 1' },
  { id: 2, name: 'Product 2', price: 39.99, img: 'https://via.placeholder.com/250x200?text=Product+2', desc: 'Description 2' },
  { id: 3, name: 'Product 3', price: 49.99, img: 'https://via.placeholder.com/250x200?text=Product+3', desc: 'Description 3' }
];

// Cart functions
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart!');
}

function updateCart(id, quantity) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity = quantity;
    if (quantity === 0) {
      cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById('cart-items');
  if (container) {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span>${item.name} - $${item.price}</span>
        <input type="number" value="${item.quantity}" min="0" onchange="updateCart(${item.id}, this.value)">
        <span>$${ (item.price * item.quantity).toFixed(2) }</span>
      </div>
    `).join('');
    document.getElementById('total').textContent = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  }
}

function renderProducts(containerSelector, filter = null) {
  const container = document.querySelector(containerSelector);
  if (container) {
    const filtered = filter ? products.filter(p => p.id === filter) : products;
    container.innerHTML = filtered.map(p => `
      <div class="product">
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
        <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    `).join('');
  }
}

// Load cart on pages that need it
if (document.getElementById('cart-items')) renderCart();
