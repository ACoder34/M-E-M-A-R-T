// --- Load products from backend (index.html) ---
if (document.getElementById('products')) {
  fetch('/products')
    .then(res => res.json())
    .then(PRODUCTS => {
      const productsDiv = document.getElementById('products');
      productsDiv.innerHTML = '';
      PRODUCTS.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.image || ''}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div style="margin-bottom: 0.5rem; font-weight: bold; color: #64ffda;">$${product.price}</div>
          <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsDiv.appendChild(card);
      });
      window.PRODUCTS = PRODUCTS;
    });
}

// --- Cart Logic ---
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function addToCart(id) {
  const cart = getCart();
  const found = cart.find(item => item.id === id);
  if (found) found.qty++;
  else cart.push({ id, qty: 1 });
  setCart(cart);
  alert('Added to cart!');
}
function clearCart() {
  localStorage.removeItem('cart');
}

// --- Cart Page (cart.html) ---
if (document.getElementById('cart-summary')) {
  let PRODUCTS = [];
  fetch('/products').then(res => res.json()).then(data => {
    PRODUCTS = data;
    renderCart(PRODUCTS);
  });

  function renderCart(PRODUCTS) {
    const cart = getCart();
    const cartSummary = document.getElementById('cart-summary');
    if (cart.length === 0) {
      cartSummary.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      let html = '<ul>';
      let total = 0;
      cart.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        if (product) {
          html += `<li>${product.name} x${item.qty} - $${(product.price * item.qty).toFixed(2)}</li>`;
          total += product.price * item.qty;
        }
      });
      html += `</ul><div style="margin-top:1rem;font-weight:bold;">Total: $<span id="cart-total">${total.toFixed(2)}</span></div>`;
      html += `<div style="margin-top:1rem;"><input id="coupon-code" placeholder="Coupon code" style="width:60%"> <button onclick="applyCoupon()" class="btn-primary">Apply</button></div>`;
      html += `<div id="discount-info" style="margin-top:0.5rem;color:#64ffda;"></div>`;
      cartSummary.innerHTML = html;
    }
  }

  window.applyCoupon = function() {
    const code = document.getElementById('coupon-code').value.trim();
    if (!code) return;
    fetch('/coupons').then(res => res.json()).then(coupons => {
      const coupon = coupons.find(c => c.code === code);
      if (coupon) {
        const cart = getCart();
        let PRODUCTS = window.PRODUCTS || [];
        fetch('/products').then(res => res.json()).then(data => {
          PRODUCTS = data;
          let total = 0;
          cart.forEach(item => {
            const product = PRODUCTS.find(p => p.id === item.id);
            if (product) total += product.price * item.qty;
          });
          const discount = coupon.discount;
          const discountedTotal = total * (1 - discount / 100);
          document.getElementById('discount-info').innerText = `Coupon applied: ${coupon.code} (${discount}% off). New total: $${discountedTotal.toFixed(2)}`;
          document.getElementById('cart-total').innerText = discountedTotal.toFixed(2);
          window.APPLIED_COUPON = coupon.code;
        });
      } else {
        document.getElementById('discount-info').innerText = 'Invalid coupon code.';
        window.APPLIED_COUPON = null;
      }
    });
  }

  document.getElementById('checkout-form').onsubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const discord = document.getElementById('discord').value;
    const couponCode = window.APPLIED_COUPON || document.getElementById('coupon-code').value.trim();
    const cart = getCart();
    // Always fetch latest products before sending checkout
    fetch('/products').then(res => res.json()).then(PRODUCTS => {
      const items = cart.map(item => {
        const p = PRODUCTS.find(pr => pr.id === item.id);
        return p ? { name: p.name, qty: item.qty, price: p.price } : null;
      }).filter(Boolean);
      fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          discord,
          couponCode,
          items
        })
      });
      clearCart();
      document.getElementById('discord-popup').classList.remove('hidden');
    });
  }
}
function closePopup() {
  document.getElementById('discord-popup').classList.add('hidden');
}
window.closePopup = closePopup;

// --- Admin Panel (admin.html) ---
if (document.getElementById('add-product-form')) {
  // Load and display products
  function loadProducts() {
    fetch('/products').then(res => res.json()).then(products => {
      const productList = document.getElementById('product-list');
      productList.innerHTML = '';
      products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `<h3>${product.name}</h3><p>${product.description}</p><div>$${product.price}</div><img src="${product.image}" style="width:60px;height:60px;">`;
        productList.appendChild(div);
      });
    });
  }
  loadProducts();
  document.getElementById('add-product-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('product-name').value;
    const desc = document.getElementById('product-desc').value;
    const price = document.getElementById('product-price').value;
    const image = document.getElementById('product-image').value;
    fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, price: Number(price), image })
    }).then(() => {
      loadProducts();
      e.target.reset();
    });
  };
  // Load and display coupons
  function loadCoupons() {
    fetch('/coupons').then(res => res.json()).then(coupons => {
      const couponList = document.getElementById('coupon-list');
      couponList.innerHTML = '';
      coupons.forEach(coupon => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `<h3>${coupon.code}</h3><div>${coupon.discount}% off</div><div>Valid until: ${coupon.validUntil || ''}</div>`;
        couponList.appendChild(div);
      });
    });
  }
  loadCoupons();
  document.getElementById('add-coupon-form').onsubmit = function(e) {
    e.preventDefault();
    const code = document.getElementById('coupon-code').value;
    const discount = document.getElementById('coupon-discount').value;
    const valid = document.getElementById('coupon-valid').value;
    fetch('/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, discount: Number(discount), validUntil: valid })
    }).then(() => {
      loadCoupons();
      e.target.reset();
    });
  };
} 