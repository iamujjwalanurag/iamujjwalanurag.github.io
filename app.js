// Simple digital products shop (no backend)
// - products array defines items
// - cart persisted to localStorage
// - checkout simulates payment and provides download links (Blobs)

const PRODUCTS_KEY = 'digitale_products_demo';
const CART_KEY = 'digitale_cart';
const PURCHASES_KEY = 'digitale_purchases';

const products = [
  {
    id: 'ebook-zen-css',
    title: 'Zen CSS: Practical Guide',
    price: 12.00,
    description: 'A short ebook on pragmatic CSS patterns.',
    tags: ['ebook','css','design'],
    fileName: 'zen-css-guide.txt',
    fileContent: 'Zen CSS — Practical Guide\n\nThanks for purchasing! This is a placeholder content.'
  },
  {
    id: 'ui-kit-compact',
    title: 'Compact UI Kit',
    price: 24.00,
    description: 'A small UI kit with reusable components (Figma/PNG assets).',
    tags: ['ui-kit','design','assets'],
    fileName: 'compact-ui-kit.txt',
    fileContent: 'Compact UI Kit — assets placeholder\n\nImagine SVGs and Figma file here.'
  },
  {
    id: 'starter-template',
    title: 'Starter Site Template',
    price: 18.00,
    description: 'A minimal HTML/CSS starter template for landing pages.',
    tags: ['template','html','starter'],
    fileName: 'starter-template.txt',
    fileContent: 'Starter Template — index.html\n\n<html>...placeholder...</html>'
  },
  {
    id: 'email-templates',
    title: 'Email Campaign Templates',
    price: 9.00,
    description: 'A pack of responsive email templates.',
    tags: ['email','templates','marketing'],
    fileName: 'email-templates.txt',
    fileContent: 'Email templates pack — placeholder content.'
  }
];

// Simple state
let cart = loadJSON(CART_KEY, []);
let purchases = loadJSON(PURCHASES_KEY, []);

// DOM refs
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartPanel = document.getElementById('cart');
const cartCount = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutList = document.getElementById('checkoutList');
const payBtn = document.getElementById('payBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const emailInput = document.getElementById('email');
const checkoutMessage = document.getElementById('checkoutMessage');
const purchasesEl = document.getElementById('purchases');
const searchInput = document.getElementById('search');
const tagsContainer = document.getElementById('tags');
const closeCart = document.getElementById('closeCart');

// render
renderProducts(products);
renderTags(products);
updateCartUI();
renderPurchases();

// Event listeners
cartBtn.addEventListener('click', () => openCart());
closeCart.addEventListener('click', () => closeCartPanel());
document.getElementById('closeCart').addEventListener('click', () => closeCartPanel());
checkoutBtn.addEventListener('click', () => openCheckout());
closeModal.addEventListener('click', () => closeCheckout());
cancelBtn.addEventListener('click', () => closeCheckout());
payBtn.addEventListener('click', simulatePayment);
searchInput.addEventListener('input', handleSearch);

// Helpers
function loadJSON(key, fallback){
  try{
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  }catch(e){
    return fallback;
  }
}
function saveJSON(key, val){
  localStorage.setItem(key, JSON.stringify(val));
}

function renderProducts(list){
  productGrid.innerHTML = '';
  list.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <div class="thumbnail">${p.title.split(' ').slice(0,2).map(s=>s[0]).join('')}</div>
      <h4>${p.title}</h4>
      <p class="muted">${p.description}</p>
      <div class="meta">
        <div class="muted">$${p.price.toFixed(2)}</div>
        <div>
          <button class="btn add" data-id="${p.id}">Add</button>
          <button class="btn view" data-id="${p.id}">View</button>
        </div>
      </div>
    `;
    productGrid.appendChild(el);
  });

  // attach add/view handlers
  productGrid.querySelectorAll('.btn.add').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      addToCart(id);
    });
  });
  productGrid.querySelectorAll('.btn.view').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      const p = products.find(x=>x.id===id);
      alert(`${p.title}\n\n${p.description}\n\nPrice: $${p.price.toFixed(2)}`);
    });
  });
}

function renderTags(list){
  // collect tags
  const tagSet = new Set();
  list.forEach(p => p.tags.forEach(t=>tagSet.add(t)));
  tagsContainer.innerHTML = '';
  Array.from(tagSet).sort().forEach(tag=>{
    const b = document.createElement('button');
    b.className = 'tag';
    b.textContent = tag;
    b.dataset.tag = tag;
    b.addEventListener('click', toggleTagFilter);
    tagsContainer.appendChild(b);
  });
}

function toggleTagFilter(e){
  const btn = e.currentTarget;
  btn.classList.toggle('active');
  applyFilters();
}

function handleSearch(){
  applyFilters();
}

function applyFilters(){
  const q = searchInput.value.trim().toLowerCase();
  const activeTags = Array.from(tagsContainer.querySelectorAll('.tag.active')).map(t=>t.dataset.tag);
  let filtered = products.filter(p => {
    const matchesQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesTag = activeTags.length === 0 || activeTags.every(t => p.tags.includes(t));
    return matchesQ && matchesTag;
  });
  renderProducts(filtered);
}

// Cart logic
function addToCart(id){
  const p = products.find(x=>x.id===id);
  const existing = cart.find(c => c.id === id);
  if(existing){
    existing.qty += 1;
  } else {
    cart.push({ id: p.id, title: p.title, price: p.price, qty: 1 });
  }
  saveJSON(CART_KEY, cart);
  updateCartUI();
  openCart();
}

function updateCartUI(){
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  cart.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <div style="font-weight:600">${item.title}</div>
        <div class="muted">${item.qty} × $${item.price.toFixed(2)}</div>
      </div>
      <div>
        <button class="btn small dec" data-id="${item.id}">-</button>
        <button class="btn small inc" data-id="${item.id}">+</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  cartItemsEl.querySelectorAll('.dec').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      changeQty(id, -1);
    });
  });
  cartItemsEl.querySelectorAll('.inc').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      changeQty(id, +1);
    });
  });

  const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
  checkoutBtn.disabled = cart.length === 0;
}

function changeQty(id, delta){
  const idx = cart.findIndex(c=>c.id===id);
  if(idx === -1) return;
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  saveJSON(CART_KEY, cart);
  updateCartUI();
}

function openCart(){
  cartPanel.setAttribute('aria-hidden','false');
  cartPanel.style.display = 'block';
}
function closeCartPanel(){
  cartPanel.setAttribute('aria-hidden','true');
  cartPanel.style.display = 'none';
}

// Checkout
function openCheckout(){
  checkoutModal.setAttribute('aria-hidden','false');
  checkoutList.innerHTML = '';
  cart.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'muted';
    div.textContent = `${item.qty} × ${item.title} — $${(item.price*item.qty).toFixed(2)}`;
    checkoutList.appendChild(div);
  });
  checkoutMessage.textContent = '';
}

function closeCheckout(){
  checkoutModal.setAttribute('aria-hidden','true');
}

function simulatePayment(){
  const email = emailInput.value.trim();
  // Basic validation
  if(!email || !email.includes('@')){
    checkoutMessage.textContent = 'Please enter a valid email.';
    return;
  }
  payBtn.disabled = true;
  checkoutMessage.textContent = 'Processing payment...';
  // Simulate network delay
  setTimeout(()=>{
    // create downloads (Blobs) and save purchases
    const downloaded = [];
    cart.forEach(item=>{
      const prod = products.find(p=>p.id===item.id);
      for(let i=0;i<item.qty;i++){
        const file = createDownloadBlob(prod.fileContent, prod.fileName);
        const purchase = {
          id: `${prod.id}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
          title: prod.title,
          fileName: prod.fileName,
          url: file,
          email,
          purchasedAt: new Date().toISOString()
        };
        purchases.push(purchase);
        downloaded.push(purchase);
      }
    });
    saveJSON(PURCHASES_KEY, purchases);
    // clear cart
    cart = [];
    saveJSON(CART_KEY, cart);
    updateCartUI();
    renderPurchases();
    checkoutMessage.textContent = 'Payment succeeded — download links added to Purchases and available below.';
    payBtn.disabled = false;
    // close checkout after short delay
    setTimeout(()=>{ closeCheckout(); closeCartPanel(); }, 1200);
  }, 1000);
}

function createDownloadBlob(content, filename){
  // create a text blob and return an object URL for download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  return url;
}

function renderPurchases(){
  purchasesEl.innerHTML = '';
  if(purchases.length === 0){
    purchasesEl.innerHTML = '<div class="muted">No purchases yet.</div>';
    return;
  }
  purchases.slice().reverse().forEach(p=>{
    const a = document.createElement('a');
    a.href = p.url;
    a.download = p.fileName || 'download.txt';
    a.textContent = `${p.title} — Download`;
    a.target = '_blank';
    purchasesEl.appendChild(a);
  });
}

// On first load: if no products in localStorage, seed them (not necessary but kept for extension)
if(!localStorage.getItem(PRODUCTS_KEY)){
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// On page load, keep purchases links available (recreate Blobs if needed)
(function hydratePurchases(){
  // purchases are stored with URLs, but object URLs don't persist across sessions.
  // If purchases loaded from storage lack a url that starts with "blob:", recreate from product content.
  purchases = loadJSON(PURCHASES_KEY, purchases);
  let changed = false;
  purchases = purchases.map(p=>{
    if(!p.url || !p.url.startsWith('blob:')){
      // try to find original product by title or id prefix
      const match = products.find(prod => p.id && p.id.startsWith(prod.id));
      if(match){
        p.url = createDownloadBlob(match.fileContent, match.fileName);
        changed = true;
      } else {
        // fallback: create generic receipt file
        p.url = createDownloadBlob(`Thank you for your purchase of ${p.title}`, `${p.title}-receipt.txt`);
        changed = true;
      }
    }
    return p;
  });
  if(changed) saveJSON(PURCHASES_KEY, purchases);
})();

/* Accessibility: close modal with Esc */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    closeCheckout();
    closeCartPanel();
  }
});
