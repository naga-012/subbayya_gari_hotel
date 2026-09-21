/**
 * Subbayya Gari Hotel - Production Web Server for Render
 * Serves frontend static files and handles API endpoints (OTP email verification)
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Render zero-downtime monitoring
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Subbayya Gari Hotel Web Service', timestamp: new Date().toISOString() });
});

// API routes
const sendOtpHandler = require('./api/send-otp');
app.all('/api/send-otp', sendOtpHandler);

// Users API routes (Customer Registration & Authentication check)
const usersHandler = require('./api/users');
app.get('/api/users/check', usersHandler.checkUserHandler);
app.post('/api/users/register', usersHandler.registerUserHandler);
app.get('/api/users', usersHandler.getUsersHandler);

// Orders API routes (Customer orders & Owner dashboard sync)
const ordersHandler = require('./api/orders');
app.get('/api/orders', ordersHandler.getOrdersHandler);
app.post('/api/orders', ordersHandler.createOrderHandler);
app.all('/api/orders/:id/status', ordersHandler.updateOrderStatusHandler);

// Dedicated Pages Routes
app.get(['/owner', '/owner.html', '/admin', '/crm'], (req, res) => {
  res.sendFile(path.join(__dirname, 'owner.html'));
});

app.get(['/login', '/login.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve static assets from project root (fresh updates without stale browser caching)
app.use(express.static(path.join(__dirname), {
  maxAge: 0,
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// Fallback all unmatched requests to index.html (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Subbayya Gari Hotel server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
