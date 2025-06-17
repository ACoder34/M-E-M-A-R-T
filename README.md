# M | N E M A R T

A modern digital store for accounts, services, and more.

## Features
- Persistent products and coupons
- Discord webhook order notifications
- Modern glassmorphism blue design
- Admin panel with login

## Setup & Deployment

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/yourrepo.git
   cd yourrepo/minemert-store
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set environment variables:**
   - Create a `.env` file in `minemert-store/`:
     ```env
     WEBHOOK_URL=YOUR_DISCORD_WEBHOOK_URL_HERE
     PORT=3000
     ```
   - Never commit your real webhook URL to GitHub!

4. **Run the server:**
   ```sh
   node server.js
   ```

5. **Access the site:**
   - Open `http://localhost:3000` in your browser.

## Security & Best Practices
- `.gitignore` is set up to ignore `node_modules`, `.env`, and other sensitive files.
- Never commit secrets or real webhook URLs to your repository.
- Change admin credentials in production.

## Contributing
Pull requests are welcome! 