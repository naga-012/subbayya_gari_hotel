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

// Serve static assets from project root
app.use(express.static(path.join(__dirname), {
  maxAge: '1h',
  etag: true
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
