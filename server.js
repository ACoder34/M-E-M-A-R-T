const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'YOUR_DISCORD_WEBHOOK_URL_HERE';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Helper functions to read/write JSON files
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Products endpoints
app.get('/products', (req, res) => {
  res.json(readJson('products.json'));
});
app.post('/products', (req, res) => {
  const products = readJson('products.json');
  const product = req.body;
  product.id = Date.now();
  products.push(product);
  writeJson('products.json', products);
  res.json({ ok: true, product });
});

// Coupons endpoints
app.get('/coupons', (req, res) => {
  res.json(readJson('coupons.json'));
});
app.post('/coupons', (req, res) => {
  const coupons = readJson('coupons.json');
  const coupon = req.body;
  coupon.id = Date.now();
  coupons.push(coupon);
  writeJson('coupons.json', coupons);
  res.json({ ok: true, coupon });
});

// Updated checkout with coupon support
app.post('/checkout', async (req, res) => {
  const { email, discord, items, couponCode } = req.body;
  let discount = 0;
  let couponText = 'None';
  if (couponCode) {
    const coupons = readJson('coupons.json');
    const coupon = coupons.find(c => c.code === couponCode);
    if (coupon) {
      discount = coupon.discount;
      couponText = `${coupon.code} (${discount}% off)`;
    }
  }
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountedTotal = total * (1 - discount / 100);
  const embed = {
    title: 'New Order Placed!',
    color: 0x64ffda,
    fields: [
      { name: 'Email', value: email, inline: true },
      { name: 'Discord Username', value: discord, inline: true },
      { name: 'Items', value: items.map(i => `${i.name} x${i.qty} - $${i.price}`).join('\n') || 'No items', inline: false },
      { name: 'Coupon', value: couponText, inline: true },
      { name: 'Total', value: `$${discountedTotal.toFixed(2)}`, inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await axios.post(WEBHOOK_URL, { embeds: [embed] }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Discord response:', response.status, response.data);
    if (response.status < 200 || response.status >= 300) {
      console.error('Discord webhook error:', response.data);
      return res.status(500).json({ ok: false, error: response.data });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Axios error:', err.response ? err.response.data : err.message, err.stack);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 