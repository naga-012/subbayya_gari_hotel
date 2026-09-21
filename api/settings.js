/**
 * Settings & Notice Banner Management API for Subbayya Gari Hotel
 * Real-time synchronization between Owner portal and Customer site
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  restaurantStatus: 'open', // 'open', 'rush', 'closed'
  statusMessage: 'Accepting Online Orders & Banana Leaf Dining',
  announcementText: 'Authentic East Godavari Pure Vegetarian Bhojanam with Overflowing Warm Ghee!',
  promoBanner: '🎉 Use Code GHEE50 for Flat ₹50 OFF on Butta Bhojanam Orders Above ₹499!',
  discountPercentage: 0,
  kitchenWaitMinutes: 20,
  phoneContact: '+91 90108 88842',
  updatedAt: new Date().toISOString()
};

function getSettings() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw || '{}');
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Error reading settings file:', err);
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing settings file:', err);
    return false;
  }
}

module.exports = {
  // GET /api/settings
  getSettingsHandler: (req, res) => {
    const settings = getSettings();
    res.json({
      success: true,
      settings
    });
  },

  // POST /api/settings/update
  updateSettingsHandler: (req, res) => {
    try {
      const current = getSettings();
      const updates = req.body || {};

      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      saveSettings(updated);
      console.log('[Restaurant Settings Updated by Owner]:', updated);

      res.json({
        success: true,
        message: 'Restaurant settings updated successfully',
        settings: updated
      });
    } catch (err) {
      console.error('Error updating settings:', err);
      res.status(500).json({ success: false, error: 'Server error updating settings' });
    }
  }
};
