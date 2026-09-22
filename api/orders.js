/**
 * Orders Management Handler for Subbayya Gari Hotel
 * Provides instant real-time synchronization between Customer orders and the Owner Portal
 * Features: Socket.IO events, Server-Sent Events (SSE), and persistent storage in data/orders.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Reference to Socket.IO server & SSE subscribers
let ioInstance = null;
const sseClients = new Set();

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
    console.error('[Orders] Error reading orders file:', err);
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
    console.error('[Orders] Error writing orders file:', err);
    return false;
  }
}

// Broadcast order update to all active Socket.IO clients & SSE listeners
function broadcastOrderUpdate(eventType, order) {
  // 1. Socket.IO broadcast
  if (ioInstance) {
    try {
      ioInstance.emit(eventType, { order, data: order });
      ioInstance.emit('order_update', { order, data: order });
      ioInstance.emit('order_updated', { order, data: order });
      ioInstance.emit('orders_updated', { orderId: order?.id });
      if (order?.tableNumber) {
        ioInstance.emit('table_allocated', { order, data: order });
      }
    } catch (e) {
      console.warn('[Orders] Socket broadcast error:', e.message);
    }
  }

  // 2. Server-Sent Events (SSE) broadcast
  const ssePayload = `event: ${eventType}\ndata: ${JSON.stringify({ order, eventType, timestamp: Date.now() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(ssePayload);
    } catch (e) {
      sseClients.delete(client);
    }
  });
}

module.exports = {
  // Attach Socket.IO instance
  setSocketIO: (io) => {
    ioInstance = io;
    io.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);
      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });
  },

  // GET /api/orders/stream (Server-Sent Events real-time sync)
  sseOrdersStreamHandler: (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Subbayya Gari Live Sync Stream Active' })}\n\n`);

    sseClients.add(res);

    // Keep connection alive with periodic heartbeats
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  },

  // GET /api/orders
  getOrdersHandler: (req, res) => {
    let orders = getOrders();
    const { phone, email, status, branch } = req.query;

    if (phone) {
      const cleanTargetPhone = phone.replace(/\D/g, '').slice(-10);
      orders = orders.filter(o => {
        const orderPhone = (o.customerPhone || o.phone || '').replace(/\D/g, '').slice(-10);
        return orderPhone === cleanTargetPhone;
      });
    }

    if (email) {
      orders = orders.filter(o => (o.customerEmail || o.email || '').toLowerCase() === email.toLowerCase());
    }

    if (status && status !== 'all') {
      orders = orders.filter(o => (o.status || o.orderStatus || '').toLowerCase() === status.toLowerCase());
    }

    if (branch && branch !== 'all') {
      orders = orders.filter(o => (o.branchId || o.branch || '').toLowerCase() === branch.toLowerCase());
    }

    // Return sorted newest first
    orders.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));

    res.json({
      success: true,
      count: orders.length,
      orders,
      data: orders
    });
  },

  // GET /api/orders/:id
  getOrderByIdHandler: (req, res) => {
    const orderId = (req.params.id || '').toString();
    const orders = getOrders();
    const order = orders.find(o => (o.id || '').toString() === orderId || (o.orderNumber || '').toString() === orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order #${orderId} not found`
      });
    }

    res.json({
      success: true,
      order,
      data: order
    });
  },

  // POST /api/orders
  createOrderHandler: (req, res) => {
    try {
      const orderData = req.body;
      if (!orderData || !orderData.customerName || (!orderData.customerPhone && !orderData.phone)) {
        return res.status(400).json({
          success: false,
          error: 'Customer name and phone number are required.'
        });
      }

      const orders = getOrders();
      const orderId = orderData.id || orderData.orderNumber || `SGH-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      const newOrder = {
        id: orderId,
        orderNumber: orderId,
        createdAt: nowIso,
        timestamp: Date.now(),
        customerName: orderData.customerName.trim(),
        customerPhone: (orderData.customerPhone || orderData.phone || '').trim(),
        phone: (orderData.customerPhone || orderData.phone || '').trim(),
        customerEmail: (orderData.customerEmail || orderData.email || '').trim(),
        email: (orderData.customerEmail || orderData.email || '').trim(),
        orderType: orderData.orderType || 'delivery',
        branchId: orderData.branchId || 'kphb',
        branchName: orderData.branchName || 'KPHB Colony, Hyderabad',
        branchAddress: orderData.branchAddress || 'MIG 295, Rd No. 4, Kukatpally, Hyderabad',
        items: Array.isArray(orderData.items) ? orderData.items : [],
        itemCount: orderData.itemCount || (Array.isArray(orderData.items) ? orderData.items.reduce((s, i) => s + (i.qty || i.quantity || 1), 0) : 1),
        subtotal: Number(orderData.subtotal) || 0,
        packagingFee: Number(orderData.packagingFee) || 30,
        deliveryFee: Number(orderData.deliveryFee || orderData.deliveryCharge) || 0,
        discount: Number(orderData.discount) || 0,
        promoCode: orderData.promoCode || null,
        grandTotal: Number(orderData.grandTotal || orderData.totalAmount) || 0,
        totalAmount: Number(orderData.grandTotal || orderData.totalAmount) || 0,
        deliveryAddress: (typeof orderData.deliveryAddress === 'object' ? orderData.deliveryAddress?.address : orderData.deliveryAddress) || '',
        deliveryLandmark: (typeof orderData.deliveryAddress === 'object' ? orderData.deliveryAddress?.landmark : orderData.deliveryLandmark) || '',
        gpsMapUrl: (orderData.gpsMapUrl || '').trim(),
        pickupSlot: (orderData.pickupSlot || '').trim(),
        vehicleNote: (orderData.vehicleNote || '').trim(),
        tableNumber: orderData.tableNumber || '',
        estimatedPrepTime: orderData.estimatedPrepTime || '20-25 Mins',
        riderName: orderData.riderName || '',
        riderPhone: orderData.riderPhone || '',
        kitchenNote: orderData.kitchenNote || '',
        status: 'Received',
        orderStatus: 'Received',
        paymentStatus: orderData.paymentStatus || 'Verified & Confirmed',
        paymentMethod: orderData.paymentMethod || 'Online Payment',
        statusHistory: [
          { status: 'Received', time: nowIso, note: 'Order placed by customer via website' }
        ]
      };

      // Add to front
      orders.unshift(newOrder);
      saveOrders(orders);

      console.log(`[Order Created] ${newOrder.id} for ${newOrder.customerName} (₹${newOrder.grandTotal})`);

      // Broadcast live to Owner portal & Customer sites
      broadcastOrderUpdate('order_created', newOrder);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: newOrder,
        data: newOrder
      });
    } catch (err) {
      console.error('[Orders] Error creating order:', err);
      res.status(500).json({ success: false, error: 'Internal server error creating order' });
    }
  },

  // POST, PATCH, PUT /api/orders/:id/status
  updateOrderStatusHandler: (req, res) => {
    try {
      const orderId = (req.params.id || '').toString();
      const { status, note, estimatedPrepTime, riderName, riderPhone, tableNumber } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'New status is required' });
      }

      const orders = getOrders();
      const orderIndex = orders.findIndex(o => (o.id || '').toString() === orderId || (o.orderNumber || '').toString() === orderId);

      if (orderIndex === -1) {
        return res.status(404).json({ success: false, error: `Order #${orderId} not found` });
      }

      const order = orders[orderIndex];
      order.status = status;
      order.orderStatus = status;

      if (estimatedPrepTime !== undefined) order.estimatedPrepTime = estimatedPrepTime;
      if (riderName !== undefined) order.riderName = riderName;
      if (riderPhone !== undefined) order.riderPhone = riderPhone;
      if (tableNumber !== undefined) order.tableNumber = tableNumber;

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status,
        time: new Date().toISOString(),
        note: note || `Status updated to "${status}" by restaurant management`
      });

      orders[orderIndex] = order;
      saveOrders(orders);

      console.log(`[Order Status Updated] ${orderId} -> ${status}`);

      // Broadcast real-time update to Customer & Owner
      broadcastOrderUpdate('order_status_updated', order);

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order,
        data: order
      });
    } catch (err) {
      console.error('[Orders] Error updating order status:', err);
      res.status(500).json({ success: false, error: 'Internal server error updating order status' });
    }
  },

  // POST, PATCH, PUT /api/orders/:id/update (Update full order details)
  updateOrderDetailsHandler: (req, res) => {
    try {
      const orderId = (req.params.id || '').toString();
      const updateData = req.body;

      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json({ success: false, error: 'Update payload is required' });
      }

      const orders = getOrders();
      const orderIndex = orders.findIndex(o => (o.id || '').toString() === orderId || (o.orderNumber || '').toString() === orderId);

      if (orderIndex === -1) {
        return res.status(404).json({ success: false, error: `Order #${orderId} not found` });
      }

      const existingOrder = orders[orderIndex];
      const prevStatus = existingOrder.status;

      // Update fields
      const allowedFields = [
        'status', 'orderStatus', 'estimatedPrepTime', 'riderName', 'riderPhone',
        'tableNumber', 'kitchenNote', 'notes', 'paymentStatus', 'discount',
        'deliveryAddress', 'deliveryLandmark', 'branchName', 'items', 'grandTotal', 'totalAmount'
      ];

      let statusChanged = false;
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          existingOrder[field] = updateData[field];
          if (field === 'status' && updateData[field] !== prevStatus) {
            statusChanged = true;
          }
        }
      });

      // Ensure dual compatibility
      if (updateData.status) existingOrder.orderStatus = updateData.status;
      if (updateData.orderStatus) existingOrder.status = updateData.orderStatus;
      if (updateData.grandTotal) existingOrder.totalAmount = Number(updateData.grandTotal);
      if (updateData.totalAmount) existingOrder.grandTotal = Number(updateData.totalAmount);

      if (!existingOrder.statusHistory) existingOrder.statusHistory = [];
      
      const changeNote = updateData.note || (statusChanged ? `Status updated to "${existingOrder.status}"` : 'Order details updated by restaurant management');
      existingOrder.statusHistory.push({
        status: existingOrder.status || 'Updated',
        time: new Date().toISOString(),
        note: changeNote
      });

      orders[orderIndex] = existingOrder;
      saveOrders(orders);

      console.log(`[Order Details Updated] ${orderId} - Fields modified`);

      // Broadcast live to customer site
      broadcastOrderUpdate('order_updated', existingOrder);

      res.json({
        success: true,
        message: 'Order details updated successfully',
        order: existingOrder,
        data: existingOrder
      });
    } catch (err) {
      console.error('[Orders] Error updating order details:', err);
      res.status(500).json({ success: false, error: 'Internal server error updating order details' });
    }
  },

  // DELETE /api/orders/:id
  deleteOrderHandler: (req, res) => {
    try {
      const orderId = (req.params.id || '').toString();
      let orders = getOrders();
      const initialLen = orders.length;
      orders = orders.filter(o => (o.id || '').toString() !== orderId && (o.orderNumber || '').toString() !== orderId);

      if (orders.length === initialLen) {
        return res.status(404).json({ success: false, error: `Order #${orderId} not found` });
      }

      saveOrders(orders);
      broadcastOrderUpdate('order_deleted', { id: orderId });

      res.json({
        success: true,
        message: `Order #${orderId} deleted successfully`
      });
    } catch (err) {
      console.error('[Orders] Error deleting order:', err);
      res.status(500).json({ success: false, error: 'Internal server error deleting order' });
    }
  }
};
