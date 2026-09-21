/**
 * Orders Management Handler for Subbayya Gari Hotel
 * Provides real-time synchronization between Customer orders and the Owner Portal
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory and orders file exist
function getOrders() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function saveOrders(orders) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing orders file:', err);
    return false;
  }
}

module.exports = {
  // GET /api/orders
  getOrdersHandler: (req, res) => {
    let orders = getOrders();
    const { phone, email, status, branch } = req.query;

    if (phone) {
      const cleanTargetPhone = phone.replace(/\D/g, '').slice(-10);
      orders = orders.filter(o => {
        const orderPhone = (o.customerPhone || '').replace(/\D/g, '').slice(-10);
        return orderPhone === cleanTargetPhone;
      });
    }

    if (email) {
      orders = orders.filter(o => (o.customerEmail || '').toLowerCase() === email.toLowerCase());
    }

    if (status && status !== 'all') {
      orders = orders.filter(o => (o.status || '').toLowerCase() === status.toLowerCase());
    }

    if (branch && branch !== 'all') {
      orders = orders.filter(o => (o.branchId || '').toLowerCase() === branch.toLowerCase());
    }

    // Return sorted newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  },

  // POST /api/orders
  createOrderHandler: (req, res) => {
    try {
      const orderData = req.body;
      if (!orderData || !orderData.customerName || !orderData.customerPhone) {
        return res.status(400).json({
          success: false,
          error: 'Customer name and phone number are required.'
        });
      }

      const orders = getOrders();
      const orderId = orderData.id || `SGH-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      const newOrder = {
        id: orderId,
        createdAt: nowIso,
        timestamp: Date.now(),
        customerName: orderData.customerName.trim(),
        customerPhone: orderData.customerPhone.trim(),
        customerEmail: (orderData.customerEmail || '').trim(),
        orderType: orderData.orderType || 'delivery',
        branchId: orderData.branchId || 'kphb',
        branchName: orderData.branchName || 'KPHB Colony, Hyderabad',
        branchAddress: orderData.branchAddress || 'MIG 295, Rd No. 4, Kukatpally, Hyderabad',
        items: Array.isArray(orderData.items) ? orderData.items : [],
        itemCount: orderData.itemCount || (Array.isArray(orderData.items) ? orderData.items.reduce((s, i) => s + (i.qty || 1), 0) : 1),
        subtotal: Number(orderData.subtotal) || 0,
        packagingFee: Number(orderData.packagingFee) || 30,
        deliveryFee: Number(orderData.deliveryFee) || 0,
        discount: Number(orderData.discount) || 0,
        promoCode: orderData.promoCode || null,
        grandTotal: Number(orderData.grandTotal) || 0,
        deliveryAddress: (orderData.deliveryAddress || '').trim(),
        deliveryLandmark: (orderData.deliveryLandmark || '').trim(),
        gpsMapUrl: (orderData.gpsMapUrl || '').trim(),
        pickupSlot: (orderData.pickupSlot || '').trim(),
        vehicleNote: (orderData.vehicleNote || '').trim(),
        status: 'Received',
        paymentStatus: orderData.paymentStatus || 'Verified & Confirmed',
        statusHistory: [
          { status: 'Received', time: nowIso, note: 'Order placed by customer via website' }
        ]
      };

      // Add to front
      orders.unshift(newOrder);
      saveOrders(orders);

      console.log(`[Order Created] ${newOrder.id} for ${newOrder.customerName} (₹${newOrder.grandTotal})`);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: newOrder
      });
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({ success: false, error: 'Internal server error creating order' });
    }
  },

  // POST or PATCH /api/orders/:id/status
  updateOrderStatusHandler: (req, res) => {
    try {
      const orderId = req.params.id;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'New status is required' });
      }

      const orders = getOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const order = orders[orderIndex];
      order.status = status;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status,
        time: new Date().toISOString(),
        note: note || `Status updated to ${status} by restaurant management`
      });

      orders[orderIndex] = order;
      saveOrders(orders);

      console.log(`[Order Updated] ${orderId} -> ${status}`);

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      res.status(500).json({ success: false, error: 'Internal server error updating order status' });
    }
  }
};
