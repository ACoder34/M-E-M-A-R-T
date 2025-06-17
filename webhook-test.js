const axios = require('axios');
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'YOUR_DISCORD_WEBHOOK_URL_HERE';

axios.post(WEBHOOK_URL, {
  content: "Direct test from Node.js script!"
}, {
  headers: { 'Content-Type': 'application/json' }
}).then(res => {
  console.log('Success:', res.status, res.data);
}).catch(err => {
  console.error('Error:', err.response ? err.response.data : err.message);
}); 