/**
 * Subbayya Gari Hotel - Production Web Server for Render & Local Development
 * Serves frontend static files and handles API endpoints + Real-Time WebSockets
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (err) {
    console.warn('Could not read .env file:', err.message);
  }
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Setup Socket.IO for Instant Real-Time Two-Way Sync
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for all API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

// Menu API routes (Live price & stock updates)
const menuHandler = require('./api/menu');
app.get('/api/menu', menuHandler.getMenuHandler);
app.post('/api/menu/update', menuHandler.updateMenuItemHandler);
app.post('/api/menu/reset', menuHandler.resetMenuHandler);

// Settings API routes (Store status, announcement banner, wait time)
const settingsHandler = require('./api/settings');
app.get('/api/settings', settingsHandler.getSettingsHandler);
app.post('/api/settings/update', settingsHandler.updateSettingsHandler);

// Orders API routes (Customer orders & Owner dashboard real-time sync)
const ordersHandler = require('./api/orders');
ordersHandler.setSocketIO(io);

app.get('/api/orders/stream', ordersHandler.sseOrdersStreamHandler);
app.get('/api/orders', ordersHandler.getOrdersHandler);
app.post('/api/orders', ordersHandler.createOrderHandler);
app.get('/api/orders/:id', ordersHandler.getOrderByIdHandler);
app.all('/api/orders/:id/status', ordersHandler.updateOrderStatusHandler);
app.all('/api/orders/:id/update', ordersHandler.updateOrderDetailsHandler);
app.patch('/api/orders/:id', ordersHandler.updateOrderDetailsHandler);
app.put('/api/orders/:id', ordersHandler.updateOrderDetailsHandler);
app.delete('/api/orders/:id', ordersHandler.deleteOrderHandler);

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

// Start listening with HTTP & Socket.IO server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Subbayya Gari Hotel server is running on port ${PORT}`);
  console.log(`Real-Time Socket.IO & SSE Live Sync Active`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
