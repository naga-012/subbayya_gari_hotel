const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Helper to read users
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading users.json:', err.message);
  }
  return [];
}

// Helper to save users
function writeUsers(users) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving users.json:', err.message);
  }
}

// Normalize phone number (last 10 digits)
function normalizePhone(p) {
  return String(p || '').replace(/\D/g, '').slice(-10);
}

// GET /api/users/check?target=... (or phone / email)
function checkUserHandler(req, res) {
  const target = (req.query.target || req.query.phone || req.query.email || '').trim().toLowerCase();
  const cleanPhone = normalizePhone(target);

  if (!target) {
    return res.status(400).json({ error: 'Target phone or email is required' });
  }

  const users = readUsers();
  const found = users.find(u => {
    const userPhone = normalizePhone(u.phone);
    const userEmail = (u.email || '').toLowerCase().trim();
    if (cleanPhone && cleanPhone.length >= 10 && userPhone === cleanPhone) return true;
    if (target.includes('@') && userEmail === target) return true;
    return false;
  });

  if (found) {
    return res.status(200).json({ registered: true, user: found });
  } else {
    return res.status(200).json({ registered: false, message: 'Customer is not registered yet. Please register first.' });
  }
}

// POST /api/users/register
function registerUserHandler(req, res) {
  const { name, phone, email, address } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone number are required for registration' });
  }

  const cleanPhone = normalizePhone(phone);
  const cleanEmail = (email || `${cleanPhone}@subbayyagari.in`).trim().toLowerCase();

  const users = readUsers();
  // Check if already registered
  const existing = users.find(u => normalizePhone(u.phone) === cleanPhone || (u.email && u.email.toLowerCase() === cleanEmail));

  if (existing) {
    return res.status(200).json({ success: true, user: existing, alreadyRegistered: true });
  }

  const newUser = {
    id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
    name: name.trim(),
    phone: cleanPhone,
    email: cleanEmail,
    address: (address || 'Hyderabad, Telangana').trim(),
    coins: 50,
    tier: 'VIP Patron',
    memberSince: new Date().getFullYear().toString(),
    registeredAt: new Date().toISOString()
  };

  users.unshift(newUser);
  writeUsers(users);

  return res.status(201).json({ success: true, user: newUser, alreadyRegistered: false });
}

// GET /api/users
function getUsersHandler(req, res) {
  const users = readUsers();
  return res.status(200).json({ users });
}

module.exports = {
  checkUserHandler,
  registerUserHandler,
  getUsersHandler
};
