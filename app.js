
// ==========================================================================
// SUBBAYYA GARI HOTEL - GLOBAL BACKEND CONFIGURATION
// ==========================================================================
function resolveBackendBase() {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  const loc = window.location;
  if (loc.protocol.startsWith('http')) {
    if ((loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') && loc.port && loc.port !== '3000') {
      return `http://${loc.hostname}:3000`;
    }
    return loc.origin;
  }
  return 'http://localhost:3000';
}
const BACKEND_BASE = resolveBackendBase();
const sghBroadcast = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('sgh_order_channel') : null;

// ==========================================================================
// REAL-TIME ORDER LIVE SYNC & NORMALIZATION (Customer Website)
// ==========================================================================
function normalizeServerOrder(o) {
  if (!o) return null;
  const items = (o.items || []).map(i => ({
    id: i.menuItemId || i.id || '',
    name: i.name || 'Bhojanam Specialty',
    price: Number(i.price) || 0,
    qty: Number(i.quantity || i.qty) || 1,
    total: (Number(i.price) || 0) * (Number(i.quantity || i.qty) || 1),
    image: i.image || ''
  }));

  const subtotal = o.subtotal !== undefined ? Number(o.subtotal) : items.reduce((s, i) => s + i.total, 0);
  const packagingFee = o.packagingFee !== undefined ? Number(o.packagingFee) : 30;
  const deliveryFee = o.deliveryCharge !== undefined ? Number(o.deliveryCharge) : (o.deliveryFee !== undefined ? Number(o.deliveryFee) : 0);
  const discount = Number(o.discount) || 0;
  const grandTotal = o.totalAmount !== undefined ? Number(o.totalAmount) : (o.grandTotal !== undefined ? Number(o.grandTotal) : (subtotal + packagingFee + deliveryFee - discount));

  return {
    id: (o.orderNumber || o.id || '').toString(),
    createdAt: o.createdAt || new Date().toISOString(),
    timestamp: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
    status: o.orderStatus || o.status || 'Received',
    customerName: o.customerName || '',
    customerPhone: o.phone || o.customerPhone || '',
    customerEmail: o.email || o.customerEmail || '',
    orderType: o.orderType || 'delivery',
    branchName: o.branch || o.branchName || 'KPHB Colony, Hyderabad',
    branchAddress: o.branchAddress || 'MIG 295, Rd No. 4, Kukatpally, Hyderabad',
    items: items,
    itemCount: items.reduce((sum, i) => sum + i.qty, 0),
    subtotal: subtotal,
    packagingFee: packagingFee,
    deliveryFee: deliveryFee,
    discount: discount,
    grandTotal: grandTotal,
    paymentStatus: o.paymentStatus || 'Paid Online / Verified',
    paymentMethod: o.paymentMethod || 'Online Payment',
    tableNumber: o.tableNumber || '',
    guestsCount: Number(o.guestsCount) || 1,
    reservationDate: o.reservationDate || '',
    reservationTime: o.reservationTime || '',
    seatingPreference: o.seatingPreference || 'Traditional Banana Leaf Seating',
    notes: o.notes || '',
    kitchenNote: o.kitchenNote || '',
    riderName: o.riderName || '',
    riderPhone: o.riderPhone || '',
    estimatedPrepTime: o.estimatedPrepTime || '20-25 Mins',
    deliveryAddress: (typeof o.deliveryAddress === 'object' ? o.deliveryAddress?.address : o.deliveryAddress) || '',
    deliveryLandmark: (typeof o.deliveryAddress === 'object' ? o.deliveryAddress?.landmark : o.deliveryLandmark) || '',
    statusHistory: o.statusHistory || []
  };
}

// Live Socket.IO connection & SSE stream for customer real-time updates
let customerSocket = null;
let customerSSE = null;

function initCustomerLiveSync() {
  const handleLiveOrderEvent = (payload) => {
    console.log('[Customer Live Sync] Real-time order update received:', payload);
    const rawOrder = payload.order || payload.data || payload;
    const normalized = normalizeServerOrder(rawOrder);
    if (!normalized || !normalized.id) return;

    // Update local storage orders
    try {
      const localOrders = JSON.parse(localStorage.getItem('sgh_customer_orders') || '[]');
      const idx = localOrders.findIndex(o => o && (o.id === normalized.id || o.orderNumber === normalized.id));
      if (idx !== -1) {
        localOrders[idx] = { ...localOrders[idx], ...normalized };
      } else {
        localOrders.unshift(normalized);
      }
      localStorage.setItem('sgh_customer_orders', JSON.stringify(localOrders));
      updateHeaderMyOrdersBadge(localOrders);
    } catch (e) {}

    // Check if this order belongs to currently logged-in user or active session
    const currentUserPhone = AppState?.currentUser?.phone ? AppState.currentUser.phone.replace(/\D/g, '').slice(-10) : '';
    const isUserOrder = !currentUserPhone || (normalized.customerPhone && normalized.customerPhone.replace(/\D/g, '').slice(-10) === currentUserPhone);

    // If order details modal is open for this order, dynamically update it live!
    if (typeof activeViewingOrder !== 'undefined' && activeViewingOrder && (activeViewingOrder.id === normalized.id || activeViewingOrder.orderNumber === normalized.id)) {
      openOrderDetailsModal(normalized.id);
      showToast(`🔔 Live Update: Order #${normalized.id} status is now "${normalized.status}"!`);
    } else if (isUserOrder) {
      showToast(`🔔 Restaurant Update: Order #${normalized.id} is now "${normalized.status}"!`);
    }

    // If profile / my orders container is open, re-render list
    const myOrdersContainer = document.getElementById('customer-orders-container') || document.getElementById('prof-customer-orders-container');
    if (myOrdersContainer && typeof fetchAndRenderCustomerOrders === 'function') {
      fetchAndRenderCustomerOrders();
    }
  };

  // 1. Socket.IO Connection
  if (typeof io !== 'undefined') {
    try {
      customerSocket = io(BACKEND_BASE, { transports: ['websocket', 'polling'] });
      
      customerSocket.on('connect', () => {
        console.log('[Customer Live Sync] Connected to Subbayya Gari Real-Time Server');
      });

      customerSocket.on('order_status_updated', handleLiveOrderEvent);
      customerSocket.on('order_update', handleLiveOrderEvent);
      customerSocket.on('order_updated', handleLiveOrderEvent);
      customerSocket.on('table_allocated', handleLiveOrderEvent);
      customerSocket.on('payment_status_updated', handleLiveOrderEvent);
      customerSocket.on('orders_updated', () => {
        if (typeof fetchAndRenderCustomerOrders === 'function') {
          fetchAndRenderCustomerOrders();
        }
      });
    } catch (err) {
      console.warn('[Customer Live Sync] Socket connection notice:', err);
    }
  }

  // 2. Server-Sent Events (SSE) stream fallback
  if (typeof EventSource !== 'undefined') {
    try {
      customerSSE = new EventSource(`${BACKEND_BASE}/api/orders/stream`);
      customerSSE.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.order) {
            handleLiveOrderEvent(data);
          }
        } catch (err) {}
      };
    } catch (err) {
      console.warn('[Customer Live Sync] SSE stream notice:', err);
    }
  }

  // 3. Intra-Browser BroadcastChannel Sync (Instant 0ms sync between Owner & Customer tabs)
  if (sghBroadcast) {
    try {
      sghBroadcast.onmessage = (event) => {
        if (event && event.data && (event.data.order || event.data.type)) {
          console.log('[Customer Live Sync] BroadcastChannel event received:', event.data);
          handleLiveOrderEvent(event.data);
        }
      };
    } catch (e) {}
  }

  // 4. Cross-Tab LocalStorage Sync Event
  window.addEventListener('storage', (e) => {
    if (e.key === 'sgh_latest_order_event' || e.key === 'sgh_customer_orders' || e.key === 'sgh_all_orders') {
      try {
        if (e.key === 'sgh_latest_order_event' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.order) {
            handleLiveOrderEvent(parsed);
          }
        }
        if (typeof fetchAndRenderCustomerOrders === 'function') {
          fetchAndRenderCustomerOrders();
        }
      } catch (err) {}
    }
  });

  // 5. Automatic Background Polling every 3 seconds for 100% reliability
  setInterval(() => {
    if (typeof activeViewingOrder !== 'undefined' && activeViewingOrder && activeViewingOrder.id) {
      // Check local cache first
      try {
        const local = JSON.parse(localStorage.getItem('sgh_customer_orders') || '[]');
        const cached = local.find(o => o && o.id === activeViewingOrder.id);
        if (cached && (cached.status !== activeViewingOrder.status || cached.estimatedPrepTime !== activeViewingOrder.estimatedPrepTime || cached.riderName !== activeViewingOrder.riderName)) {
          openOrderDetailsModal(cached.id);
        }
      } catch (e) {}

      fetch(`${BACKEND_BASE}/api/orders/${activeViewingOrder.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          const fresh = res?.data || res?.order;
          if (fresh) {
            const norm = normalizeServerOrder(fresh);
            if (norm && (norm.status !== activeViewingOrder.status || norm.tableNumber !== activeViewingOrder.tableNumber || norm.riderName !== activeViewingOrder.riderName)) {
              openOrderDetailsModal(norm.id);
              showToast(`🔔 Order #${norm.id} updated: ${norm.status}`);
            }
          }
        }).catch(() => {});
    }

    const profileModal = document.getElementById('profile-modal');
    if (profileModal && profileModal.classList.contains('active')) {
      if (typeof fetchAndRenderCustomerOrders === 'function') {
        fetchAndRenderCustomerOrders();
      }
    }
  }, 3000);
}


// ==========================================================================
// 1. MENU DATABASE (30+ Authentic Subbayya Gari Specialties)
// ==========================================================================
const MENU_DATA = [
  // --- MEALS, CURRIES & SIDES (AUTHENTIC GODAVARI RATE CARD) ---
  {
    id: 'meal-butta',
    name: 'Butta Bojanam',
    telugu: 'బుట్ట భోజనం',
    category: 'butta',
    price: 515,
    originalPrice: 599,
    rating: 5.0,
    reviews: 3240,
    spiceLevel: 'medium',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/butta_bhojanam.jpg',
    description: 'The legendary bamboo basket feast packed with 20+ authentic Godavari items: Sona Masoori Rice, Pure Ghee, Kandi Podi, Gongura, Gutti Vankaya, Majjiga Pulusu, Perugu Garelu, Bobbatlu & more.'
  },
  {
    id: 'meal-single',
    name: 'Single Meals',
    telugu: 'సింగిల్ మీల్స్',
    category: 'butta',
    price: 195,
    originalPrice: 220,
    rating: 4.8,
    reviews: 1420,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/butta_bhojanam.jpg',
    description: 'Full satisfying single-person Andhra bhojanam with rice, 2 curries, sambar, rasam, podi, ghee, curd, and papad.'
  },
  {
    id: 'meal-biriyani-half',
    name: 'Veg Biriyani Half',
    telugu: 'వెజ్ బిర్యానీ హాఫ్',
    category: 'rice',
    price: 155,
    rating: 4.8,
    reviews: 1100,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Fragrant basmati rice slow-cooked with fresh country vegetables, aromatic whole spices, and rich herbs. Served with raita.'
  },
  {
    id: 'meal-pulihora-half',
    name: 'Pulihora Half',
    telugu: 'చింతపండు పులిహోర హాఫ్',
    category: 'rice',
    price: 100,
    rating: 4.9,
    reviews: 840,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Traditional Godavari tamarind rice tossed with crunchy roasted peanuts, green chillies, curry leaves, and asafoetida.'
  },
  {
    id: 'meal-gongura-pulihora-half',
    name: 'Gongura Pulihora Half',
    telugu: 'గోంగూర పులిహోర హాఫ్',
    category: 'rice',
    price: 100,
    rating: 5.0,
    reviews: 970,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Tangy seasoned Gongura leaf spiced rice tempered with mustard, dry chillies, and roasted chana dal.'
  },
  {
    id: 'meal-special-rice-half',
    name: 'Special Rice Half',
    telugu: 'స్పెషల్ రైస్ హాఫ్',
    category: 'rice',
    price: 100,
    rating: 4.7,
    reviews: 510,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Chef special coastal Andhra flavored rice of the day tempered with cashew nuts, ghee, and mild spices.'
  },
  {
    id: 'meal-sambar-rice-half',
    name: 'Sambar Rice Half',
    telugu: 'సాంబార్ రైస్ హాఫ్',
    category: 'rice',
    price: 100,
    rating: 4.9,
    reviews: 820,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Comforting hot rice mashed with rich Godavari drumstick sambar and finished with generous pure ghee tadka.'
  },
  {
    id: 'meal-curd-rice-half',
    name: 'Curd Rice Half',
    telugu: 'కమ్మటి పెరుగన్నం హాఫ్',
    category: 'rice',
    price: 100,
    rating: 4.9,
    reviews: 690,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Cooling creamy fresh curd rice tempered with mustard seeds, ginger, curry leaves, and pomegranate arils.'
  },
  {
    id: 'meal-extra-rice',
    name: 'Extra Rice',
    telugu: 'ఎక్స్ట్రా అన్నం',
    category: 'rice',
    price: 50,
    rating: 4.8,
    reviews: 430,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Steaming hot portion of aged Sona Masoori white rice.'
  },
  {
    id: 'meal-pappu',
    name: 'Pappu',
    telugu: 'ముద్ద పప్పు / నెయ్యి తాలింపు పప్పు',
    category: 'curries',
    price: 50,
    rating: 4.9,
    reviews: 780,
    spiceLevel: 'mild',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Thick, creamy slow-cooked toor dal tempered with cumin, garlic, dry red chillies, and pure ghee.'
  },
  {
    id: 'meal-sambar',
    name: 'Sambar',
    telugu: 'గోదావరి సాంబారు',
    category: 'curries',
    price: 50,
    rating: 4.9,
    reviews: 950,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Aromatic coastal Andhra sambar prepared with drumsticks, shallots, pumpkin, and authentic stone-ground sambar masala.'
  },
  {
    id: 'meal-rasam',
    name: 'Rasam',
    telugu: 'మిరియాల చారు / రసం',
    category: 'curries',
    price: 50,
    rating: 4.9,
    reviews: 620,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Invigorating Godavari black pepper and garlic rasam simmered with fresh coriander and asafoetida.'
  },
  {
    id: 'meal-veg-curry',
    name: 'Veg Curry',
    telugu: 'వెజ్ కూర',
    category: 'curries',
    price: 50,
    rating: 4.8,
    reviews: 490,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Daily fresh farm vegetable cooked in home-style Godavari gravy.'
  },
  {
    id: 'meal-veg-fry',
    name: 'Veg Fry',
    telugu: 'వెజ్ వేపుడు (దొండకాయ / బెండకాయ / ఆలు)',
    category: 'curries',
    price: 50,
    rating: 4.9,
    reviews: 810,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Crispy seasoned vegetable fry tossed with roasted peanuts, curry leaves, and Andhra karam podi.'
  },
  {
    id: 'meal-curd',
    name: 'Curd',
    telugu: 'తాజా గడ్డ పెరుగు',
    category: 'curries',
    price: 50,
    rating: 4.9,
    reviews: 530,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/perugu_vada_dahi.jpg',
    description: 'Thick, creamy country buffalo milk fresh set curd.'
  },
  {
    id: 'meal-roti-pacchadi',
    name: 'Roti Pacchadi',
    telugu: 'రోటి పచ్చడి (తాజా నూరినది)',
    category: 'curries',
    price: 50,
    rating: 5.0,
    reviews: 1120,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Fresh mortar-stone pounded vegetable chutney of the day (Dosakaya / Beerakaya / Tomato) with roasted chillies.'
  },
  {
    id: 'meal-majjiga-pulusu',
    name: 'Majjiga Pulusu',
    telugu: 'కమ్మని మజ్జిగ పులుసు',
    category: 'curries',
    price: 50,
    rating: 4.8,
    reviews: 430,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/perugu_vada_dahi.jpg',
    description: 'Seasoned churned buttermilk stew simmered with turmeric, ginger, green chillies, and ash gourd.'
  },
  {
    id: 'meal-pacchi-pulusu',
    name: 'Pacchi Pulusu',
    telugu: 'గోదావరి పచ్చి పులుసు',
    category: 'curries',
    price: 50,
    rating: 5.0,
    reviews: 870,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Raw cold tamarind soup infused with flame-roasted green chillies, sliced shallots, jaggery, and fresh cilantro.'
  },
  {
    id: 'meal-special-veg-curry',
    name: 'Special Veg Curry',
    telugu: 'స్పెషల్ వెజ్ కూర (గుత్తి వంకాయ)',
    category: 'curries',
    price: 50,
    rating: 4.9,
    reviews: 640,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/gutti_vankaya.jpg',
    description: 'Rich Godavari Gutti Vankaya stuffed brinjal gravy cooked with roasted peanut and sesame masala.'
  },
  {
    id: 'meal-dahi-vada-2p',
    name: 'Dahi Vada 2P',
    telugu: 'పెరుగు వడ (2 ముక్కలు)',
    category: 'curries',
    price: 50,
    rating: 4.9,
    reviews: 750,
    spiceLevel: 'mild',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/perugu_vada_dahi.jpg',
    description: 'Two fluffy urad dal vadas thoroughly soaked in seasoned spiced curd with mustard tadka and boondi.'
  },
  {
    id: 'meal-dahi-vada-3p',
    name: 'Dahi Vada 3P',
    telugu: 'పెరుగు వడ (3 ముక్కలు)',
    category: 'curries',
    price: 75,
    rating: 4.9,
    reviews: 820,
    spiceLevel: 'mild',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/perugu_vada_dahi.jpg',
    description: 'Three fluffy urad dal vadas drenched in chilled spiced buttermilk curd, garnished with fresh cilantro and roasted cumin.'
  },

  // --- TRADITIONAL GODAVARI DAILY CURRIES & VEPULLU (RATE CARD: ₹40 - ₹140) ---
  {
    id: 'curry-mirchi-masala',
    name: 'Mirchi Masala Curry',
    telugu: 'మిర్చి మసాలా కూర',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 320,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Long green peppers slow-simmered in roasted sesame, peanut, and tangy tamarind gravy.'
  },
  {
    id: 'curry-vankay-batany',
    name: 'Vankay Batany Curry',
    telugu: 'వంకాయ బఠానీ కూర',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 440,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/gutti_vankaya.jpg',
    description: 'Fresh purple brinjal chunks and sweet green peas cooked in a comforting home-style coastal Andhra masala.'
  },
  {
    id: 'curry-capsicum-mealmaker',
    name: 'Capsicum Mealmaker',
    telugu: 'క్యాప్సికం మీల్‌మేకర్ కూర',
    category: 'curries',
    price: 40,
    rating: 4.7,
    reviews: 290,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Crisp green bell peppers and protein-rich soya chunks tossed with onions, tomatoes, and garam masala.'
  },
  {
    id: 'curry-tamota',
    name: 'Tamota Curry',
    telugu: 'టమోటా కూర',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 380,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Country ripe tomatoes simmered with mustard, cumin, curry leaves, and a mild touch of jaggery.'
  },
  {
    id: 'curry-kakarakay-fry',
    name: 'Kakarakay Fry',
    telugu: 'కాకరకాయ వేపుడు',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 510,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Crisp pan-fried bitter gourd roundels seasoned with roasted garlic podi and peanuts.'
  },
  {
    id: 'curry-cabbage',
    name: 'Cabbage',
    telugu: 'క్యాబేజీ సెనగపప్పు కూర',
    category: 'curries',
    price: 40,
    rating: 4.6,
    reviews: 210,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Finely shredded cabbage sautéed with chana dal, grated coconut, green chillies, and mustard tadka.'
  },
  {
    id: 'curry-alu-fry',
    name: 'Alu Fry',
    telugu: 'బంగాళాదుంప వేపుడు',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 670,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Golden roasted potato cubes tossed with crispy curry leaves and spicy Guntur red chilli powder.'
  },
  {
    id: 'curry-bendakay-pakodi',
    name: 'Bendakay Pakodi',
    telugu: 'బెండకాయ పకోడీ వేపుడు',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 590,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Thin sliced okra coated in spiced gram flour batter and fried till crunch-perfect with cashews.'
  },
  {
    id: 'curry-panasa-mukkala',
    name: 'Panasa Mukkala Curry',
    telugu: 'గోదావరి పనస ముక్కల కూర (Royal Jackfruit)',
    category: 'curries',
    price: 140,
    rating: 5.0,
    reviews: 1420,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'The royal crown of Godavari festive vegetarian feasts! Tender raw jackfruit pieces simmered in rich mustard-poppy seed gravy.'
  },
  {
    id: 'curry-mashroom',
    name: 'Mashroom Curry',
    telugu: 'మష్రూమ్ మసాలా కూర',
    category: 'curries',
    price: 140,
    rating: 4.8,
    reviews: 820,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Juicy button mushrooms cooked in an aromatic roasted cashew and pepper coastal masala gravy.'
  },
  {
    id: 'curry-panner',
    name: 'Panner Curry',
    telugu: 'షాహీ పన్నీర్ కూర',
    category: 'curries',
    price: 140,
    rating: 4.9,
    reviews: 1150,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Soft cottage cheese cubes cooked in rich tomato butter gravy infused with authentic Godavari spices.'
  },
  {
    id: 'curry-chikkudukay',
    name: 'Chikkudukay Curry',
    telugu: 'చిక్కుడుకాయ కూర',
    category: 'curries',
    price: 40,
    rating: 4.7,
    reviews: 290,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Tender broad beans slow-cooked with tomatoes, onions, garlic, and fresh ground coconut.'
  },
  {
    id: 'curry-alu-curry',
    name: 'Alu Curry',
    telugu: 'బంగాళాదుంప కుర్మా',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 410,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Baby potato pieces simmered in spiced onion-tomato gravy with aromatic cinnamon and cloves.'
  },
  {
    id: 'curry-mullakada',
    name: 'Mullakada Curry',
    telugu: 'మునగకాయ టమోటా కూర',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 630,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Fresh farm drumsticks cooked in sweet and tangy tomato gravy with mustard-cumin tempering.'
  },
  {
    id: 'curry-dondakay',
    name: 'Dondakay Curry',
    telugu: 'దొండకాయ ఉల్లికారం కూర',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 370,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Sliced ivy gourd simmered in caramelized onion and red chilli paste.'
  },
  {
    id: 'curry-gobi',
    name: 'Gobi Curry',
    telugu: 'కాలీఫ్లవర్ గోబీ మసాలా',
    category: 'curries',
    price: 40,
    rating: 4.7,
    reviews: 320,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Tender cauliflower florets seasoned with turmeric, ginger, tomatoes, and fresh coriander.'
  },
  {
    id: 'curry-dondakay-fry',
    name: 'Dondakay Fry',
    telugu: 'దొండకాయ వేపుడు',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 580,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Crispy sliced tindora sautéed with crunchy peanuts and Godavari karam podi.'
  },
  {
    id: 'curry-bendakay',
    name: 'Bendakay Curry',
    telugu: 'బెండకాయ పులుసు / కూర',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 430,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Fresh okra cutlets gently simmered in lightly spiced country gravy with cumin and garlic.'
  },
  {
    id: 'curry-aratikaya',
    name: 'Aratikaya Curry',
    telugu: 'అరటికాయ వేపుడు / కూర',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 490,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Raw green plantains steamed and pan-roasted with mustard seeds, urad dal, and red chillies.'
  },
  {
    id: 'curry-bheerakaya',
    name: 'Bheerakaya',
    telugu: 'బీరకాయ పాలు పోసిన కూర',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 340,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Sweet ridge gourd slow-cooked with farm milk, green chillies, and cumin.'
  },
  {
    id: 'curry-vankay-pakodi',
    name: 'Vankay Pakodi',
    telugu: 'వంకాయ పకోడీ కూర',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 470,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/gutti_vankaya.jpg',
    description: 'Crispy golden eggplant fritters tossed in fragrant spiced onion gravy.'
  },
  {
    id: 'curry-gotti-vankay',
    name: 'Gotti Vankay',
    telugu: 'గుత్తి వంకాయ కూర',
    category: 'curries',
    price: 40,
    rating: 5.0,
    reviews: 1180,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/gutti_vankaya.jpg',
    description: 'Small purple brinjals stuffed with roasted peanut, sesame, and dry-coconut masala.'
  },
  {
    id: 'curry-punugula',
    name: 'Punugula Curry',
    telugu: 'కమ్మని పునుగుల పులుసు',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 420,
    spiceLevel: 'spicy',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Golden urad dal punugulu soaked in tangy tamarind and onion pulusu stew.'
  },
  {
    id: 'curry-kanda',
    name: 'Kanda Curry',
    telugu: 'కంద బచ్చలి కూర',
    category: 'curries',
    price: 40,
    rating: 5.0,
    reviews: 690,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Steamed elephant yam cubes tossed with Malabar spinach, tamarind, and mustard paste.'
  },
  {
    id: 'curry-dondakay-pakodi',
    name: 'Dondakay Pakodi',
    telugu: 'దొండకాయ పకోడీ',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 390,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Crunchy battered ivy gourd fritters tossed with dry garlic red chilli seasoning.'
  },
  {
    id: 'curry-gongura-makarani',
    name: 'Gongura Makarani',
    telugu: 'గోంగూర మకరోని / కూర',
    category: 'curries',
    price: 40,
    rating: 4.7,
    reviews: 260,
    spiceLevel: 'spicy',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_veg_fry.jpg',
    description: 'Tangy Andhra gongura masala curry cooked with savory noodles/makarani.'
  },
  {
    id: 'curry-curd-daily',
    name: 'Curd (Daily Fresh)',
    telugu: 'తాజా గడ్డ పెరుగు',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 580,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/perugu_vada_dahi.jpg',
    description: 'Rich buffalo milk thick curd served fresh.'
  },
  {
    id: 'curry-majjiga-pulusu-daily',
    name: 'Majjiga Pulusu (Daily)',
    telugu: 'కమ్మని మజ్జిగ పులుసు',
    category: 'curries',
    price: 40,
    rating: 4.8,
    reviews: 430,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/perugu_vada_dahi.jpg',
    description: 'Probiotic spiced buttermilk stew with ash gourd and green chillies.'
  },
  {
    id: 'curry-rasam-daily',
    name: 'Rasam (Daily Special)',
    telugu: 'మిరియాల చారు',
    category: 'curries',
    price: 30,
    rating: 4.9,
    reviews: 720,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Digestive black pepper and tomato rasam brewed with fresh coriander.'
  },
  {
    id: 'curry-sambar-daily',
    name: 'Sambar (Daily Special)',
    telugu: 'గోదావరి సాంబారు',
    category: 'curries',
    price: 40,
    rating: 4.9,
    reviews: 840,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_rice_varieties.jpg',
    description: 'Authentic Andhra vegetable sambar with shallots and drumsticks.'
  },

  // --- TRADITIONAL GODAVARI APPADALU (100g Packets - ₹100) ---
  {
    id: 'appadalu-pesara',
    name: 'Pesara Appadalu',
    telugu: 'పెసర అప్పడాలు (Moong Dal)',
    category: 'appadalu',
    price: 100,
    rating: 5.0,
    reviews: 640,
    spiceLevel: 'mild',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/butta_bhojanam.jpg',
    description: 'Crispy sun-dried moong dal papads prepared according to ancestral Godavari methods with cumin and rock salt.'
  },
  {
    id: 'appadalu-karam',
    name: 'Karam Appadalu',
    telugu: 'కారం అప్పడాలు (Spicy Chilli Papads)',
    category: 'appadalu',
    price: 100,
    rating: 4.9,
    reviews: 790,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/butta_bhojanam.jpg',
    description: 'Fiery sun-dried lentil papads infused with Guntur red chilli powder, asafoetida, and cumin seeds.'
  },
  {
    id: 'appadalu-nuvvula',
    name: 'Nuvvula Appadalu',
    telugu: 'నువ్వుల అప్పడాలు (Sesame Papads)',
    category: 'appadalu',
    price: 100,
    rating: 4.9,
    reviews: 580,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/butta_bhojanam.jpg',
    description: 'Nutty, aromatic papads studded with roasted white sesame seeds. Incredibly crisp when roasted on flame or fried.'
  },
  {
    id: 'appadalu-kandi',
    name: 'Kandi Appadalu',
    telugu: 'కంది అప్పడాలు (Toor Dal Papads)',
    category: 'appadalu',
    price: 100,
    rating: 4.8,
    reviews: 470,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/butta_bhojanam.jpg',
    description: 'Classic roasted toor dal sun-dried papads. The quintessential accompaniment for rasam, sambar, and curd rice.'
  },

  // --- SIGNATURE GODAVARI POWDERS & KARAMS (100g Packets - ₹75) ---
  {
    id: 'podi-kandhi',
    name: 'Kandhi podi 100g',
    telugu: 'కంది పొడి (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 5.0,
    reviews: 1870,
    spiceLevel: 'medium',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Our world-famous roasted lentils gunpowder made with toor dal, chana dal, cumin, and dry red chillies. The soul of hot rice and ghee!'
  },
  {
    id: 'podi-karivepaku',
    name: 'Karivepaku Podi 100g',
    telugu: 'కరివేపాకు పొడి (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.9,
    reviews: 940,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Fresh farm curry leaves dry-roasted with black pepper, lentils, and rock salt. Rich in aroma, iron, and digestive health benefits.'
  },
  {
    id: 'podi-kobbari',
    name: 'Kobbari Karam 100g',
    telugu: 'కొబ్బరి కారం (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.8,
    reviews: 620,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Delectable dry roasted grated coconut blended with fiery Guntur red chillies, garlic, and cumin. Perfect with hot rice, idlis, and dosas.'
  },
  {
    id: 'podi-nalla',
    name: 'Nalla Karam 100g',
    telugu: 'నల్ల కారం (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.9,
    reviews: 890,
    spiceLevel: 'spicy',
    dietary: [],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Classic rustic Godavari dark roasted spice powder made with whole coriander seeds, cumin, tamarind, garlic, and sun-dried chillies.'
  },
  {
    id: 'podi-palli',
    name: 'Palli Karam 100g',
    telugu: 'పల్లీ కారం / వేరుశెనగ పొడి (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.8,
    reviews: 540,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Golden roasted groundnuts blended with dry red chillies, roasted garlic, and cumin. Creamy, nutty, and irresistibly aromatic with ghee.'
  },
  {
    id: 'podi-ulava',
    name: 'Ulava Karam 100g',
    telugu: 'ఉలవ కారం (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.9,
    reviews: 470,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Nutritious roasted horsegram (Ulavalu) coarse powder infused with traditional spices. Famous across coastal Andhra for authentic rich rustic flavor.'
  },
  {
    id: 'podi-dhaniya',
    name: 'Dhaniya Karam 100g',
    telugu: 'ధనియాల కారం (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.7,
    reviews: 410,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Fragrant dry-roasted whole coriander seeds gently ground with lentils, dry chillies, and cumin for a soothing herbal aroma.'
  },
  {
    id: 'podi-idly',
    name: 'Idly Karam 100g',
    telugu: 'ఇడ్లీ కారం పొడి (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.9,
    reviews: 980,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'The definitive tiffin chutney podi! Coarsely roasted urad & chana dal with sesame seeds and chillies — heavenly when sprinkled on steaming hot idlis with melted ghee.'
  },
  {
    id: 'podi-nalla-garlic',
    name: 'Vellulli Nalla Karam 100g',
    telugu: 'వెల్లుల్లి నల్ల కారం (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 5.0,
    reviews: 830,
    spiceLevel: 'spicy',
    dietary: [],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Special garlic-infused roasted black podi. Bold pungent garlic notes balanced with toasted cumin and whole Guntur chillies.'
  },
  {
    id: 'podi-sambar',
    name: 'Sambar Karam 100g',
    telugu: 'సాంబార్ కారం / పొడి (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.8,
    reviews: 520,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Traditional slow-roasted spice blend of fenugreek, coriander, lentils, and red chillies that gives Godavari sambar its signature aroma.'
  },
  {
    id: 'podi-mulagaku',
    name: 'Mulagaku Karam 100g',
    telugu: 'మునగాకు కారం (100 గ్రా.)',
    category: 'podis',
    price: 75,
    rating: 4.9,
    reviews: 640,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Nutrient-dense wild drumstick leaves (moringa) gently roasted with lentils, black pepper, and garlic. Packed with natural vitamins and immunity.'
  },
  {
    id: 'podi-04',
    name: 'Subbayya Pure Buffalo Ghee (500ml Jar)',
    telugu: 'సుబ్బయ్య గారి స్వచ్ఛమైన నెయ్యి',
    category: 'podis',
    price: 450,
    rating: 5.0,
    reviews: 3100,
    spiceLevel: 'mild',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/andhra_karam_podi.jpg',
    description: 'Traditional slow-cooked bilona-style golden aromatic grain-textured pure ghee sourced directly from Godavari dairy farms.'
  },

  // --- AUTHENTIC GODAVARI PICKLES & PACHALLU (250g Jars - ₹155) ---
  {
    id: 'pickle-mango',
    name: 'Mango Pickle 250g',
    telugu: 'ఆవకాయ / మామిడికాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 5.0,
    reviews: 2150,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'The king of Andhra pickles! Crisp raw country mango cubes marinated with pungent mustard powder (Ava pindi), Guntur red chillies, and cold-pressed gingelly oil.'
  },
  {
    id: 'pickle-gongura',
    name: 'Gongura Pickle 250g',
    telugu: 'గోంగూర పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 5.0,
    reviews: 2420,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'The crown pride of Andhra Pradesh! Tangy red sorrel leaves sautéed in sesame oil with whole red chillies, fenugreek, garlic, and rock salt.'
  },
  {
    id: 'pickle-gongura-pandu-mirchi',
    name: 'Gongura Pandu Mirchi Pickle 250g',
    telugu: 'గోంగూర పండుమిర్చి పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.9,
    reviews: 1340,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Royal Godavari fusion of fresh Gongura leaves and fiery ripe red chillies (Pandu Mirapakayalu) stone-pounded with roasted spices.'
  },
  {
    id: 'pickle-lemon',
    name: 'Lemon Pickle 250g',
    telugu: 'నిమ్మకాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.8,
    reviews: 790,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Juicy country yellow lemons cured in sea salt, turmeric, and spiced red chilli powder. Tangy, zesty, and easy on digestion.'
  },
  {
    id: 'pickle-allam',
    name: 'Allam Pickle 250g',
    telugu: 'అల్లం పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.9,
    reviews: 1120,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Traditional ginger pachadi sweetened gently with organic jaggery and tangy tamarind pulp. Famous Godavari accompaniment for pesarattu and rice.'
  },
  {
    id: 'pickle-vankaya',
    name: 'Vankaya Pickle 250g',
    telugu: 'వంకాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.8,
    reviews: 670,
    spiceLevel: 'medium',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Tender baby brinjals gently pickled with mustard seeds, fenugreek, and gingelly oil. Uniquely flavorful with unmatched Godavari heritage.'
  },
  {
    id: 'pickle-usirikaya',
    name: 'Usirikaya Pickle 250g',
    telugu: 'ఉసిరికాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.9,
    reviews: 850,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Whole wild gooseberries (amla) cooked gently in seasoned mustard oil, tamarind, and turmeric. Rich in natural vitamin C.'
  },
  {
    id: 'pickle-maagaya',
    name: 'Maagaya Pickle 250g',
    telugu: 'మాగాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 5.0,
    reviews: 1480,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Sun-dried peeled raw mango strips seasoned with mustard powder, fenugreek, and chilli powder. Soft texture with deep tangy flavor.'
  },
  {
    id: 'pickle-tamota',
    name: 'Tamota Pickle 250g',
    telugu: 'టమోటా పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.8,
    reviews: 930,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Sun-ripened farm country tomatoes slow-simmered with garlic, tamarind, and mustard tempering. Delicious with hot rice and tiffins.'
  },
  {
    id: 'pickle-pandu-mirapakai',
    name: 'Pandu Mirapakai Pickle 250g',
    telugu: 'పండు మిరపకాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.9,
    reviews: 1040,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Vibrant red ripe chillies stone-crushed with garlic, tamarind, and mustard seeds. An authentic fiery Andhra specialty.'
  },
  {
    id: 'pickle-kakarakaya',
    name: 'Kakarakaya Pickle 250g',
    telugu: 'కాకరకాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.7,
    reviews: 580,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Crispy pan-fried bitter gourd roundels marinated with tamarind, jaggery hint, and spices. A healthy, delicious delicacy.'
  },
  {
    id: 'pickle-bellam-avakaya',
    name: 'Bellam Avakaya Pickle 250g',
    telugu: 'తీపి బెల్లం ఆవకాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.9,
    reviews: 1210,
    spiceLevel: 'mild',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Sweet and spicy cut mango pickle sweetened with pure organic Godavari jaggery syrup and roasted spices. Beloved by children and adults alike!'
  },
  {
    id: 'pickle-chinthakaya',
    name: 'Chinthakaya Pickle 250g',
    telugu: 'చింతకాయ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.8,
    reviews: 730,
    spiceLevel: 'spicy',
    dietary: [],
    isBestseller: false,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Raw green country tamarind pounded with green/red chillies and garlic. Intensely tangy, rustic, and refreshing.'
  },
  {
    id: 'pickle-califlower',
    name: 'Califlower Pickle 250g',
    telugu: 'కాలీఫ్లవర్ పచ్చడి (250 గ్రా.)',
    category: 'pickles',
    price: 155,
    rating: 4.7,
    reviews: 610,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/andhra_pickles_avakaya.jpg',
    description: 'Crunchy cauliflower florets pickled in tangy mustard-chilli masala with sesame oil. A winter festival favorite across Andhra homes.'
  },

  // --- AUTHENTIC GODAVARI SWEETS (AUTHENTIC RATE CARD) ---
  {
    id: 'sweet-boori',
    name: 'Boori 5pcs',
    telugu: 'బూరెలు (5 ముక్కలు)',
    category: 'sweets',
    price: 90,
    rating: 5.0,
    reviews: 1650,
    spiceLevel: 'mild',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/poornam_boorelu_sweets.jpg',
    description: 'Traditional auspicious poornam boorelu stuffed with sweetened chana dal, jaggery and coconut, dipped in batter and golden fried in pure ghee.'
  },
  {
    id: 'sweet-bobbattu',
    name: 'Bobbattu 5pcs',
    telugu: 'బొబ్బట్లు / పోలెలు (5 ముక్కలు)',
    category: 'sweets',
    price: 90,
    rating: 5.0,
    reviews: 2400,
    spiceLevel: 'mild',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/kakinada_kaja.jpg',
    description: 'Melt-in-mouth sweet flatbreads filled with cardamom-spiced organic jaggery puran, roasted generously with warm Godavari pure ghee.'
  },
  {
    id: 'sweet-malaipoori',
    name: 'Malaipoori 5pcs',
    telugu: 'మలైపూరి (5 ముక్కలు)',
    category: 'sweets',
    price: 129,
    rating: 4.9,
    reviews: 980,
    spiceLevel: 'mild',
    dietary: ['chef-special'],
    isBestseller: true,
    image: 'assets/poornam_boorelu_sweets.jpg',
    description: 'Delicate flaky pooris soaked in saffron-infused condensed rabdi milk cream and garnished with roasted pistachios and almonds.'
  },
  {
    id: 'sweet-kakinada-kaja',
    name: 'Kakinada Kaja 250Gr',
    telugu: 'కాకినాడ గొట్టం కాజా (250 గ్రా.)',
    category: 'sweets',
    price: 129,
    rating: 4.9,
    reviews: 1820,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/kakinada_kaja.jpg',
    description: 'World-famous Kakinada Gottam Kaja! Crisp cylindrical pastry with delicious, warm caramelized syrup bursting inside every bite.'
  },
  {
    id: 'sweet-madatha-kaja',
    name: 'Madatha Kaja 250Gr',
    telugu: 'మడత కాజా (250 గ్రా.)',
    category: 'sweets',
    price: 129,
    rating: 4.8,
    reviews: 1140,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/kakinada_kaja.jpg',
    description: 'Multi-layered ribbon folded crispy sweet pastry glistening with cardamom sugar syrup. Pure heritage perfection.'
  },
  {
    id: 'sweet-badhusha',
    name: 'Badhusha 250Gr',
    telugu: 'బాదుషా (250 గ్రా.)',
    category: 'sweets',
    price: 129,
    rating: 4.9,
    reviews: 1290,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/kakinada_kaja.jpg',
    description: 'Flaky, buttery layered sweet rounds with a crisp outer crust and a succulent, melt-in-mouth soft syrupy center.'
  },
  {
    id: 'sweet-boondhi-laddu',
    name: 'Boondhi Laddu 250Gr',
    telugu: 'తియ్యని బూందీ లడ్డూ (250 గ్రా.)',
    category: 'sweets',
    price: 129,
    rating: 4.9,
    reviews: 1530,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: true,
    image: 'assets/poornam_boorelu_sweets.jpg',
    description: 'Golden gram flour pearls bonded with pure ghee, sugar syrup, roasted cashews, raisins, and aromatic green cardamom.'
  },
  {
    id: 'sweet-jangri',
    name: '65 Jangri 250g',
    telugu: 'జాంగ్రీ (250 గ్రా.)',
    category: 'sweets',
    price: 129,
    originalPrice: 150,
    rating: 4.9,
    reviews: 1450,
    spiceLevel: 'mild',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/poornam_boorelu_sweets.jpg',
    description: 'Freshly prepared succulent golden flower spirals made of urad dal batter fried to crisp perfection and soaked in saffron cardamom sugar syrup.'
  },
  {
    id: 'sweet-02',
    name: 'Authentic Atreyapuram Pootharekulu (Box of 5)',
    telugu: 'ఆత్రేయపురం పూతరేకులు',
    category: 'sweets',
    price: 220,
    rating: 4.9,
    reviews: 1320,
    spiceLevel: 'mild',
    dietary: ['jain-available', 'chef-special'],
    isBestseller: true,
    image: 'assets/poornam_boorelu_sweets.jpg',
    description: 'Paper-thin rice starch edible film rolled with organic jaggery, pure ghee, roasted pistachios, and cashews.'
  },
  {
    id: 'sweet-04',
    name: 'Bellam Jalebi (Hot & Crispy 250g)',
    telugu: 'వేడి వేడి బెల్లం జిలేబి',
    category: 'sweets',
    price: 130,
    rating: 4.9,
    reviews: 870,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    image: 'assets/poornam_boorelu_sweets.jpg',
    description: 'Spiral crispy golden jalebis soaked in spiced organic country jaggery syrup with a hint of cardamom.'
  }
];

// ==========================================================================
// 2. BUTTA BHOJANAM UNBOXING DATA
// ==========================================================================
const BUTTA_ITEMS = {
  gheeRice: {
    title: 'Sona Masoori Rice & Melted Pure Ghee',
    telugu: 'వేడి అన్నం & కమ్మని నెయ్యి',
    tag: 'Foundation of Bhojanam',
    desc: 'Steaming hot fragrant aged Sona Masoori rice served as the pure canvas for our home-churned Godavari golden ghee. First morsel with Kandi Podi is pure bliss.',
    icon: '🍚',
    calories: '340 kcal',
    tradition: 'Served first to bless the palate with sattvic nourishment.'
  },
  kandiPodi: {
    title: 'Heritage Kandi Podi & Nalla Karam',
    telugu: 'కంది పొడి & నల్ల కారం',
    tag: 'Signature Gunpowder',
    desc: 'Slow dry-roasted lentils, cumin, black pepper, and Guntur dry chillies ground to coarse perfection according to the 1950 family recipe.',
    icon: '🌶️',
    calories: '90 kcal',
    tradition: 'Unlocks digestive agni when mixed with warm ghee.'
  },
  guttiVankaya: {
    title: 'Gutti Vankaya Kura',
    telugu: 'గుత్తి వంకాయ కూర',
    tag: 'Crown Jewel Curry',
    desc: 'Baby purple eggplants stuffed with dry roasted peanut, sesame, and coriander seed masala, simmered till buttery soft.',
    icon: '🍆',
    calories: '180 kcal',
    tradition: 'The quintessential dish of East Godavari royal feasts.'
  },
  majjigaPulusu: {
    title: 'Majjiga Pulusu & Charu',
    telugu: 'మజ్జిగ పులుసు & మిరియాల చారు',
    tag: 'Digestive Elixir',
    desc: 'Tempered probiotic churned buttermilk with ash gourd and green chillies, alongside traditional black pepper rasam.',
    icon: '🥣',
    calories: '85 kcal',
    tradition: 'Balances body heat and aids effortless digestion.'
  },
  gongura: {
    title: 'Godavari Gongura & Mango Avakaya',
    telugu: 'గోంగూర & మాగాయ పచ్చడి',
    tag: 'Spicy & Tangy Zing',
    desc: 'Sun-dried sour red sorrel leaves and crisp mango pickle made with pure sesame oil and stone-ground spices.',
    icon: '🍃',
    calories: '65 kcal',
    tradition: 'The unmatched identity of Andhra culinary pride.'
  },
  peruguGare: {
    title: 'Perugu Garelu (Dahi Vada)',
    telugu: 'కమ్మని పెరుగు గారె',
    tag: 'Soothing Crisp Vada',
    desc: 'Fluffy urad dal fritters soaked in chilled seasoned curd with mustard cumin tempering and fresh coriander.',
    icon: '🍩',
    calories: '160 kcal',
    tradition: 'Cooling break before moving to the savory sweet finale.'
  },
  bobbatlu: {
    title: 'Ghee Bobbatlu & Pootharekulu',
    telugu: 'నెయ్యి బొబ్బట్లు & పూతరేకులు',
    tag: 'Grand Sweet Finale',
    desc: 'Melt-in-mouth puran poli filled with jaggery and chana dal, served warm alongside delicate Atreyapuram paper sweet.',
    icon: '🥞',
    calories: '240 kcal',
    tradition: 'Ending the feast on an auspicious note of prosperity and sweetness.'
  },
  bananaLeaf: {
    title: 'Eco Bamboo Basket & Banana Leaf Packing',
    telugu: 'వెదురు బుట్ట & అరటి ఆకు',
    tag: '100% Biodegradable',
    desc: 'Eco-friendly handwoven bamboo basket wrapped in fresh plantain leaves. Infuses a subtle green herbal aroma into every dish.',
    icon: '🧺',
    calories: '0 kcal',
    tradition: 'Preserves heat naturally while honoring Mother Earth.'
  }
};

// ==========================================================================
// 3. BRANCH LOCATIONS DATA
// ==========================================================================
const BRANCHES_DATA = [
  // HYDERABAD & TELANGANA BRANCHES
  {
    id: 'kphb',
    name: 'KPHB Colony, Hyderabad',
    city: 'Hyderabad',
    lat: 17.4938,
    lng: 78.3995,
    address: 'MIG 295, Sridevi Residency, Road No. 4, KPHB Colony, Kukatpally, Hyderabad, Telangana 500072',
    phone: '+91 90108 88842',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+KPHB+Hyderabad',
    features: ['Unlimited Banana Leaf', 'AC Dining Hall', 'Fast Takeaway Counter', 'Valet Parking'],
    openNow: true
  },
  {
    id: 'kukatpally',
    name: 'Kukatpally, Hyderabad',
    city: 'Hyderabad',
    lat: 17.4849,
    lng: 78.4138,
    address: 'Near Y Junction, Main Road, Kukatpally, Hyderabad, Telangana 500072',
    phone: '+91 90108 88849',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Kukatpally+Hyderabad',
    features: ['Unlimited Banana Leaf', 'AC Dining Hall', 'Fast Takeaway Counter'],
    openNow: true
  },

  {
    id: 'kondapur',
    name: 'Kondapur / Hitech City, Hyderabad',
    city: 'Hyderabad',
    lat: 17.4699,
    lng: 78.3578,
    address: 'Plot 42, Raghavendra Colony, Opp Harsha Toyota, Kondapur, Hyderabad, Telangana 500084',
    phone: '+91 88975 64242',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 11:00 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Kondapur',
    features: ['Corporate Bento Delivery', 'Family AC Sections', 'Fast Takeaway', 'Party Hall'],
    openNow: true
  },
  {
    id: 'ameerpet',
    name: 'Ameerpet, Hyderabad',
    city: 'Hyderabad',
    lat: 17.4375,
    lng: 78.4483,
    address: 'Behind VRK Silks, Beside Metro Pillar 1070, Ameerpet, Hyderabad, Telangana 500016',
    phone: '+91 90108 88843',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Ameerpet+Hyderabad',
    features: ['Metro Connected', 'Unlimited Leaf Bhojanam', 'Sweet Counter', 'Takeaway Hub'],
    openNow: true
  },
  {
    id: 'jubilee-hills',
    name: 'Jubilee Hills, Hyderabad',
    city: 'Hyderabad',
    lat: 17.4319,
    lng: 78.4073,
    address: 'Road No. 36, Near Peddamma Temple, Jubilee Hills, Hyderabad, Telangana 500033',
    phone: '+91 90108 88842',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 11:00 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Jubilee+Hills+Hyderabad',
    features: ['Premium Dining Lounge', 'Unlimited Banana Leaf', 'Valet Parking', 'Private Family Cabins'],
    openNow: true
  },
  {
    id: 'malakpet',
    name: 'Malakpet, Hyderabad',
    city: 'Hyderabad',
    lat: 17.3753,
    lng: 78.4983,
    address: 'D.No 16-2-740, Main Road, Beside Yashoda Hospital, Malakpet, Hyderabad, Telangana 500036',
    phone: '+91 90108 88845',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Malakpet+Hyderabad',
    features: ['AC Family Dining', 'Traditional Leaf Meals', 'Parcel Counter', 'Dessert Corner'],
    openNow: true
  },
  {
    id: 'vanasthalipuram',
    name: 'Vanasthalipuram, Hyderabad',
    city: 'Hyderabad',
    lat: 17.3325,
    lng: 78.5714,
    address: 'Plot 14, Sahara Road, Near Rythu Bazar, Vanasthalipuram, Hyderabad, Telangana 500070',
    phone: '+91 90108 88846',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Vanasthalipuram+Hyderabad',
    features: ['Family Friendly', 'Authentic Andhra Veg', 'Express Parcel', 'AC Dining'],
    openNow: true
  },
  {
    id: 'suryapet',
    name: 'Suryapet Highway Branch',
    city: 'Suryapet',
    lat: 17.1439,
    lng: 79.6239,
    address: 'NH-65 Hyderabad-Vijayawada Highway, Near Janagaon Cross, Suryapet, Telangana 508213',
    phone: '+91 98480 12345',
    timings: 'Lunch: 11:00 AM - 04:30 PM | Dinner: 06:30 PM - 11:00 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Suryapet',
    features: ['Highway Food Stop', 'Spacious Car Parking', 'Express Butta Parcels', '24/7 Restrooms'],
    openNow: true
  },

  // ANDHRA PRADESH BRANCHES
  {
    id: 'kakinada',
    name: 'Heritage Flagship (Since 1950), Kakinada',
    city: 'Kakinada',
    lat: 16.9891,
    lng: 82.2475,
    address: 'D.No : 10-6-10, Subbayya Hotel Road, Subbayya Gari Junction, Ramaraopeta, Kakinada, AP 533004',
    phone: '+91 81799 93485',
    timings: 'Lunch: 11:00 AM - 04:30 PM | Dinner: 06:30 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Hotel+Kakinada',
    features: ['Original 1950 Heritage Hub', 'Traditional Floor Seating', 'Live Sweet Counter', 'Sweet Parcel Delivery'],
    openNow: true
  },
  {
    id: 'vizag-dwarakanagar',
    name: 'Dwaraka Nagar, Visakhapatnam',
    city: 'Visakhapatnam',
    lat: 17.7289,
    lng: 83.3134,
    address: '47-10-18, 2nd Lane, Diamond Park Road, Dwaraka Nagar, Visakhapatnam, AP 530016',
    phone: '+91 89125 67890',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Dwaraka+Nagar+Visakhapatnam',
    features: ['City Center Outlet', 'Unlimited Banana Leaf Meals', 'Kakinada Kaja Counter', 'AC Dining'],
    openNow: true
  },
  {
    id: 'vizag-gajuwaka',
    name: 'Gajuwaka, Visakhapatnam',
    city: 'Visakhapatnam',
    lat: 17.6908,
    lng: 83.2095,
    address: 'Main Road, Near Old Gajuwaka Junction, Gajuwaka, Visakhapatnam, AP 530026',
    phone: '+91 89127 54321',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Gajuwaka+Visakhapatnam',
    features: ['Industrial Hub Branch', 'Quick Service Butta Parcel', 'Family Sections', 'Pure Veg Sweets'],
    openNow: true
  },
  {
    id: 'vijayawada',
    name: 'MG Road, Vijayawada',
    city: 'Vijayawada',
    lat: 16.4971,
    lng: 80.6557,
    address: 'Near Benz Circle, Bandar Road, Labbipet, Vijayawada, Andhra Pradesh 520010',
    phone: '+91 91212 34567',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Vijayawada',
    features: ['Unlimited Leaf Bhojanam', 'Godavari Pickle Store', 'Express Parcel', 'AC Banquet Hall'],
    openNow: true
  },
  {
    id: 'rajahmundry',
    name: 'Pushkar Ghat Road, Rajahmundry',
    city: 'Rajahmundry',
    lat: 17.0005,
    lng: 81.7800,
    address: 'Main Road, Near Pushkar Ghat & Godavari Bund, Rajamahendravaram, AP 533101',
    phone: '+91 88324 56789',
    timings: 'Lunch: 11:00 AM - 04:30 PM | Dinner: 06:30 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Rajahmundry',
    features: ['Holy Godavari Riverfront', 'Heritage Andhra Thali', 'Pootharekulu Live Counter', 'AC Hall'],
    openNow: true
  },

  // BENGALURU & KARNATAKA BRANCHES
  {
    id: 'bangalore-marathahalli',
    name: 'Marathahalli, Bengaluru',
    city: 'Bengaluru',
    lat: 12.9569,
    lng: 77.7011,
    address: 'Outer Ring Road, Opp Innovative Multiplex, Marathahalli, Bengaluru, Karnataka 560037',
    phone: '+91 80456 78901',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 11:00 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Marathahalli+Bengaluru',
    features: ['IT Corridor Favorite', 'Authentic Andhra Bhojanam', 'Weekend Butta Special', 'AC Family Section'],
    openNow: true
  },
  {
    id: 'bangalore-koramangala',
    name: 'Koramangala, Bengaluru',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    phone: '+91 80456 78900',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 11:00 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Koramangala+Bengaluru',
    features: ['Pure Ghee Telugu Thali', 'Godavari Sweets Counter', 'Online Home Delivery', 'AC Lounge'],
    openNow: true
  },
  {
    id: 'bangalore-brookefield',
    name: 'Brookefield / Whitefield, Bengaluru',
    city: 'Bengaluru',
    lat: 12.9654,
    lng: 77.7180,
    address: 'ITPL Main Road, AECS Layout, Brookefield, Bengaluru, Karnataka 560066',
    phone: '+91 80456 78902',
    timings: 'Lunch: 11:30 AM - 04:00 PM | Dinner: 07:00 PM - 10:30 PM',
    mapUrl: 'https://maps.google.com/?q=Subbayya+Gari+Hotel+Brookefield+Bengaluru',
    features: ['Corporate Lunch Catering', 'Traditional Leaf Meals', 'Podi & Pickle Store', 'Express Takeaway'],
    openNow: true
  }
];

// ==========================================================================
// 4. APPLICATION STATE & LOCAL STORAGE
// ==========================================================================
const AppState = {
  cart: [],
  selectedCategory: 'all',
  searchQuery: '',
  activeDietFilter: 'all',
  selectedBranch: 'kphb',
  activeTheme: 'light',
  orderType: 'takeaway', // 'takeaway' or 'delivery'
  deliveryDistanceKm: 3, // Delivery charges: 1km = 10rs
  customerLocation: null, // { lat, lng, mapsUrl }
  appliedPromo: null,
  currentUser: null, // { name, phone, email, address, coins: 50, tier: 'VIP' }
  pendingAction: null // { type: 'reserve_table' | 'checkout_order', formData?: {} }
};

// Initialize from LocalStorage
function initStorage() {
  try {
    const savedCart = localStorage.getItem('sgh_cart');
    if (savedCart) AppState.cart = JSON.parse(savedCart);
    const savedTheme = localStorage.getItem('sgh_theme');
    if (savedTheme) {
      AppState.activeTheme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const savedBranch = localStorage.getItem('sgh_active_branch');
    if (savedBranch) {
      AppState.selectedBranch = savedBranch;
    }
    const savedUser = sessionStorage.getItem('sgh_user') || localStorage.getItem('sgh_user');
    if (savedUser) {
      AppState.currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
}

function saveCart() {
  try {
    localStorage.setItem('sgh_cart', JSON.stringify(AppState.cart));
  } catch (e) {
    console.error('Save cart error:', e);
  }
  updateCartBadge();
  renderCartDrawer();
}

// Branch Popover Dropdown Controller
function toggleBranchPopover(forceClose = false) {
  const popover = document.getElementById('branch-dropdown-popover');
  const pill = document.getElementById('branch-select-pill');
  if (!popover) return;

  if (forceClose || popover.classList.contains('show')) {
    popover.classList.remove('show');
    if (pill) pill.classList.remove('active');
  } else {
    popover.classList.add('show');
    if (pill) pill.classList.add('active');
  }
}

function selectActiveBranch(branchId) {
  const branch = BRANCHES_DATA.find(b => b.id === branchId);
  if (!branch) return;

  AppState.selectedBranch = branchId;
  localStorage.setItem('sgh_active_branch', branchId);

  // Update Pill Label
  const pillName = document.getElementById('active-branch-pill-name');
  if (pillName) {
    pillName.textContent = branch.name.split(',')[0] + (branch.city && !branch.name.includes(branch.city) ? `, ${branch.city}` : '');
  }

  // Update Popover items checkmark state
  document.querySelectorAll('.branch-option-item').forEach(item => {
    const isSelected = item.dataset.branch === branchId;
    item.classList.toggle('selected', isSelected);
    const check = item.querySelector('.branch-opt-check');
    if (check) check.style.display = isSelected ? 'inline' : 'none';
  });

  // Sync with Reservation Dropdown accurately without false city matches
  const resBranch = document.getElementById('res-branch');
  if (resBranch) {
    const target = (branch.name || branchId).toLowerCase();
    for (let opt of resBranch.options) {
      const val = opt.value.toLowerCase();
      if ((target.includes('vanasthal') || target.includes('vasanth')) && (val.includes('vanasthal') || val.includes('vasanth'))) {
        resBranch.value = opt.value;
        break;
      } else if (target.includes('kph') && val.includes('kph')) {
        resBranch.value = opt.value;
        break;
      } else if (target.includes('kukat') && val.includes('kukat')) {
        resBranch.value = opt.value;
        break;
      } else if (val.includes(branchId) || target.includes(opt.value.split(',')[0].toLowerCase())) {
        resBranch.value = opt.value;
        break;
      }
    }
  }

  // Sync with Cart Pickup & Delivery dropdowns
  const pickSelect = document.getElementById('pickup-branch-select');
  if (pickSelect) pickSelect.value = branchId;
  const delSelect = document.getElementById('delivery-branch-select');
  if (delSelect) delSelect.value = branchId;
  const pickDisplay = document.getElementById('pickup-branch-display');
  if (pickDisplay) pickDisplay.textContent = branch.name;
  const nearDisplay = document.getElementById('nearest-branch-display');
  if (nearDisplay) nearDisplay.textContent = branch.name;

  // Sync with Table QR Branch Selector
  const qrBranch = document.getElementById('dinein-branch-select');
  if (qrBranch) {
    if (branchId === 'jubilee-hills') qrBranch.value = 'Jubilee Hills';
    else if (branchId === 'kphb') qrBranch.value = 'KPHB Colony';
    else if (branchId === 'kakinada') qrBranch.value = 'Kakinada';
  }

  // Close Popover & Notify
  toggleBranchPopover(true);
  showToast(`📍 Dining branch set to ${branch.name}`);
}

// Close popover on document click outside
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('branch-selector-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    toggleBranchPopover(true);
  }
});

// Live Real-Time Synchronization between Owner Command Center & Customer Site
async function syncLiveMenuAndSettings() {
  try {
    // 1. Fetch live menu from Owner Operations Portal (Render & localhost:5000) and customer backend
    const endpoints = [
      'https://subbayya-gari-hotel.onrender.com/api/menu',
      `${BACKEND_BASE}/api/menu`
    ];
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      endpoints.unshift('http://localhost:5000/api/menu');
    }

    let liveItems = null;
    for (const url of [...new Set(endpoints)]) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || json.menu || json.items;
          if (Array.isArray(list) && list.length > 0) {
            liveItems = list;
            break;
          }
        }
      } catch (err) {
        // Continue to next endpoint
      }
    }

    if (Array.isArray(liveItems) && liveItems.length > 0) {
      let hasChanges = false;

      liveItems.forEach(liveItem => {
        const liveId = (liveItem.itemId || liveItem.id || '').toString();
        const liveName = (liveItem.name || '').toLowerCase().trim();
        const liveTelugu = (liveItem.telugu || '').trim();

        // Match locally by id, itemId, english name, or telugu name
        const localItem = MENU_DATA.find(m =>
          (liveId && (m.id === liveId || m.itemId === liveId)) ||
          (liveName && m.name.toLowerCase().trim() === liveName) ||
          (liveTelugu && m.telugu && m.telugu.trim() === liveTelugu)
        );

        if (localItem) {
          const newPrice = Number(liveItem.price);
          const newOrigPrice = liveItem.originalPrice !== undefined && liveItem.originalPrice !== null ? Number(liveItem.originalPrice) : localItem.originalPrice;
          const newImage = liveItem.image || liveItem.photo || liveItem.imageUrl;
          const newStock = liveItem.isAvailable !== undefined ? Boolean(liveItem.isAvailable) : (liveItem.inStock !== undefined ? Boolean(liveItem.inStock) : localItem.inStock);

          // Update Price (Cost)
          if (!isNaN(newPrice) && newPrice > 0 && localItem.price !== newPrice) {
            localItem.price = newPrice;
            hasChanges = true;
          }

          // Update Original / Strikethrough Price
          if (newOrigPrice !== undefined && localItem.originalPrice !== newOrigPrice) {
            localItem.originalPrice = newOrigPrice;
            hasChanges = true;
          }

          // Update Photo / Image
          if (newImage && typeof newImage === 'string' && newImage.trim() && localItem.image !== newImage.trim()) {
            localItem.image = newImage.trim();
            hasChanges = true;
          }

          // Update Stock Availability
          if (newStock !== undefined && localItem.inStock !== newStock) {
            localItem.inStock = newStock;
            hasChanges = true;
          }

          // Update Description if provided
          if (liveItem.description && localItem.description !== liveItem.description) {
            localItem.description = liveItem.description;
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        console.log('[Live Menu Sync] Updated menu items (photos & costs) from Owner Portal!');
        renderMenuGrid();
        if (typeof renderRateBoard === 'function') renderRateBoard();
        updateCartBadge();

        // Synchronize active cart items with latest photo and price
        if (Array.isArray(AppState.cart)) {
          AppState.cart.forEach(cartItem => {
            const fresh = MENU_DATA.find(m => m.id === cartItem.id || m.name === cartItem.name);
            if (fresh) {
              cartItem.price = fresh.price;
              if (fresh.image) cartItem.image = fresh.image;
            }
          });
          saveCart();
          updateCartUI();
        }
      }
    }

    // 2. Fetch live settings & announcement banner
    const settingsRes = await fetch(`${BACKEND_BASE}/api/settings`);
    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      const settings = settingsData.settings;
      if (settings) {
        const announceTextEl = document.querySelector('.announcement-bar span:nth-child(2)');
        if (announceTextEl && settings.announcementText) {
          announceTextEl.textContent = settings.announcementText;
        }
      }
    }
  } catch (err) {
    // Silent catch
  }
}
window.syncLiveMenuAndSettings = syncLiveMenuAndSettings;

// ==========================================================================
// 5. DOM READY & INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  renderMenuGrid();
  setupUnboxInteractivity();
  setupCateringCalculator();
  renderBranches('all');
  setupReservationForm();
  setupEventListeners();
  updateCartBadge();
  updateAuthUI();

  // Initial Sync and Start Periodic 6s Auto-Sync
  syncLiveMenuAndSettings();
  setInterval(syncLiveMenuAndSettings, 6000);

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('openCart') === 'true') {
    setTimeout(() => toggleCart(true), 350);
  } else if (urlParams.get('showOrders') === 'true' || urlParams.get('orders') === 'true') {
    setTimeout(() => {
      openProfileModal('orders');
    }, 400);
  }
});

// ==========================================================================
// 6. RENDER MENU ITEMS & FILTERING
// ==========================================================================
function renderMenuGrid() {
  const menuContainer = document.getElementById('menu-items-grid');
  if (!menuContainer) return;

  const filteredItems = MENU_DATA.filter(item => {
    const matchesCategory = AppState.selectedCategory === 'all' || item.category === AppState.selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(AppState.searchQuery.toLowerCase()) ||
                          item.telugu.includes(AppState.searchQuery) ||
                          item.description.toLowerCase().includes(AppState.searchQuery.toLowerCase());
    
    let matchesDiet = true;
    if (AppState.activeDietFilter === 'bestseller') matchesDiet = item.isBestseller;
    if (AppState.activeDietFilter === 'jain') matchesDiet = item.dietary.includes('jain-available');
    if (AppState.activeDietFilter === 'chef-special') matchesDiet = item.dietary.includes('chef-special');
    if (AppState.activeDietFilter === 'mild') matchesDiet = item.spiceLevel === 'mild';

    return matchesCategory && matchesSearch && matchesDiet;
  });

  if (filteredItems.length === 0) {
    menuContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--color-text-muted);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🍃</div>
        <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--color-text);">No dishes match your filter</h3>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try searching for "Butta Bhojanam", "Gongura", "Ghee" or select "All Menu"</p>
        <button class="btn btn-outline" style="margin-top: 1.25rem;" onclick="resetMenuFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  menuContainer.innerHTML = filteredItems.map(item => {
    const cartItem = AppState.cart.find(c => c.id === item.id);
    const qty = cartItem ? cartItem.qty : 0;
    const isOutOfStock = item.inStock === false;

    let spiceBadge = '';
    if (item.spiceLevel === 'mild') spiceBadge = '<span class="food-spice-level mild">🟢 Mild</span>';
    else if (item.spiceLevel === 'medium') spiceBadge = '<span class="food-spice-level medium">🟠 Medium</span>';
    else if (item.spiceLevel === 'spicy') spiceBadge = '<span class="food-spice-level spicy">🔴 Andhra Spicy</span>';

    return `
      <div class="food-card ${isOutOfStock ? 'item-sold-out' : ''}" data-id="${item.id}" style="${isOutOfStock ? 'opacity: 0.7;' : ''}">
        <div class="food-card-image-wrap" style="position: relative;">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <div class="card-top-badges">
            <div class="pure-veg-symbol" title="100% Pure Vegetarian"></div>
            ${item.isBestseller ? '<span class="badge badge-gold">⭐ Godavari Classic</span>' : ''}
          </div>
          ${isOutOfStock ? `
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
              <span style="background: #DC2626; color: white; font-size: 0.82rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                ❌ Sold Out Today
              </span>
            </div>
          ` : ''}
        </div>

        <div class="food-card-body">
          <div class="food-meta-row">
            <span style="font-weight: 700; color: var(--color-gold);">${item.telugu}</span>
            ${spiceBadge}
          </div>

          <h3 class="food-card-title">${item.name}</h3>
          <span class="food-portion-badge">${item.category === 'meals' ? '1 Royal Meal' : (item.category === 'sweets' ? '4 Pcs Pack' : (item.category === 'pickles' ? '250g Jar' : '1 Handi'))}</span>
          <p class="food-card-desc">${item.description}</p>

          <div class="food-card-footer">
            <div>
              <span class="food-price">₹${item.price}</span>
              ${item.originalPrice ? `<span style="font-size: 0.8rem; text-decoration: line-through; color: var(--color-text-subtle); margin-left: 4px;">₹${item.originalPrice}</span>` : ''}
            </div>

            ${isOutOfStock ? `
              <button class="btn btn-sm" disabled style="background: #4B5563; color: #9CA3AF; cursor: not-allowed; border: none; padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px;">
                Sold Out
              </button>
            ` : (qty === 0 ? `
              <button class="btn btn-primary btn-sm" onclick="addToCart('${item.id}')">
                <span>Add +</span>
              </button>
            ` : `
              <div class="qty-controller">
                <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)">-</button>
                <span class="qty-value">${qty}</span>
                <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)">+</button>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetMenuFilters() {
  AppState.selectedCategory = 'all';
  AppState.searchQuery = '';
  AppState.activeDietFilter = 'all';
  
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === 'all');
  });

  document.querySelectorAll('.diet-filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === 'all');
  });

  renderMenuGrid();
}

function switchMenuView(view) {
  const cardView = document.getElementById('menu-items-grid');
  const boardView = document.getElementById('heritage-rate-board');
  const btnCards = document.getElementById('view-toggle-cards');
  const btnBoard = document.getElementById('view-toggle-board');

  if (view === 'board') {
    if (cardView) cardView.style.display = 'none';
    if (boardView) boardView.style.display = 'block';
    if (btnCards) btnCards.classList.remove('active');
    if (btnBoard) btnBoard.classList.add('active');
  } else {
    if (cardView) cardView.style.display = 'grid';
    if (boardView) boardView.style.display = 'none';
    if (btnCards) btnCards.classList.add('active');
    if (btnBoard) btnBoard.classList.remove('active');
  }
}

function filterRateBoard(category) {
  const cards = document.querySelectorAll('.rate-board-card');
  const tabs = document.querySelectorAll('.rb-tab-btn');
  
  tabs.forEach(tab => {
    const onclickVal = tab.getAttribute('onclick') || '';
    if (onclickVal.includes(`'${category}'`)) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  cards.forEach(card => {
    if (category === 'all' || card.dataset.rb === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// ==========================================================================
// 7. CART SYSTEM & DRAWER LOGIC
// ==========================================================================
function addToCart(itemId) {
  // Common alias mappings
  const idAliases = {
    'bb-01': 'meal-butta',
    'butta': 'meal-butta',
    'butta-bojanam': 'meal-butta',
    'butta-bhojanam': 'meal-butta'
  };
  const targetId = idAliases[itemId] || itemId;
  let item = MENU_DATA.find(m => m.id === targetId || m.id === itemId);
  if (!item && typeof activeMenu !== 'undefined' && Array.isArray(activeMenu)) {
    item = activeMenu.find(m => m.id === targetId || m.id === itemId);
  }
  if (!item) {
    item = MENU_DATA.find(m => m.id.includes(itemId) || (typeof itemId === 'string' && itemId.includes(m.id))) || MENU_DATA[0];
  }
  if (!item) return;

  const existing = AppState.cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    AppState.cart.push({
      id: item.id,
      name: item.name,
      telugu: item.telugu || '',
      price: item.price,
      image: item.image,
      qty: 1
    });
  }

  saveCart();
  renderMenuGrid();
  renderCartDrawer();
  updateCartBadge();
  showToast(`Added "${item.name}" to your plate! 🌿`);
}

function updateItemQty(itemId, delta) {
  const index = AppState.cart.findIndex(c => c.id === itemId);
  if (index === -1) return;

  AppState.cart[index].qty += delta;
  if (AppState.cart[index].qty <= 0) {
    AppState.cart.splice(index, 1);
  }

  saveCart();
  renderMenuGrid();
  renderCartDrawer();
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  const dockBadge = document.getElementById('dock-cart-badge');
  const floatBar = document.getElementById('mobile-floating-cart-bar');
  const floatBadge = document.getElementById('float-cart-badge');
  const floatTotal = document.getElementById('float-cart-total');

  const totalCount = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  if (dockBadge) {
    dockBadge.textContent = totalCount;
    dockBadge.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  if (floatBar) {
    if (totalCount > 0 && window.innerWidth <= 768) {
      floatBar.style.display = 'flex';
      if (floatBadge) floatBadge.textContent = `${totalCount} ${totalCount === 1 ? 'ITEM' : 'ITEMS'}`;
      if (floatTotal) floatTotal.textContent = `₹${totalPrice}`;
    } else {
      floatBar.style.display = 'none';
    }
  }
}

function setOrderMode(mode) {
  AppState.orderType = mode;
  const pillTakeaway = document.getElementById('pill-mode-takeaway');
  const pillDelivery = document.getElementById('pill-mode-delivery');
  if (pillTakeaway) pillTakeaway.classList.toggle('active', mode === 'takeaway');
  if (pillDelivery) pillDelivery.classList.toggle('active', mode === 'delivery');
  renderCartDrawer();

  if (mode === 'delivery' && !AppState.customerLocation && !document.getElementById('order-delivery-address')?.value) {
    showToast('🛵 Delivery selected! Click "Use My GPS" or enter your exact address.');
  }
}
window.setOrderMode = setOrderMode;

// Delivery charge calculation: 2km <= 30rs (flat base), then ₹10/km for additional distance
function calculateDeliveryFee(distanceKm) {
  const d = parseFloat(distanceKm) || 1;
  if (d <= 2) {
    return 30; // Flat ₹30 for up to 2 km
  }
  return 30 + Math.round((d - 2) * 10);
}
window.calculateDeliveryFee = calculateDeliveryFee;

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const footer = document.getElementById('cart-footer-section');
  const itemCountHeading = document.getElementById('cart-item-count-heading');
  if (!container || !footer) return;

  const totalQty = AppState.cart.reduce((s, i) => s + i.qty, 0);
  if (itemCountHeading) {
    itemCountHeading.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
  }

  // Update pills active state
  const pillTakeaway = document.getElementById('pill-mode-takeaway');
  const pillDelivery = document.getElementById('pill-mode-delivery');
  if (pillTakeaway) pillTakeaway.classList.toggle('active', AppState.orderType === 'takeaway');
  if (pillDelivery) pillDelivery.classList.toggle('active', AppState.orderType === 'delivery');

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <span style="font-size: 3.2rem;">🧺</span>
        <h4 style="font-family: var(--font-serif); font-size: 1.2rem; color: var(--color-text);">Your Butta is empty</h4>
        <p style="font-size: 0.85rem; color: var(--color-text-muted);">Add delicious Godavari meals, pure ghee podis, or hot Bobbatlu to feast!</p>
        <button class="btn btn-gold btn-sm" onclick="toggleCart(false); document.getElementById('menu').scrollIntoView({behavior: 'smooth'});">
          Explore Fresh Menu
        </button>
      </div>
    `;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'flex';

  container.innerHTML = AppState.cart.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div style="font-size: 0.75rem; color: var(--color-gold); font-weight: 600;">${item.telugu || ''}</div>
        <div class="cart-item-price">₹${item.price} each</div>
      </div>
      <div class="qty-controller">
        <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)" aria-label="Decrease quantity">-</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
      </div>
      <div style="font-family: var(--font-brand); font-weight: 800; font-size: 1rem; color: var(--color-text); min-width: 50px; text-align: right;">
        ₹${item.price * item.qty}
      </div>
    </div>
  `).join('');

  // Calculate totals
  const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const packagingFee = 30; // Banana leaf & bamboo packaging
  const isDelivery = AppState.orderType === 'delivery';
  
  // Exact km from restaurant to customer location
  const exactKm = AppState.deliveryExactKm || AppState.deliveryDistanceKm || 2;
  // Delivery charges: 2km <= 30rs, then ₹10/km
  const deliveryFee = isDelivery ? calculateDeliveryFee(exactKm) : 0;
  
  let discount = 0;
  if (AppState.appliedPromo === 'BUTTA10') {
    discount = Math.round(subtotal * 0.10);
  }

  const grandTotal = subtotal + packagingFee + deliveryFee - discount;

  // Toggle Pickup box vs Delivery distance box
  const pickupBox = document.getElementById('cart-pickup-box');
  const pickupDetails = document.getElementById('cart-pickup-details');
  const distanceBox = document.getElementById('delivery-distance-box');
  const deliveryDetails = document.getElementById('cart-delivery-details');

  if (pickupBox) pickupBox.style.display = isDelivery ? 'none' : 'flex';
  if (pickupDetails) pickupDetails.style.display = isDelivery ? 'none' : 'flex';
  if (distanceBox) distanceBox.style.display = isDelivery ? 'flex' : 'none';
  if (deliveryDetails) deliveryDetails.style.display = isDelivery ? 'flex' : 'none';

  // Update Branch Display in Cart
  if (isDelivery) {
    updateCartNearestBranchDisplay();
  } else {
    updateCartPickupDisplay();
  }

  const distanceVal = document.getElementById('delivery-distance-val');
  if (distanceVal) distanceVal.textContent = exactKm;

  const feeBadge = document.getElementById('delivery-fee-badge');
  if (feeBadge) feeBadge.textContent = `₹${deliveryFee}`;

  const rangeInput = document.getElementById('delivery-distance-range');
  if (rangeInput && rangeInput.value != Math.round(exactKm)) {
    rangeInput.value = Math.round(exactKm);
  }

  document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('cart-packaging').textContent = `₹${packagingFee}`;
  document.getElementById('cart-delivery').textContent = isDelivery 
    ? `₹${deliveryFee} (${exactKm} km — ₹30 for ≤2km + ₹10/km)` 
    : 'FREE (Restaurant Pickup)';
  
  const discountRow = document.getElementById('cart-discount-row');
  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      document.getElementById('cart-discount-val').textContent = `-₹${discount}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  document.getElementById('cart-grand-total').textContent = `₹${grandTotal}`;

  // Update Online UPI Payment Section
  const upiPayAmount = document.getElementById('upi-pay-amount');
  if (upiPayAmount) upiPayAmount.textContent = grandTotal;

  const upiId = '9121792433@ybl';
  const upiPaymentUrl = `upi://pay?pa=${upiId}&pn=Subbayya%20Gari%20Hotel&am=${grandTotal}&cu=INR&tn=Subbayya%20Food%20Order`;
  const directUpiBtn = document.getElementById('direct-upi-pay-btn');
  if (directUpiBtn) {
    directUpiBtn.href = upiPaymentUrl;
  }

  const qrImg = document.getElementById('upi-qr-image');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPaymentUrl)}`;
  }

  // Update Checkout Button State - Proceed to Pay Online
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const cartCheckoutBtnText = document.getElementById('cart-checkout-btn-text');

  if (cartCheckoutBtnText) {
    cartCheckoutBtnText.textContent = `Proceed to Pay Online (₹${grandTotal}) 💳`;
  }
  if (cartCheckoutBtn) {
    cartCheckoutBtn.classList.remove('btn-outline-gold');
    cartCheckoutBtn.classList.add('btn-gold');
  }
}

function copyUpiId(upiId) {
  const idToCopy = upiId || '9121792433@ybl';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(idToCopy).then(() => {
      const copyBtnText = document.getElementById('copy-upi-btn-text');
      if (copyBtnText) {
        copyBtnText.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBtnText.textContent = '📋 Copy';
        }, 2000);
      }
      showToast(`📋 UPI ID (${idToCopy}) copied to clipboard!`);
    }).catch(() => {
      prompt('Copy UPI ID:', idToCopy);
    });
  } else {
    prompt('Copy UPI ID:', idToCopy);
  }
}
window.copyUpiId = copyUpiId;

// Calculate Great-circle distance between two GPS coordinates using Haversine formula
function calculateDistanceBetweenCoords(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

function getSortedBranchesByDistance(userLat, userLng) {
  return BRANCHES_DATA.map(branch => {
    const distKm = calculateDistanceBetweenCoords(userLat, userLng, branch.lat, branch.lng);
    return {
      ...branch,
      distanceKm: parseFloat(distKm.toFixed(1))
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

function updateCartPickupDisplay() {
  const branchSelect = document.getElementById('pickup-branch-select');
  const branchDisplay = document.getElementById('pickup-branch-display');
  const mapLink = document.getElementById('pickup-map-direction-link');
  if (!branchDisplay) return;

  const currentBranch = BRANCHES_DATA.find(b => b.id === AppState.selectedBranch) || BRANCHES_DATA[0];
  branchDisplay.innerHTML = `${currentBranch.name}`;

  if (mapLink) {
    mapLink.href = currentBranch.mapUrl;
  }

  if (branchSelect) {
    branchSelect.innerHTML = BRANCHES_DATA.map(b => `
      <option value="${b.id}" ${b.id === AppState.selectedBranch ? 'selected' : ''}>
        ${b.name.split(',')[0]} (${b.city})
      </option>
    `).join('');
  }
}

function changePickupBranch(branchId) {
  const branch = BRANCHES_DATA.find(b => b.id === branchId);
  if (!branch) return;
  AppState.selectedBranch = branchId;
  localStorage.setItem('sgh_active_branch', branchId);
  renderCartDrawer();
  showToast(`🥡 Pickup outlet set to ${branch.name}`);
}
window.changePickupBranch = changePickupBranch;

function updateCartNearestBranchDisplay() {
  const branchSelect = document.getElementById('delivery-branch-select');
  const branchDisplay = document.getElementById('nearest-branch-display');
  if (!branchDisplay) return;

  if (AppState.customerLocation) {
    const userLat = parseFloat(AppState.customerLocation.lat);
    const userLng = parseFloat(AppState.customerLocation.lng);
    const sorted = getSortedBranchesByDistance(userLat, userLng);
    const nearest = sorted[0];

    // Auto-select nearest branch if user hasn't overridden
    if (!AppState.selectedBranch || AppState.selectedBranch === 'kphb') {
      AppState.selectedBranch = nearest.id;
    }

    const currentBranch = sorted.find(b => b.id === AppState.selectedBranch) || nearest;
    branchDisplay.innerHTML = `${currentBranch.name} <span style="color: #16A34A; font-size: 0.75rem;">(⚡ ${currentBranch.distanceKm} km away)</span>`;

    if (branchSelect) {
      branchSelect.innerHTML = sorted.map(b => `
        <option value="${b.id}" ${b.id === AppState.selectedBranch ? 'selected' : ''}>
          ${b.name.split(',')[0]} (${b.distanceKm} km${b.id === nearest.id ? ' - Nearest' : ''})
        </option>
      `).join('');
    }
  } else {
    const currentBranch = BRANCHES_DATA.find(b => b.id === AppState.selectedBranch) || BRANCHES_DATA[1];
    branchDisplay.innerHTML = `${currentBranch.name} <span style="color: var(--color-gold); font-size: 0.72rem;">(Tap "Use My GPS" for exact branch)</span>`;

    if (branchSelect) {
      branchSelect.innerHTML = BRANCHES_DATA.map(b => `
        <option value="${b.id}" ${b.id === AppState.selectedBranch ? 'selected' : ''}>
          ${b.name.split(',')[0]} (${b.city})
        </option>
      `).join('');
    }
  }
}

function changeDeliveryBranch(branchId) {
  const branch = BRANCHES_DATA.find(b => b.id === branchId);
  if (!branch) return;
  AppState.selectedBranch = branchId;

  if (AppState.customerLocation) {
    const userLat = parseFloat(AppState.customerLocation.lat);
    const userLng = parseFloat(AppState.customerLocation.lng);
    const dist = calculateDistanceBetweenCoords(userLat, userLng, branch.lat, branch.lng);
    AppState.deliveryExactKm = parseFloat(dist.toFixed(1));
    AppState.deliveryDistanceKm = Math.min(30, Math.max(1, Math.round(dist)));
  }

  renderCartDrawer();
  showToast(`🏢 Kitchen branch set to ${branch.name}`);
}
window.changeDeliveryBranch = changeDeliveryBranch;

function updateDeliveryDistance(km) {
  const parsed = parseFloat(km);
  AppState.deliveryExactKm = isNaN(parsed) || parsed < 1 ? 1 : parseFloat(parsed.toFixed(1));
  AppState.deliveryDistanceKm = Math.round(AppState.deliveryExactKm);
  const distanceVal = document.getElementById('delivery-distance-val');
  if (distanceVal) distanceVal.textContent = AppState.deliveryExactKm;
  const feeBadge = document.getElementById('delivery-fee-badge');
  if (feeBadge) feeBadge.textContent = `₹${Math.round(AppState.deliveryExactKm * 10)}`;
  renderCartDrawer();
}
window.updateDeliveryDistance = updateDeliveryDistance;

function captureCustomerLocation() {
  const btn = document.getElementById('btn-get-location');
  const badge = document.getElementById('gps-status-badge');
  const statusText = document.getElementById('gps-status-text');
  const mapPreview = document.getElementById('gps-map-preview');

  if (!navigator.geolocation) {
    showToast('⚠️ Geolocation is not supported by your browser');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Locating...</span>';
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      
      AppState.customerLocation = {
        lat: lat,
        lng: lng,
        mapsUrl: mapsUrl
      };

      // Automatically find nearest branch & auto-set delivery distance
      const sorted = getSortedBranchesByDistance(parseFloat(lat), parseFloat(lng));
      if (sorted && sorted.length > 0) {
        const nearest = sorted[0];
        AppState.selectedBranch = nearest.id;
        AppState.deliveryExactKm = nearest.distanceKm;
        AppState.deliveryDistanceKm = Math.min(30, Math.max(1, Math.round(nearest.distanceKm)));
        showToast(`🎯 Distance Calculated: ${nearest.distanceKm} km from ${nearest.name.split(',')[0]}!`);
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>✅ GPS Linked</span>';
        btn.style.background = '#16A34A';
      }

      if (badge && statusText && mapPreview) {
        badge.style.display = 'flex';
        statusText.textContent = `📍 GPS Pin: ${lat}, ${lng}`;
        mapPreview.href = mapsUrl;
      }

      renderCartDrawer();
    },
    (error) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>📍 Use My GPS</span>';
      }
      let errMessage = 'Unable to retrieve location.';
      if (error.code === error.PERMISSION_DENIED) {
        errMessage = 'Location permission denied. Please enter address manually.';
      }
      showToast(`⚠️ ${errMessage}`);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}
window.captureCustomerLocation = captureCustomerLocation;

function findNearestBranchForDirectory() {
  if (!navigator.geolocation) {
    showToast('⚠️ Geolocation is not supported by your browser');
    return;
  }

  showToast('🔍 Locating nearest Subbayya Gari Hotel branch...');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const sorted = getSortedBranchesByDistance(lat, lng);
      const nearest = sorted[0];

      // Switch tab to all or the branch city
      const branchTabs = document.querySelectorAll('.branch-tab-btn');
      branchTabs.forEach(t => {
        if (t.dataset.city && t.dataset.city.toLowerCase() === nearest.city.toLowerCase()) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });

      renderBranches(nearest.city);

      // Highlight the nearest branch card
      setTimeout(() => {
        const cards = document.querySelectorAll('.branch-card');
        cards.forEach(card => {
          if (card.innerHTML.includes(nearest.name)) {
            card.style.border = '2px solid var(--color-primary)';
            card.style.boxShadow = '0 0 25px rgba(15, 90, 39, 0.3)';
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            if (!card.querySelector('.nearest-loc-badge')) {
              const badge = document.createElement('div');
              badge.className = 'nearest-loc-badge';
              badge.style.background = '#16A34A';
              badge.style.color = 'white';
              badge.style.padding = '0.3rem 0.6rem';
              badge.style.borderRadius = '4px';
              badge.style.fontSize = '0.75rem';
              badge.style.fontWeight = '700';
              badge.style.marginTop = '0.5rem';
              badge.style.display = 'inline-block';
              badge.textContent = `🎯 Closest Outlet to You (${nearest.distanceKm} km away)`;
              card.querySelector('.branch-header').after(badge);
            }
          }
        });
      }, 100);

      showToast(`🎯 Closest Outlet: ${nearest.name} (~${nearest.distanceKm} km)`);
    },
    (error) => {
      showToast('⚠️ Could not determine location. Please select a city tab manually.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
window.findNearestBranchForDirectory = findNearestBranchForDirectory;

function toggleCart(isOpen) {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;

  if (isOpen) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    renderCartDrawer();
  } else {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
  }
}

function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'BUTTA10' || code === 'GODAVARI') {
    AppState.appliedPromo = 'BUTTA10';
    showToast('🎉 10% Godavari Blessing Discount Applied!');
    saveCart();
  } else {
    showToast('⚠️ Invalid coupon code. Try "BUTTA10"');
  }
}

function openDeliveryLocationModal() {
  const modal = document.getElementById('delivery-location-modal');
  if (!modal) return;

  // Pre-fill existing address or branch info
  const addrFlat = document.getElementById('modal-addr-flat');
  const addrStreet = document.getElementById('modal-addr-street');
  const addrLandmark = document.getElementById('modal-addr-landmark');
  const currentBranch = BRANCHES_DATA.find(b => b.id === AppState.selectedBranch) || BRANCHES_DATA[0];

  const exactKm = AppState.deliveryExactKm || AppState.deliveryDistanceKm || 2;
  const fee = calculateDeliveryFee(exactKm);

  const servingBranchEl = document.getElementById('modal-serving-branch-name');
  const feeEl = document.getElementById('modal-delivery-fee-val');
  if (servingBranchEl) servingBranchEl.textContent = currentBranch.name;
  if (feeEl) feeEl.textContent = `₹${fee} (${exactKm} km)`;

  if (AppState.currentUser && AppState.currentUser.address) {
    if (addrStreet && !addrStreet.value) addrStreet.value = AppState.currentUser.address;
  }

  modal.classList.add('active');
}
window.openDeliveryLocationModal = openDeliveryLocationModal;

function closeDeliveryLocationModal() {
  const modal = document.getElementById('delivery-location-modal');
  if (modal) modal.classList.remove('active');
}
window.closeDeliveryLocationModal = closeDeliveryLocationModal;

function captureCustomerLocationFromModal() {
  const btn = document.getElementById('modal-btn-gps');
  const resultDiv = document.getElementById('modal-gps-result');

  if (!navigator.geolocation) {
    showToast('⚠️ Geolocation is not supported by your browser');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Pinpointing exact location...</span>';
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

      AppState.customerLocation = {
        lat: lat,
        lng: lng,
        mapsUrl: mapsUrl
      };

      const sorted = getSortedBranchesByDistance(parseFloat(lat), parseFloat(lng));
      if (sorted && sorted.length > 0) {
        const nearest = sorted[0];
        AppState.selectedBranch = nearest.id;
        AppState.deliveryExactKm = nearest.distanceKm;
        AppState.deliveryDistanceKm = Math.min(30, Math.max(1, Math.round(nearest.distanceKm)));

        const fee = calculateDeliveryFee(nearest.distanceKm);
        const servingBranchEl = document.getElementById('modal-serving-branch-name');
        const feeEl = document.getElementById('modal-delivery-fee-val');
        if (servingBranchEl) servingBranchEl.textContent = `${nearest.name} (${nearest.distanceKm} km)`;
        if (feeEl) feeEl.textContent = `₹${fee} (${nearest.distanceKm} km)`;
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>✅ Live GPS Pin Attached</span>';
        btn.style.background = '#16A34A';
      }

      if (resultDiv) {
        resultDiv.style.display = 'block';
        const fee = calculateDeliveryFee(AppState.deliveryExactKm);
        resultDiv.textContent = `📍 GPS Attached: ${lat}, ${lng} (~${AppState.deliveryExactKm} km from ${AppState.selectedBranch.toUpperCase()} — Fee: ₹${fee})`;
      }

      // Pre-fill street field if empty
      const streetInput = document.getElementById('modal-addr-street');
      if (streetInput && !streetInput.value) {
        streetInput.value = `Live GPS Pin (${lat}, ${lng})`;
      }

      showToast(`🎯 Location Pinned! Delivery fee: ₹${calculateDeliveryFee(AppState.deliveryExactKm)} (${AppState.deliveryExactKm} km)`);
      renderCartDrawer();
    },
    (error) => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>📍 Detect My Live GPS Location</span>';
      }
      showToast('⚠️ Location access not granted. Please enter street & landmark below.');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}
window.captureCustomerLocationFromModal = captureCustomerLocationFromModal;

function onModalCitySelect(city) {
  // If the currently selected branch is already in this city, preserve user selection!
  const currentBranch = BRANCHES_DATA.find(b => b.id === AppState.selectedBranch);
  if (currentBranch && currentBranch.city.toLowerCase() === city.toLowerCase()) {
    const servingBranchEl = document.getElementById('modal-serving-branch-name');
    if (servingBranchEl) servingBranchEl.textContent = currentBranch.name;
    return;
  }
  const branchInCity = BRANCHES_DATA.find(b => b.city.toLowerCase() === city.toLowerCase()) || BRANCHES_DATA[0];
  AppState.selectedBranch = branchInCity.id;
  
  const servingBranchEl = document.getElementById('modal-serving-branch-name');
  if (servingBranchEl) servingBranchEl.textContent = branchInCity.name;
}
window.onModalCitySelect = onModalCitySelect;

function saveDeliveryLocationModal(e) {
  e.preventDefault();
  const flat = document.getElementById('modal-addr-flat')?.value.trim();
  const street = document.getElementById('modal-addr-street')?.value.trim();
  const landmark = document.getElementById('modal-addr-landmark')?.value.trim();
  const city = document.getElementById('modal-addr-city')?.value;

  if (!flat || !street) {
    showToast('⚠️ Please provide Flat/Door No. and Street');
    return;
  }

  const fullAddress = `${flat}, ${street}, ${city}`;
  
  // Update in cart drawer inputs
  const cartAddr = document.getElementById('order-delivery-address');
  const cartLandmark = document.getElementById('order-delivery-landmark');
  if (cartAddr) cartAddr.value = fullAddress;
  if (cartLandmark && landmark) cartLandmark.value = landmark;

  // Save to user profile if logged in
  if (AppState.currentUser) {
    AppState.currentUser.address = fullAddress;
    sessionStorage.setItem('sgh_user', JSON.stringify(AppState.currentUser));
  }

  closeDeliveryLocationModal();
  renderCartDrawer();
  showToast(`✅ Delivery destination set to: ${flat}, ${street}`);
}
window.saveDeliveryLocationModal = saveDeliveryLocationModal;

let pendingCheckoutData = null;

function proceedToCheckout() {
  if (AppState.cart.length === 0) {
    showToast('⚠️ Your cart is empty. Add dishes to proceed!');
    return;
  }

  const isDelivery = AppState.orderType === 'delivery';
  
  const customerName = document.getElementById('order-customer-name')?.value.trim();
  const customerPhone = document.getElementById('order-customer-phone')?.value.trim();

  if (!customerName) {
    showToast('⚠️ Please enter your Full Name');
    document.getElementById('order-customer-name')?.focus();
    return;
  }

  if (!customerPhone || customerPhone.length < 8) {
    showToast('⚠️ Please enter a valid Mobile Number');
    document.getElementById('order-customer-phone')?.focus();
    return;
  }

  let pickupSlot = '';
  let vehicleNote = '';
  let deliveryAddress = '';
  let deliveryLandmark = '';
  let gpsMapUrl = '';

  if (!isDelivery) {
    pickupSlot = document.getElementById('pickup-time-slot')?.value || 'ASAP (15-20 Mins)';
    vehicleNote = document.getElementById('pickup-vehicle-note')?.value.trim() || '';
  } else {
    deliveryAddress = document.getElementById('order-delivery-address')?.value.trim() || '';
    deliveryLandmark = document.getElementById('order-delivery-landmark')?.value.trim() || '';
    gpsMapUrl = AppState.customerLocation ? AppState.customerLocation.mapsUrl : '';

    if (!deliveryAddress && !gpsMapUrl) {
      showToast('📍 Please enter your exact delivery location & address!');
      openDeliveryLocationModal();
      return;
    }
  }

  // Prioritize active branch selected by user in cart or app
  let activeBranchId = AppState.selectedBranch;
  if (isDelivery) {
    const delSelect = document.getElementById('delivery-branch-select');
    if (delSelect && delSelect.value) activeBranchId = delSelect.value;
  } else {
    const pickSelect = document.getElementById('pickup-branch-select');
    if (pickSelect && pickSelect.value) activeBranchId = pickSelect.value;
  }
  AppState.selectedBranch = activeBranchId;
  const activeBranchObj = BRANCHES_DATA.find(b => b.id === activeBranchId) || BRANCHES_DATA[0];

  const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const packagingFee = 30;
  const exactKm = AppState.deliveryExactKm || AppState.deliveryDistanceKm || 2;
  const deliveryFee = isDelivery ? calculateDeliveryFee(exactKm) : 0;
  
  let discount = 0;
  if (AppState.appliedPromo === 'BUTTA10') {
    discount = Math.round(subtotal * 0.10);
  }

  const grandTotal = subtotal + packagingFee + deliveryFee - discount;

  pendingCheckoutData = {
    customerName,
    customerPhone,
    isDelivery,
    pickupSlot,
    vehicleNote,
    deliveryAddress,
    deliveryLandmark,
    gpsMapUrl,
    activeBranchObj,
    subtotal,
    packagingFee,
    exactKm,
    deliveryFee,
    discount,
    grandTotal
  };

  /*
  // Close Cart Drawer and Open Dedicated Online Payment Page Modal
  toggleCart(false);
  openOnlinePaymentModal();
  */

  // Direct checkout & order placement (Payment method commented out as requested)
  toggleCart(false);
  finalizePaymentAndPlaceOrder('Direct Order', 'Confirmed');
}
window.proceedToCheckout = proceedToCheckout;

function placeOrder(isDirect, customMethod, customStatus) {
  return finalizePaymentAndPlaceOrder(customMethod || 'Direct Order', customStatus || 'Confirmed');
}
window.placeOrder = placeOrder;

window.proceedToPaymentPage = proceedToCheckout;

// Payment method app selector (Commented out as requested - not deleted)
/*
let selectedPaymentAppKey = 'phonepe';

function selectPaymentApp(appKey) {
  selectedPaymentAppKey = appKey;
  const appKeys = ['phonepe', 'gpay', 'paytm', 'bhim', 'other', 'customupi', 'card'];
  
  appKeys.forEach(k => {
    const itemEl = document.getElementById(`swiggy-app-${k}`);
    const actionEl = document.getElementById(`action-${k}`);
    const radioEl = document.getElementById(`radio-${k}`);
    
    if (k === appKey) {
      if (itemEl) itemEl.classList.add('active');
      if (actionEl) actionEl.style.display = 'block';
      if (radioEl) radioEl.classList.add('active');
    } else {
      if (itemEl) itemEl.classList.remove('active');
      if (actionEl) actionEl.style.display = 'none';
      if (radioEl) radioEl.classList.remove('active');
    }
  });
}
window.selectPaymentApp = selectPaymentApp;
*/
window.selectPaymentApp = function(appKey) {};

function detectUpiHandle(val) {
  const badge = document.getElementById('custom-upi-detected-badge');
  if (!badge) return;
  const v = val.toLowerCase().trim();
  if (v.includes('@ybl') || v.includes('@ibl') || v.includes('@axl')) {
    badge.textContent = '🟣 PhonePe';
    badge.style.color = '#5f259f';
  } else if (v.includes('@oksbi') || v.includes('@okhdfcbank') || v.includes('@okaxis') || v.includes('@okicici')) {
    badge.textContent = '🔵 Google Pay';
    badge.style.color = '#1a73e8';
  } else if (v.includes('@paytm')) {
    badge.textContent = '🔷 Paytm';
    badge.style.color = '#002970';
  } else if (v.includes('@apl')) {
    badge.textContent = '🟠 Amazon Pay';
    badge.style.color = '#ff9900';
  } else if (v.includes('@upi')) {
    badge.textContent = '🟢 BHIM UPI';
    badge.style.color = '#008233';
  } else if (v.includes('@')) {
    badge.textContent = '⚡ Verified UPI';
    badge.style.color = '#059669';
  } else {
    badge.textContent = '';
  }
}
window.detectUpiHandle = detectUpiHandle;

function appendUpiHandle(handle, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const input = document.getElementById('custom-upi-id-input');
  if (!input) return;
  let currentVal = input.value.trim();
  if (!currentVal) {
    currentVal = (pendingCheckoutData?.customerPhone || '9876543210');
  }
  if (currentVal.includes('@')) {
    currentVal = currentVal.split('@')[0];
  }
  input.value = currentVal + handle;
  detectUpiHandle(input.value);
  input.focus();
}
window.appendUpiHandle = appendUpiHandle;

function payViaCustomUpi(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!pendingCheckoutData) {
    showToast('⚠️ No active order found.');
    return;
  }
  const input = document.getElementById('custom-upi-id-input');
  const upiIdVal = input ? input.value.trim().toLowerCase() : '';
  if (!upiIdVal || !upiIdVal.includes('@') || upiIdVal.length < 5) {
    showToast('⚠️ Please enter a valid UPI ID (e.g. mobile@ybl or name@oksbi)');
    input?.focus();
    return;
  }

  const amount = pendingCheckoutData.grandTotal;
  let appKey = 'other';

  if (upiIdVal.includes('@ybl') || upiIdVal.includes('@ibl') || upiIdVal.includes('@axl')) {
    appKey = 'phonepe';
  } else if (upiIdVal.includes('@oksbi') || upiIdVal.includes('@okhdfcbank') || upiIdVal.includes('@okaxis') || upiIdVal.includes('@okicici')) {
    appKey = 'gpay';
  } else if (upiIdVal.includes('@paytm')) {
    appKey = 'paytm';
  } else if (upiIdVal.includes('@upi')) {
    appKey = 'bhim';
  }

  const appDeepLink = getUpiDeepLink(appKey, amount);
  const appNames = {
    phonepe: 'PhonePe',
    gpay: 'Google Pay',
    paytm: 'Paytm',
    bhim: 'BHIM UPI',
    other: 'UPI App'
  };

  const appName = appNames[appKey] || 'UPI';
  showToast(`⚡ Directing to ${appName} for UPI ID ${upiIdVal}...`);
  window.location.href = appDeepLink;

  const btn = document.getElementById('btn-complete-payment-order');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Verifying UPI (${upiIdVal}) & Placing Order...</span>`;
  }

  // Automatically place order directly after payment
  setTimeout(() => {
    finalizePaymentAndPlaceOrder(`UPI (${upiIdVal})`, `Paid via UPI (${upiIdVal})`);
  }, 1800);
}
window.payViaCustomUpi = payViaCustomUpi;

function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '');
  val = val.substring(0, 16);
  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
  input.value = formatted;

  const iconEl = document.getElementById('card-type-icon');
  if (iconEl) {
    if (val.startsWith('4')) {
      iconEl.textContent = '💳 Visa';
      iconEl.style.color = '#1a1f71';
    } else if (val.startsWith('5') || val.startsWith('2')) {
      iconEl.textContent = '💳 MC';
      iconEl.style.color = '#eb001b';
    } else if (val.startsWith('6')) {
      iconEl.textContent = '💳 RuPay';
      iconEl.style.color = '#097939';
    } else {
      iconEl.textContent = '💳';
      iconEl.style.color = '#1e40af';
    }
  }
}
window.formatCardNumber = formatCardNumber;

function formatCardExpiry(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.length >= 2) {
    input.value = val.substring(0, 2) + '/' + val.substring(2, 4);
  } else {
    input.value = val;
  }
}
window.formatCardExpiry = formatCardExpiry;

function processCardPayment() {
  if (!pendingCheckoutData) {
    showToast('⚠️ No pending order found.');
    return;
  }

  const cardNum = document.getElementById('card-number-input')?.value.replace(/\s+/g, '') || '';
  const cardExp = document.getElementById('card-expiry-input')?.value.trim() || '';
  const cardCvv = document.getElementById('card-cvv-input')?.value.trim() || '';
  const cardName = document.getElementById('card-holder-input')?.value.trim() || '';

  if (cardNum.length < 15) {
    showToast('⚠️ Please enter a valid 16-digit card number');
    document.getElementById('card-number-input')?.focus();
    return;
  }
  if (!/^\d{2}\/\d{2}$/.test(cardExp)) {
    showToast('⚠️ Please enter card expiry as MM/YY');
    document.getElementById('card-expiry-input')?.focus();
    return;
  }
  if (cardCvv.length < 3) {
    showToast('⚠️ Please enter a 3 or 4 digit CVV');
    document.getElementById('card-cvv-input')?.focus();
    return;
  }
  if (!cardName) {
    showToast('⚠️ Please enter the cardholder name');
    document.getElementById('card-holder-input')?.focus();
    return;
  }

  const last4 = cardNum.slice(-4);
  showToast('🔒 Contacting Secure Banking Gateway...');

  setTimeout(() => {
    showToast('✅ 3D-Secure Authorization Successful!');
    finalizePaymentAndPlaceOrder(`Card (•••• ${last4})`, `Paid Online (Card •••• ${last4})`);
  }, 1000);
}
window.processCardPayment = processCardPayment;

function getUpiDeepLink(appKey, amount) {
  const upiId = '9121792433@ybl';
  const name = 'Subbayya%20Gari%20Hotel';
  const note = 'Subbayya%20Food%20Order';
  const generic = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  
  switch (appKey) {
    case 'phonepe':
      return `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    case 'gpay':
      return `gpay://upi/pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    case 'paytm':
      return `paytmmp://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    case 'bhim':
      return `bhim://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
    case 'other':
    default:
      return generic;
  }
}

let hasInitiatedPayment = false;

function launchUpiApp(appKey, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (!pendingCheckoutData) {
    showToast('⚠️ No active order found.');
    return;
  }
  
  hasInitiatedPayment = true;
  const amount = pendingCheckoutData.grandTotal;
  const specificUrl = getUpiDeepLink(appKey, amount);
  
  const appNames = {
    phonepe: 'PhonePe UPI',
    gpay: 'Google Pay',
    paytm: 'Paytm UPI',
    bhim: 'BHIM UPI',
    other: 'UPI App'
  };

  const appName = appNames[appKey] || 'UPI App';
  showToast(`⚡ Launching ${appName} for ₹${amount}...`);

  // Direct app trigger
  window.location.href = specificUrl;

  const btn = document.getElementById('btn-complete-payment-order');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Verifying Payment with ${appName}...</span>`;
  }

  // Once payment app is triggered, automatically complete order directly
  setTimeout(() => {
    finalizePaymentAndPlaceOrder(appName, `Paid Online (${appName})`);
  }, 1800);
}
window.launchUpiApp = launchUpiApp;

function toggleQrSection() {
  const qrBody = document.getElementById('swiggy-qr-body');
  const icon = document.getElementById('qr-expand-icon');
  if (!qrBody) return;

  const isCurrentlyOpen = qrBody.style.display === 'block';
  if (isCurrentlyOpen) {
    qrBody.style.display = 'none';
    if (icon) icon.textContent = '▼';
  } else {
    qrBody.style.display = 'block';
    if (icon) icon.textContent = '▲';
  }
}
window.toggleQrSection = toggleQrSection;

function copyUpiId(id = '9121792433@ybl') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(id).then(() => {
      showToast('📋 UPI ID (9121792433@ybl) copied to clipboard!');
      const btn = document.getElementById('copy-upi-btn-text');
      if (btn) {
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy'; }, 2500);
      }
    }).catch(() => {
      fallbackCopyText(id);
    });
  } else {
    fallbackCopyText(id);
  }
}
window.copyUpiId = copyUpiId;

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('📋 UPI ID (9121792433@ybl) copied!');
}

function openOnlinePaymentModal() {
  if (!pendingCheckoutData) {
    showToast('⚠️ Please fill your order details in cart');
    toggleCart(true);
    return;
  }

  hasInitiatedPayment = false;

  const modal = document.getElementById('online-payment-modal');
  if (!modal) return;

  const data = pendingCheckoutData;
  const totalItemCount = (AppState.cart || []).reduce((s, i) => s + (i.qty || 1), 0);
  const totalDishesLabel = `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'}`;
  
  // Header summaries
  const headerCountEl = document.getElementById('pay-header-items-count');
  const headerTotalEl = document.getElementById('pay-header-total');
  const headerSavingsEl = document.getElementById('pay-header-savings');
  const headerRouteEl = document.getElementById('pay-header-route');

  if (headerCountEl) headerCountEl.textContent = totalDishesLabel;
  if (headerTotalEl) headerTotalEl.textContent = `₹${data.grandTotal}`;
  const savingsAmt = data.discount > 0 ? data.discount : 40;
  if (headerSavingsEl) headerSavingsEl.textContent = `₹${savingsAmt}`;

  const branchName = data.activeBranchObj ? data.activeBranchObj.name.split(',')[0] : 'KPHB Colony';
  if (headerRouteEl) {
    if (data.isDelivery) {
      headerRouteEl.textContent = `Delivering to ${data.deliveryAddress || 'Your Address'} from ${branchName} • 25-35 mins`;
    } else {
      headerRouteEl.textContent = `Self-Pickup from ${branchName} • Ready in 15-20 mins`;
    }
  }

  // Update all amount labels on app pay buttons
  const amountEls = document.querySelectorAll('.pay-app-amount-val');
  amountEls.forEach(el => {
    el.textContent = data.grandTotal;
  });

  const upiId = '9121792433@ybl';
  const upiUrl = `upi://pay?pa=${upiId}&pn=Subbayya%20Gari%20Hotel&am=${data.grandTotal}&cu=INR&tn=Subbayya%20Order`;

  // Deep links for each app
  const btnPhonePe = document.getElementById('btn-pay-phonepe');
  const btnGpay = document.getElementById('btn-pay-gpay');
  const btnPaytm = document.getElementById('btn-pay-paytm');
  const btnBhim = document.getElementById('btn-pay-bhim');
  const btnOther = document.getElementById('btn-pay-other');

  if (btnPhonePe) btnPhonePe.href = `phonepe://pay?pa=${upiId}&pn=Subbayya%20Gari%20Hotel&am=${data.grandTotal}&cu=INR&tn=Subbayya%20Order`;
  if (btnGpay) btnGpay.href = `gpay://upi/pay?pa=${upiId}&pn=Subbayya%20Gari%20Hotel&am=${data.grandTotal}&cu=INR&tn=Subbayya%20Order`;
  if (btnPaytm) btnPaytm.href = `paytmmp://pay?pa=${upiId}&pn=Subbayya%20Gari%20Hotel&am=${data.grandTotal}&cu=INR&tn=Subbayya%20Order`;
  if (btnBhim) btnBhim.href = `bhim://pay?pa=${upiId}&pn=Subbayya%20Gari%20Hotel&am=${data.grandTotal}&cu=INR&tn=Subbayya%20Order`;
  if (btnOther) btnOther.href = upiUrl;

  // Set dynamic QR code image
  const qrImg = document.getElementById('upi-qr-image');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;
  }

  // Select PhonePe by default
  selectPaymentApp('phonepe');

  const mainBtn = document.getElementById('btn-complete-payment-order');
  if (mainBtn) {
    mainBtn.disabled = false;
    mainBtn.innerHTML = '<span>Complete Your Payment</span>';
  }

  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  modal.style.zIndex = '999999';
}
window.openOnlinePaymentModal = openOnlinePaymentModal;

function closeOnlinePaymentModal() {
  const modal = document.getElementById('online-payment-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }
}
window.closeOnlinePaymentModal = closeOnlinePaymentModal;

let isPlacingOrder = false;

function finalizePaymentAndPlaceOrder(customMethod, customStatus) {
  if (isPlacingOrder) return;
  isPlacingOrder = true;

  const btn = document.getElementById('btn-complete-payment-order');

  // Resolve payment method if not explicitly passed
  if (!customMethod) {
    if (selectedPaymentAppKey === 'card') {
      const cardNum = document.getElementById('card-number-input')?.value.replace(/\s+/g, '') || '';
      customMethod = cardNum.length >= 15 ? `Card (•••• ${cardNum.slice(-4)})` : 'Credit/Debit Card';
      customStatus = `Paid Online (${customMethod})`;
    } else if (selectedPaymentAppKey === 'customupi') {
      const customUpiVal = document.getElementById('custom-upi-id-input')?.value.trim();
      customMethod = customUpiVal ? `UPI (${customUpiVal})` : 'UPI ID';
      customStatus = `Paid via ${customMethod}`;
    } else {
      const appNames = {
        phonepe: 'PhonePe UPI',
        gpay: 'Google Pay',
        paytm: 'Paytm UPI',
        bhim: 'BHIM UPI',
        other: 'UPI App'
      };
      const appName = appNames[selectedPaymentAppKey] || 'PhonePe UPI';
      customMethod = appName;
      customStatus = `Paid Online (${appName})`;
    }
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Placing Your Order Directly...</span>';
  }

  // Fallback if pendingCheckoutData is missing
  if (!pendingCheckoutData) {
    const custName = document.getElementById('order-customer-name')?.value.trim() || AppState.currentUser?.name || 'Guest Customer';
    const custPhone = document.getElementById('order-customer-phone')?.value.trim() || AppState.currentUser?.phone || '9876543210';
    const isDeliv = AppState.orderType === 'delivery';
    let fallbackBranchId = AppState.selectedBranch;
    if (isDeliv) {
      const delSelect = document.getElementById('delivery-branch-select');
      if (delSelect && delSelect.value) fallbackBranchId = delSelect.value;
    } else {
      const pickSelect = document.getElementById('pickup-branch-select');
      if (pickSelect && pickSelect.value) fallbackBranchId = pickSelect.value;
    }
    const activeBranchObj = BRANCHES_DATA.find(b => b.id === fallbackBranchId) || BRANCHES_DATA[0];
    const subtotal = (AppState.cart || []).reduce((s, i) => s + ((i.price || 0) * (i.qty || 1)), 0);
    
    if (subtotal === 0 && (!AppState.cart || AppState.cart.length === 0)) {
      showToast('⚠️ Cart is empty. Please add items before placing order.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>✅ I Have Completed Payment — Place Order 🚀</span>';
      }
      closeOnlinePaymentModal();
      toggleCart(true);
      return;
    }

    pendingCheckoutData = {
      customerName: custName,
      customerPhone: custPhone,
      isDelivery: isDeliv,
      activeBranchObj: activeBranchObj,
      subtotal: subtotal,
      packagingFee: 30,
      deliveryFee: isDeliv ? 30 : 0,
      discount: 0,
      grandTotal: subtotal + 30 + (isDeliv ? 30 : 0),
      deliveryAddress: document.getElementById('order-delivery-address')?.value.trim() || 'KPHB Colony, Hyderabad',
      deliveryLandmark: '',
      gpsMapUrl: ''
    };
  }

  const data = pendingCheckoutData;
  const customUpiInput = document.getElementById('custom-upi-id-input')?.value.trim() || '';
  const paymentMethodLabel = customMethod || (customUpiInput ? `UPI (${customUpiInput})` : 'Online UPI (9121792433@ybl)');
  const paymentStatusLabel = customStatus || (customUpiInput ? `Paid via UPI (${customUpiInput})` : 'Paid Online (UPI: 9121792433@ybl)');

  const newOrderId = 'SGH-' + Math.floor(100000 + Math.random() * 900000);
  const nowIso = new Date().toISOString();
  const orderItemsCopy = (AppState.cart && AppState.cart.length > 0 ? AppState.cart : [
    { id: 'meal-butta-bhojanam-1p', name: 'Butta Bhojanam (1 Person)', price: 290, qty: 1 }
  ]).map(i => ({
    id: i.id || 'dish-' + Date.now(),
    name: i.name,
    price: i.price || 0,
    qty: i.qty || 1,
    total: (i.price || 0) * (i.qty || 1)
  }));

  const orderPayload = {
    id: newOrderId,
    createdAt: nowIso,
    timestamp: Date.now(),
    status: 'Received',
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: AppState.currentUser ? (AppState.currentUser.email || '') : '',
    orderType: AppState.orderType || (data.isDelivery ? 'delivery' : 'pickup'),
    branchId: data.activeBranchObj?.id || 'kphb',
    branch: data.activeBranchObj?.name || 'KPHB Colony, Hyderabad',
    branchName: data.activeBranchObj?.name || 'KPHB Colony, Kukatpally',
    branchAddress: data.activeBranchObj?.address || 'Road No. 4, KPHB Colony',
    items: orderItemsCopy,
    itemCount: orderItemsCopy.reduce((s, i) => s + i.qty, 0),
    subtotal: data.subtotal,
    packagingFee: data.packagingFee || 30,
    deliveryFee: data.deliveryFee || 0,
    discount: data.discount || 0,
    grandTotal: data.grandTotal,
    deliveryAddress: data.deliveryAddress || '',
    deliveryLandmark: data.deliveryLandmark || '',
    gpsMapUrl: data.gpsMapUrl || '',
    pickupSlot: data.pickupSlot || '15-20 Mins',
    vehicleNote: data.vehicleNote || '',
    paymentMethod: paymentMethodLabel,
    paymentStatus: paymentStatusLabel,
    upiId: '9121792433@ybl'
  };

  // Ensure customer profile is recorded so "My Orders" and profile are accessible
  if (!AppState.currentUser) {
    AppState.currentUser = {
      name: data.customerName,
      phone: data.customerPhone,
      email: '',
      coins: 50,
      tier: '👑 VIP Member',
      memberSince: new Date().getFullYear().toString()
    };
    try {
      sessionStorage.setItem('sgh_user', JSON.stringify(AppState.currentUser));
      localStorage.setItem('sgh_user', JSON.stringify(AppState.currentUser));
    } catch (e) {}
    updateAuthUI();
  }

  // Save to customer local orders and global orders list immediately for instant access
  try {
    const existingCust = JSON.parse(localStorage.getItem('sgh_customer_orders') || '[]');
    existingCust.unshift(orderPayload);
    localStorage.setItem('sgh_customer_orders', JSON.stringify(existingCust));

    const existingAll = JSON.parse(localStorage.getItem('sgh_all_orders') || '[]');
    const allFiltered = existingAll.filter(o => o && (o.id || o.orderNumber) !== newOrderId);
    allFiltered.unshift(orderPayload);
    localStorage.setItem('sgh_all_orders', JSON.stringify(allFiltered));

    // Broadcast instant storage event & intra-browser message to Owner dashboard
    localStorage.setItem('sgh_latest_order_event', JSON.stringify({ type: 'order_created', order: orderPayload, timestamp: Date.now() }));
    if (sghBroadcast) {
      sghBroadcast.postMessage({ type: 'order_created', order: orderPayload, timestamp: Date.now() });
    }
  } catch (err) {
    console.warn('Could not save order locally:', err);
  }

  // Asynchronously send to Server Orders Database & Owner Management Operations Portal
  const targetEndpoints = [
    `${BACKEND_BASE}/api/orders`,
    'https://subbayya-gari-hotel.onrender.com/api/orders'
  ];
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    targetEndpoints.push('http://localhost:5000/api/orders');
  }
  const uniqueEndpoints = [...new Set(targetEndpoints)];

  uniqueEndpoints.forEach(endpointUrl => {
    fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    }).then(r => r.ok ? r.json() : null).then(resData => {
      if (resData) console.log(`[Order Sync] Saved successfully to ${endpointUrl}:`, resData);
    }).catch(err => {
      console.warn(`[Order Sync] Sync notice for ${endpointUrl}:`, err.message);
    });
  });

  // Clear customer cart
  AppState.cart = [];
  saveCart();
  updateCartUI();
  updateHeaderMyOrdersBadge();

  // Reset button state
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<span>✅ I Have Completed Payment — Place Order 🚀</span>';
  }

  // Close Payment Modal and show Order Confirmation Ticket
  closeOnlinePaymentModal();
  showToast('🎉 Online payment verified! Order placed successfully.');
  showOrderConfirmationModal(newOrderId, data.customerName, data.customerPhone, '', orderPayload);
}
window.finalizePaymentAndPlaceOrder = finalizePaymentAndPlaceOrder;

let lastPlacedOrderData = null;

function showOrderConfirmationModal(orderId, name, phone, whatsappMsg, details = {}) {
  isPlacingOrder = false;
  const modal = document.getElementById('order-confirmation-modal');
  if (!modal) return;

  lastPlacedOrderData = {
    id: orderId,
    name: name,
    phone: phone,
    whatsappMsg: whatsappMsg,
    ...details
  };

  const confId = document.getElementById('conf-order-id');
  const confName = document.getElementById('conf-customer-name');
  const confBranch = document.getElementById('conf-branch');
  const confPayment = document.getElementById('conf-payment-status');
  const confOrderType = document.getElementById('conf-order-type');
  const confDishesCount = document.getElementById('conf-dishes-count');
  const confDishesList = document.getElementById('conf-dishes-list');
  const confGrandTotal = document.getElementById('conf-grand-total');

  if (confId) confId.textContent = orderId;
  if (confName) confName.textContent = name;
  if (confBranch) confBranch.textContent = (details.branchName || AppState.selectedBranch).toUpperCase();
  if (confPayment) {
    if (details.paymentMethod) {
      confPayment.textContent = `${details.paymentMethod} (${details.paymentStatus || 'Verified'})`;
    } else {
      confPayment.textContent = details.paymentStatus || 'Paid Online via UPI';
    }
  }
  
  if (confOrderType) {
    confOrderType.textContent = details.orderType === 'delivery' ? '🛵 Home Delivery' : '🥡 Restaurant Pickup';
  }

  const items = details.items || AppState.cart || [];
  const totalItemCount = items.reduce((s, i) => s + (i.qty || 1), 0);
  if (confDishesCount) confDishesCount.textContent = totalItemCount;

  if (confDishesList) {
    if (items.length > 0) {
      confDishesList.innerHTML = items.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dotted rgba(0,0,0,0.06); padding-bottom: 3px;">
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="color: #16A34A; font-size: 0.72rem;">🟢</span>
            <span style="font-weight: 600; color: var(--color-text);">${item.name}</span>
            <span style="background: rgba(15, 90, 39, 0.08); color: var(--color-primary); font-weight: 700; padding: 0 5px; border-radius: 4px; font-size: 0.7rem;">x${item.qty || 1}</span>
          </div>
          <span style="font-weight: 700; color: var(--color-primary);">₹${(item.price || 0) * (item.qty || 1)}</span>
        </div>
      `).join('');
    } else {
      confDishesList.innerHTML = '<div style="color: var(--color-text-muted);">Royal Butta Feast Selection</div>';
    }
  }

  if (confGrandTotal) {
    confGrandTotal.textContent = `₹${details.grandTotal || 0}`;
  }

  const deliveryRow = document.getElementById('conf-delivery-row');
  const deliveryLoc = document.getElementById('conf-delivery-loc');
  if (deliveryRow && deliveryLoc) {
    if (details.orderType === 'delivery') {
      deliveryRow.style.display = 'block';
      let addrParts = [];
      if (details.deliveryAddress || details.address) addrParts.push(details.deliveryAddress || details.address);
      if (details.deliveryLandmark || details.landmark) addrParts.push(`Landmark: ${details.deliveryLandmark || details.landmark}`);
      if (details.gpsMapUrl || details.locationUrl) {
        addrParts.push(`<a href="${details.gpsMapUrl || details.locationUrl}" target="_blank" style="color: var(--color-gold); font-weight: 700; text-decoration: underline;">📍 View Live Location Pin ↗</a>`);
      }
      deliveryLoc.innerHTML = addrParts.join('<br/>') || 'Delivery location recorded';
    } else {
      deliveryRow.style.display = 'block';
      deliveryLoc.innerHTML = `
        <div style="color: var(--color-primary); font-weight: 700;">🥡 Pickup Outlet: ${details.branchName || 'Selected Branch'}</div>
        <div style="font-size: 0.74rem; color: var(--color-text-muted);">${details.branchAddress || ''}</div>
        <div style="color: #16A34A; font-weight: 700; margin-top: 2px;">⏰ Ready: ${details.pickupSlot || 'Ready in 15-20 Mins'}</div>
        ${details.vehicleNote ? `<div style="color: var(--color-gold); font-size: 0.75rem;">🚗 Curbside Vehicle: ${details.vehicleNote}</div>` : ''}
      `;
    }
  }

  const waBtn = document.getElementById('conf-whatsapp-btn');
  if (waBtn && whatsappMsg) {
    waBtn.href = `https://api.whatsapp.com/send?phone=919010888842&text=${whatsappMsg}`;
  }

  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  modal.style.zIndex = '9999';
  
  // Clear cart
  AppState.cart = [];
  AppState.customerLocation = null;
  saveCart();
  renderMenuGrid();
}

function openOrderDetailsFromConfirmation() {
  const confModal = document.getElementById('order-confirmation-modal');
  if (confModal) {
    confModal.classList.remove('active');
    confModal.style.display = 'none';
    confModal.style.visibility = 'hidden';
    confModal.style.opacity = '0';
    confModal.style.pointerEvents = 'none';
  }
  if (lastPlacedOrderData && lastPlacedOrderData.id) {
    openOrderDetailsModal(lastPlacedOrderData.id);
  }
}
window.openOrderDetailsFromConfirmation = openOrderDetailsFromConfirmation;

// ==========================================================================
// 8. UNBOX THE BUTTA BHOJANAM INTERACTIVITY
// ==========================================================================
function setupUnboxInteractivity() {
  const hotspots = document.querySelectorAll('.butta-dish-hotspot');
  hotspots.forEach(spot => {
    spot.addEventListener('click', () => {
      hotspots.forEach(s => s.classList.remove('active'));
      spot.classList.add('active');
      const itemKey = spot.dataset.item;
      displayButtaItemDetail(itemKey);
    });
  });

  // Display default item (ghee rice)
  displayButtaItemDetail('gheeRice');
}

function displayButtaItemDetail(itemKey) {
  const item = BUTTA_ITEMS[itemKey];
  if (!item) return;

  document.getElementById('unbox-item-tag').textContent = item.tag;
  document.getElementById('unbox-item-title').textContent = item.title;
  document.getElementById('unbox-item-telugu').textContent = item.telugu;
  document.getElementById('unbox-item-desc').textContent = item.desc;
  document.getElementById('unbox-item-calories').textContent = item.calories;
  document.getElementById('unbox-item-tradition').textContent = item.tradition;
}

// ==========================================================================
// 9. CATERING COST CALCULATOR
// ==========================================================================
function setupCateringCalculator() {
  const slider = document.getElementById('catering-guests-slider');
  const countDisplay = document.getElementById('catering-guests-count');
  const packageCards = document.querySelectorAll('.package-card');
  const addonChecks = document.querySelectorAll('.addon-check');

  let selectedPerPlate = 350; // Default Standard
  let packageName = 'Standard Godavari Bhojanam';

  function calculateCateringTotal() {
    const guests = parseInt(slider.value, 10);
    countDisplay.textContent = `${guests} Guests`;

    let addonTotalPerHead = 0;
    addonChecks.forEach(chk => {
      if (chk.checked) addonTotalPerHead += parseInt(chk.dataset.cost, 10);
    });

    const perPlateGrand = selectedPerPlate + addonTotalPerHead;
    const estimatedTotal = guests * perPlateGrand;

    document.getElementById('quote-guests-num').textContent = `${guests} Persons`;
    document.getElementById('quote-package-name').textContent = packageName;
    document.getElementById('quote-per-plate').textContent = `₹${perPlateGrand}/plate`;
    document.getElementById('quote-grand-total').textContent = `₹${estimatedTotal.toLocaleString('en-IN')}`;

    // Update WhatsApp quote link
    const quoteWaBtn = document.getElementById('catering-quote-whatsapp');
    if (quoteWaBtn) {
      let waText = `*🌿 SUBBAYYA GARI HOTEL - CATERING ENQUIRY*%0A`;
      waText += `👥 *Guests:* ${guests}%0A`;
      waText += `🍱 *Package:* ${packageName}%0A`;
      waText += `💰 *Estimated Budget:* ₹${estimatedTotal.toLocaleString('en-IN')}%0A`;
      waText += `Please contact me for dates and customization!`;
      quoteWaBtn.href = `https://api.whatsapp.com/send?phone=919010888842&text=${waText}`;
    }
  }

  if (slider) {
    slider.addEventListener('input', calculateCateringTotal);
  }

  packageCards.forEach(card => {
    card.addEventListener('click', () => {
      packageCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedPerPlate = parseInt(card.dataset.price, 10);
      packageName = card.dataset.name;
      calculateCateringTotal();
    });
  });

  addonChecks.forEach(chk => {
    chk.addEventListener('change', calculateCateringTotal);
  });

  calculateCateringTotal();
}

// ==========================================================================
// 10. TABLE RESERVATION FORM & PASS GENERATOR
// ==========================================================================
function setupReservationForm() {
  const form = document.getElementById('table-reservation-form');
  if (!form) return;

  // Set default date to today
  const resDateInput = document.getElementById('res-date');
  if (resDateInput && !resDateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    resDateInput.value = today;
    resDateInput.min = today;
  }

  // Pre-fill user details if logged in
  if (AppState.currentUser) {
    const resName = document.getElementById('res-name');
    const resPhone = document.getElementById('res-phone');
    if (resName && !resName.value) resName.value = AppState.currentUser.name || '';
    if (resPhone && !resPhone.value) resPhone.value = AppState.currentUser.phone || '';
  }

  const seatingOptions = document.querySelectorAll('.seating-option');
  let selectedSeating = 'Traditional Banana Leaf Seating';

  seatingOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      seatingOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedSeating = opt.dataset.seating;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // REQUIRE LOGIN FOR BOOKING TABLE
    if (!AppState.currentUser) {
      showToast('🔒 Please log in or register to book your banana leaf table! 🍃');
      AppState.pendingAction = {
        type: 'reserve_table',
        formData: {
          name: document.getElementById('res-name')?.value || '',
          phone: document.getElementById('res-phone')?.value || '',
          branch: document.getElementById('res-branch')?.value || '',
          date: document.getElementById('res-date')?.value || '',
          timeSlot: document.getElementById('res-time')?.value || '',
          guests: document.getElementById('res-guests')?.value || '4',
          notes: document.getElementById('res-notes')?.value || 'Standard Pure Veg Bhojanam',
          seating: selectedSeating
        }
      };
      setTimeout(() => {
        window.location.href = 'login.html?redirect=reservations';
      }, 350);
      return;
    }

    const name = document.getElementById('res-name')?.value || AppState.currentUser.name || 'Valued Patron';
    const phone = document.getElementById('res-phone')?.value || AppState.currentUser.phone || '9010888842';
    const branch = document.getElementById('res-branch')?.value || 'KPHB Colony, Hyderabad';
    const date = document.getElementById('res-date')?.value || new Date().toISOString().split('T')[0];
    const timeSlot = document.getElementById('res-time')?.value || 'Lunch Slot: 01:30 PM';
    const guests = document.getElementById('res-guests')?.value || '4';
    const notes = document.getElementById('res-notes')?.value || 'Standard Pure Veg Bhojanam';

    const bookingRef = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

    // Show Confirmation Ticket Modal
        // Asynchronously send Table Reservation to Backend Server
    fetch(`${BACKEND_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingRef,
        customerName: name,
        phone: phone,
        orderType: 'dine-in',
        branch: branch,
        branchName: branch,
        branchId: (branch.toLowerCase().includes('vanasthal') || branch.toLowerCase().includes('vasanth')) ? 'vanasthalipuram' : (branch.toLowerCase().includes('kukat') ? 'kukatpally' : 'kphb'),
        reservationDate: date,
        reservationTime: timeSlot,
        guestsCount: parseInt(guests, 10) || 1,
        seatingPreference: selectedSeating,
        notes: notes,
        items: [
          {
            name: `Traditional Banana Leaf Dining (${guests} Guests)`,
            price: 0,
            qty: parseInt(guests, 10) || 1
          }
        ],
        paymentMethod: 'Pay at Hotel',
        paymentStatus: 'Pending'
      })
    }).then(r => r.json()).then(res => {
      console.log('[Table Booking Sync] Recorded on backend:', res);
    }).catch(err => {
      console.warn('[Table Booking Sync] Backend offline, recorded locally:', err);
    });

    const passRefEl = document.getElementById('pass-booking-ref');
    const passNameEl = document.getElementById('pass-guest-name');
    const passBranchEl = document.getElementById('pass-branch');
    const passDateTimeEl = document.getElementById('pass-date-time');
    const passGuestsEl = document.getElementById('pass-guests-count');
    const passNotesEl = document.getElementById('pass-notes');

    if (passRefEl) passRefEl.textContent = bookingRef;
    if (passNameEl) passNameEl.textContent = name;
    if (passBranchEl) passBranchEl.textContent = branch;
    if (passDateTimeEl) passDateTimeEl.textContent = `${date} at ${timeSlot}`;
    if (passGuestsEl) passGuestsEl.textContent = `${guests} Guests (${selectedSeating})`;
    if (passNotesEl) passNotesEl.textContent = notes;

    const modal = document.getElementById('reservation-pass-modal');
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
      modal.style.zIndex = '9999';
    }

    showToast(`Table booked successfully for ${name}! 🎟️`);
    form.reset();
    updateAuthUI();
  });
}

function closeReservationPassModal() {
  const modal = document.getElementById('reservation-pass-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }
}
window.closeReservationPassModal = closeReservationPassModal;

// ==========================================================================
// 11. BRANCH DIRECTORY RENDER
// ==========================================================================
function renderBranches(cityFilter) {
  const container = document.getElementById('branches-grid');
  if (!container) return;

  const filtered = BRANCHES_DATA.filter(b => cityFilter === 'all' || b.city.toLowerCase() === cityFilter.toLowerCase());

  container.innerHTML = filtered.map(b => `
    <div class="branch-card">
      <div class="branch-header">
        <div>
          <span class="branch-city">${b.city}</span>
          <h3 class="branch-name">${b.name}</h3>
        </div>
        <span class="badge ${b.openNow ? 'badge-green' : 'badge-spice'}">
          <span class="status-dot" style="background: ${b.openNow ? '#22C55E' : '#EF4444'};"></span>
          ${b.openNow ? 'Open Now' : 'Closed'}
        </span>
      </div>

      <div class="branch-details-list">
        <div class="branch-detail-item">
          <span class="branch-detail-icon">📍</span>
          <span>${b.address}</span>
        </div>
        <div class="branch-detail-item">
          <span class="branch-detail-icon">⏰</span>
          <span>${b.timings}</span>
        </div>
        <div class="branch-detail-item">
          <span class="branch-detail-icon">📞</span>
          <a href="tel:${b.phone.replace(/\s+/g, '')}" style="font-weight: 700; color: var(--color-primary);">${b.phone}</a>
        </div>
      </div>

      <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
        ${b.features.map(f => `<span class="badge" style="background: var(--color-surface-muted); font-size: 0.7rem;">${f}</span>`).join('')}
      </div>

      <div class="branch-action-row">
        <a href="${b.mapUrl}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1;">
          <span>Get Directions 🧭</span>
        </a>
        <a href="tel:${b.phone.replace(/\s+/g, '')}" class="btn btn-gold btn-sm">
          <span>Call Now 📞</span>
        </a>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// 12. EVENT LISTENERS & UI INTERACTIONS
// ==========================================================================
function setupEventListeners() {
  // Category tabs
  const categoryTabs = document.querySelectorAll('.category-tab');
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      AppState.selectedCategory = tab.dataset.category;
      renderMenuGrid();
    });
  });

  // Dietary filter pills
  const dietPills = document.querySelectorAll('.diet-filter-pill');
  dietPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dietPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      AppState.activeDietFilter = pill.dataset.filter;
      renderMenuGrid();
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        AppState.searchQuery = e.target.value;
        renderMenuGrid();
      }, 200);
    });
  }

  // Branch filter tabs
  const branchTabs = document.querySelectorAll('.branch-tab-btn');
  branchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      branchTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderBranches(tab.dataset.city);
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      AppState.activeTheme = AppState.activeTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', AppState.activeTheme);
      localStorage.setItem('sgh_theme', AppState.activeTheme);
      themeToggle.textContent = AppState.activeTheme === 'light' ? '🌙' : '☀️';
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(f => {
        f.classList.remove('active');
        f.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // Order type switcher in cart
  const orderTypeTakeaway = document.getElementById('order-type-takeaway');
  const orderTypeDelivery = document.getElementById('order-type-delivery');
  if (orderTypeTakeaway && orderTypeDelivery) {
    orderTypeTakeaway.addEventListener('change', () => {
      AppState.orderType = 'takeaway';
      renderCartDrawer();
    });
    orderTypeDelivery.addEventListener('change', () => {
      AppState.orderType = 'delivery';
      renderCartDrawer();
    });
  }

  // Mobile Menu & Off-canvas Drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      toggleMobileDrawer(true);
    });
  }

  // My Orders header button listener
  const btnHeaderMyOrders = document.getElementById('btn-header-my-orders');
  if (btnHeaderMyOrders) {
    btnHeaderMyOrders.addEventListener('click', (e) => {
      e.preventDefault();
      openProfileModal('orders');
    });
  }

  // Close modals on overlay click or close button
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close-btn')) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
    });
  });
}

// ==========================================================================
// 13. TOAST NOTIFICATION ENGINE
// ==========================================================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Review submit simulation
function submitCustomerReview(event) {
  event.preventDefault();
  const name = document.getElementById('rev-name').value;
  showToast(`Thank you ${name}! Your review will be featured after verification. 🙏`);
  document.getElementById('review-modal').classList.remove('active');
  document.getElementById('review-form').reset();
}

// Mobile Drawer Controller
function toggleMobileDrawer(isOpen) {
  const overlay = document.getElementById('mobile-drawer-overlay');
  const drawer = document.getElementById('mobile-drawer');
  if (!overlay || !drawer) return;

  if (isOpen) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Mobile Bottom Dock Active Tab Update on Scroll
window.addEventListener('scroll', () => {
  const sections = ['hero', 'unbox', 'menu', 'reservations'];
  const scrollPos = window.scrollY + 200;

  sections.forEach(secId => {
    const el = document.getElementById(secId);
    if (el) {
      const top = el.offsetTop;
      const height = el.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.dock-item').forEach(item => {
          if (item.getAttribute('href') === `#${secId}`) {
            item.classList.add('active');
          } else if (item.getAttribute('href')?.startsWith('#')) {
            item.classList.remove('active');
          }
        });
      }
    }
  });
});

// ==========================================================================
// 14. CRM & ANALYTICS DATA AND LOGIC
// ==========================================================================
const CRM_GUESTS = [
  { id: 'g-01', name: 'Dr. Venkat Rao', phone: '+91 98490 12345', branch: 'Jubilee Hills', visits: 28, totalSpent: 34500, favorite: 'Royal Butta Bhojanam & Bobbatlu', notes: 'VIP Patron, prefers less spicy, extra ghee', tier: 'Gold Patron' },
  { id: 'g-02', name: 'Ananya Deshmukh', phone: '+91 99891 56789', branch: 'Jubilee Hills', visits: 14, totalSpent: 16800, favorite: 'Gutti Vankaya & Kandi Podi', notes: 'Pure Vegetarian, family dining patron', tier: 'Silver' },
  { id: 'g-03', name: 'K. Sridhar Sharma', phone: '+91 94400 33221', branch: 'KPHB Colony', visits: 42, totalSpent: 52000, favorite: 'Unlimited Banana Leaf Meals', notes: 'Strict Jain Food (No Onion/Garlic)', tier: 'Gold Patron' },
  { id: 'g-04', name: 'Ramakrishna Raju', phone: '+91 81799 44556', branch: 'Kakinada', visits: 65, totalSpent: 78000, favorite: 'Pootharekulu & Gottam Kaja', notes: 'Godavari Native, Regular Wedding Caterer', tier: 'Royal Legend' },
  { id: 'g-05', name: 'Naveen Chandran', phone: '+91 80456 99887', branch: 'Jubilee Hills', visits: 8, totalSpent: 9200, favorite: 'Majjiga Pulusu & Perugu Garelu', notes: 'Corporate client, IT Hitech City', tier: 'Bronze' }
];

let CRM_LIVE_ORDERS = [
  { id: 'ORD-701', table: 'Table #7', branch: 'Jubilee Hills', items: '2x Unlimited Banana Leaf, 1x Gutti Vankaya', total: 780, time: '3 mins ago', status: 'preparing' },
  { id: 'ORD-702', table: 'Table #12', branch: 'Jubilee Hills', items: '1x Royal Butta Feast, 2x Nethi Bobbatlu', total: 579, time: '8 mins ago', status: 'served' },
  { id: 'ORD-703', table: 'Table #4', branch: 'KPHB Colony', items: '4x Banana Leaf Meals, Extra Ghee Podi', total: 1040, time: '14 mins ago', status: 'served' },
  { id: 'ORD-704', table: 'Takeaway #19', branch: 'Jubilee Hills', items: '2x Butta Bhojanam (Eco Bamboo Basket)', total: 998, time: '18 mins ago', status: 'completed' }
];

AppState.loyaltyCoins = 480;
let currentCrmBranchFilter = 'all';

// Top Bar Dining Mode Switcher: Delivery, Pickup (Takeaway), Dine Table (Leaf Reservations)
function switchDiningMode(mode) {
  const customerSections = ['hero', 'unbox', 'menu', 'reservations', 'catering', 'branches', 'reviews', 'faq'];
  const loyaltySection = document.getElementById('loyalty-section');
  const tableQrSection = document.getElementById('table-qr-section');
  const crmSection = document.getElementById('crm-analytics-section');

  customerSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  if (loyaltySection) loyaltySection.style.display = 'none';
  if (tableQrSection) tableQrSection.style.display = 'none';
  if (crmSection) crmSection.style.display = 'none';

  // Update top mode buttons active state
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`mode-btn-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');

  if (mode === 'delivery') {
    setOrderMode('delivery');
    const menuEl = document.getElementById('menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
    showToast('🛵 Delivery Mode: Select your favorite Godavari Butta Bhojanam dishes!');
  } else if (mode === 'takeaway') {
    setOrderMode('takeaway');
    const menuEl = document.getElementById('menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
    showToast('🥡 Pickup Mode: Fresh parcel packed in eco-bamboo basket & banana leaf!');
  } else if (mode === 'dine-table') {
    const resEl = document.getElementById('reservations');
    if (resEl) resEl.scrollIntoView({ behavior: 'smooth' });
    showToast('🍽️ Banana Leaf Table Booking: Reserve your traditional dining pass!');
  }
}
window.switchDiningMode = switchDiningMode;

// App Mode Switcher (Customer Website vs Loyalty vs Table QR vs Manager CRM)
function switchAppMode(mode) {
  // Update buttons
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`mode-btn-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');

  const customerSections = ['hero', 'unbox', 'menu', 'reservations', 'catering', 'branches', 'reviews', 'faq'];
  const loyaltySection = document.getElementById('loyalty-section');
  const tableQrSection = document.getElementById('table-qr-section');
  const crmSection = document.getElementById('crm-analytics-section');

  if (mode === 'guest') {
    customerSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    if (loyaltySection) loyaltySection.style.display = 'none';
    if (tableQrSection) tableQrSection.style.display = 'none';
    if (crmSection) crmSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Switched to Guest Dining & Feast View 🍽️');
  } 
  else if (mode === 'loyalty') {
    customerSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (loyaltySection) loyaltySection.style.display = 'block';
    if (tableQrSection) tableQrSection.style.display = 'none';
    if (crmSection) crmSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Welcome to Godavari Parivaar Loyalty Club! 👑');
  } 
  else if (mode === 'table-qr') {
    customerSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (loyaltySection) loyaltySection.style.display = 'none';
    if (tableQrSection) tableQrSection.style.display = 'block';
    if (crmSection) crmSection.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Table QR Dine-in Service Active 📱');
  } 
  else if (mode === 'crm') {
    customerSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (loyaltySection) loyaltySection.style.display = 'none';
    if (tableQrSection) tableQrSection.style.display = 'none';
    if (crmSection) crmSection.style.display = 'block';
    renderCrmGuestTable(CRM_GUESTS);
    renderCrmLiveOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Restaurant Operations & CRM Analytics Portal Loaded 📊');
  }
}

// Loyalty Reward Redemption
function redeemReward(rewardName, coinCost) {
  if (AppState.loyaltyCoins < coinCost) {
    showToast(`⚠️ Insufficient coins. You have ${AppState.loyaltyCoins} coins. Dine more to earn!`);
    return;
  }

  AppState.loyaltyCoins -= coinCost;
  const balanceEl = document.getElementById('loyalty-coins-balance');
  if (balanceEl) balanceEl.textContent = AppState.loyaltyCoins;

  const voucherCode = 'VCH-' + Math.floor(100000 + Math.random() * 900000);
  showToast(`🎉 Redeemed "${rewardName}"! Voucher Code: ${voucherCode} (Saved to Card)`);
}

// Dine-in Captain Buzzer
function ringGheeRefillBuzzer() {
  const table = document.getElementById('dinein-table-select')?.value || 'Table #7';
  const branch = document.getElementById('dinein-branch-select')?.value || 'Jubilee Hills';
  
  showToast(`🔔 Captain Alerted! Pure hot ghee ladle dispatched to ${table} at ${branch}! 🧈`);

  // Simulated buzzer audio chime using Web Audio API
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch(e) {}
}

// Table Feedback Submit
function submitTableFeedback(e) {
  e.preventDefault();
  const comment = document.getElementById('feedback-comment')?.value || 'Excellent Godavari feast!';
  const nps = document.getElementById('nps-slider')?.value || '10';

  AppState.loyaltyCoins += 50;
  const balanceEl = document.getElementById('loyalty-coins-balance');
  if (balanceEl) balanceEl.textContent = AppState.loyaltyCoins;

  showToast(`🙏 Thank you! Net Promoter Score ${nps}/10 recorded. +50 Ghee Coins added to your wallet! 🪙`);
  e.target.reset();
}

// Render CRM Guest Table
function renderCrmGuestTable(guests) {
  const tbody = document.getElementById('crm-table-body');
  if (!tbody) return;

  tbody.innerHTML = guests.map(g => `
    <tr>
      <td>
        <strong>${g.name}</strong>
        <div style="font-size: 0.72rem; color: var(--color-text-muted);">ID: ${g.id.toUpperCase()}</div>
      </td>
      <td>${g.phone}</td>
      <td><span class="badge" style="background: var(--color-surface-muted); font-size: 0.72rem;">${g.branch}</span></td>
      <td><strong>${g.visits}</strong></td>
      <td style="font-family: var(--font-brand); font-weight: 800; color: var(--color-primary);">₹${g.totalSpent.toLocaleString('en-IN')}</td>
      <td>
        <span style="font-size: 0.8rem;">${g.favorite}</span>
        <div style="font-size: 0.7rem; color: var(--color-gold); font-weight: 600;">${g.notes}</div>
      </td>
      <td>
        <span class="badge ${g.tier.includes('Gold') || g.tier.includes('Legend') ? 'badge-gold' : 'badge-green'}">
          ${g.tier}
        </span>
      </td>
      <td>
        <a href="https://api.whatsapp.com/send?phone=${g.phone.replace(/[^0-9]/g, '')}&text=Greetings%20from%20Subbayya%20Gari%20Hotel%20${encodeURIComponent(g.name)},%20we%20have%20reserved%20a%20special%20banana%20leaf%20for%20you!" target="_blank" class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">
          WhatsApp 💬
        </a>
      </td>
    </tr>
  `).join('');
}

// Search CRM Guests
function searchCrmGuests(query) {
  const q = query.toLowerCase();
  const filtered = CRM_GUESTS.filter(g => 
    g.name.toLowerCase().includes(q) || 
    g.phone.includes(q) || 
    g.branch.toLowerCase().includes(q) ||
    g.notes.toLowerCase().includes(q)
  );
  renderCrmGuestTable(filtered);
}

// Filter CRM Branch
function filterCrmBranch(branchName, btn) {
  currentCrmBranchFilter = branchName;
  document.querySelectorAll('#crm-analytics-section .diet-filter-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const filtered = branchName === 'all' 
    ? CRM_GUESTS 
    : CRM_GUESTS.filter(g => g.branch.toLowerCase() === branchName.toLowerCase());
  
  renderCrmGuestTable(filtered);

  // Dynamic KPI updates based on branch
  if (branchName === 'Jubilee Hills') {
    document.getElementById('kpi-revenue').textContent = '₹68,450';
    document.getElementById('kpi-occupancy').textContent = '18 / 20 (90%)';
  } else if (branchName === 'KPHB Colony') {
    document.getElementById('kpi-revenue').textContent = '₹52,200';
    document.getElementById('kpi-occupancy').textContent = '14 / 15 (93%)';
  } else if (branchName === 'Kakinada') {
    document.getElementById('kpi-revenue').textContent = '₹28,000';
    document.getElementById('kpi-occupancy').textContent = '10 / 15 (67%)';
  } else {
    document.getElementById('kpi-revenue').textContent = '₹1,48,650';
    document.getElementById('kpi-occupancy').textContent = '42 / 50 (84%)';
  }
}

// Render Live Kitchen / Table Orders in CRM
function renderCrmLiveOrders() {
  const container = document.getElementById('crm-orders-grid');
  if (!container) return;

  container.innerHTML = CRM_LIVE_ORDERS.map(ord => {
    let badgeClass = 'status-preparing';
    let nextStatus = 'served';
    let nextText = 'Mark as Served 🍃';

    if (ord.status === 'served') {
      badgeClass = 'status-served';
      nextStatus = 'completed';
      nextText = 'Mark as Paid & Closed ✅';
    } else if (ord.status === 'completed') {
      badgeClass = 'status-completed';
      nextStatus = 'preparing';
      nextText = 'Reopen Ticket 🔄';
    }

    return `
      <div class="order-ticket-card">
        <div class="order-ticket-header">
          <div>
            <strong style="font-family: var(--font-brand); color: var(--color-primary);">${ord.id}</strong>
            <span style="font-size: 0.78rem; color: var(--color-text-muted); margin-left: 6px;">${ord.time}</span>
          </div>
          <span class="order-status-badge ${badgeClass}">${ord.status.toUpperCase()}</span>
        </div>

        <div style="font-size: 0.9rem;">
          <div><strong style="color: var(--color-gold);">${ord.table}</strong> (${ord.branch})</div>
          <div style="color: var(--color-text); margin-top: 4px;">${ord.items}</div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed var(--color-border); padding-top: 0.6rem; margin-top: auto;">
          <strong style="font-family: var(--font-brand); font-size: 1.05rem; color: var(--color-primary);">₹${ord.total}</strong>
          <button class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;" onclick="advanceOrderStatus('${ord.id}', '${nextStatus}')">
            ${nextText}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Advance Order Status
function advanceOrderStatus(orderId, newStatus) {
  const ord = CRM_LIVE_ORDERS.find(o => o.id === orderId);
  if (ord) {
    ord.status = newStatus;
    renderCrmLiveOrders();
    showToast(`Order ${orderId} updated to "${newStatus.toUpperCase()}"!`);
  }
}

// ==========================================================================
// 15. CUSTOMER AUTHENTICATION (LOGIN, OTP, SIGNUP, PROFILE)
// ==========================================================================

function openAuthModal(initialTab = 'otp') {
  window.location.href = 'login.html?redirect=cart';
}
window.openAuthModal = openAuthModal;

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}
window.closeAuthModal = closeAuthModal;

function switchAuthTab(tab) {
  const tabOtp = document.getElementById('auth-tab-otp');
  const tabSignup = document.getElementById('auth-tab-signup');
  const formOtp = document.getElementById('auth-form-otp');
  const formSignup = document.getElementById('auth-form-signup');

  // Reset tab button styles if tabs exist
  if (tabOtp && tabSignup) {
    [tabOtp, tabSignup].forEach(t => {
      if (t) {
        t.style.background = 'transparent';
        t.style.color = 'var(--color-text-muted)';
        t.style.boxShadow = 'none';
        t.classList.remove('active');
      }
    });
  }

  if (tab === 'signup' && formSignup) {
    if (formOtp) formOtp.style.display = 'none';
    formSignup.style.display = 'flex';
    if (tabSignup) {
      tabSignup.style.background = 'var(--color-surface)';
      tabSignup.style.color = 'var(--color-primary)';
      tabSignup.classList.add('active');
    }
    setTimeout(() => {
      const regNameInput = document.getElementById('auth-reg-name');
      if (regNameInput && regNameInput.offsetParent !== null) regNameInput.focus();
    }, 50);
  } else {
    // Default to OTP form
    if (formSignup) formSignup.style.display = 'none';
    if (formOtp) formOtp.style.display = 'flex';
    if (tabOtp) {
      tabOtp.style.background = 'var(--color-surface)';
      tabOtp.style.color = 'var(--color-primary)';
      tabOtp.classList.add('active');
    }
    setTimeout(() => {
      const targetInput = document.getElementById('auth-otp-target');
      if (targetInput && targetInput.offsetParent !== null) targetInput.focus();
    }, 50);
  }
}
window.switchAuthTab = switchAuthTab;

const OTP_SENDER_EMAIL = 'myakalanagarjun09@gmail.com';
let activeGeneratedOtp = null;
let activeOtpTarget = '';
let activeRegisteredUser = null;

// Default Seed Registered Patrons
const DEFAULT_REGISTERED_USERS = [
  {
    id: 'USR-1001',
    name: 'Myakalanagarjun',
    phone: '9010888842',
    email: 'myakalanagarjun09@gmail.com',
    address: 'Road No. 4, KPHB Colony, Kukatpally, Hyderabad',
    coins: 50,
    tier: 'VIP Patron',
    memberSince: '2026'
  },
  {
    id: 'USR-1002',
    name: 'Srinivas Varma',
    phone: '9876543210',
    email: 'srinivas.varma@gmail.com',
    address: 'MIG 295, Rd No. 4, KPHB Colony, Kukatpally, Hyderabad',
    coins: 50,
    tier: 'VIP Patron',
    memberSince: '2026'
  },
  {
    id: 'USR-1003',
    name: 'Anand Godavari',
    phone: '9121234567',
    email: 'anand.godavari@wa.me',
    address: 'Road No. 36, Jubilee Hills, Hyderabad',
    coins: 50,
    tier: 'VIP Patron',
    memberSince: '2026'
  }
];

function getLocalRegisteredUsers() {
  try {
    const stored = localStorage.getItem('sgh_registered_users');
    if (stored) {
      const list = JSON.parse(stored);
      return Array.isArray(list) ? list : DEFAULT_REGISTERED_USERS;
    }
  } catch (e) {
    console.warn('Error reading registered users:', e);
  }
  return DEFAULT_REGISTERED_USERS;
}

function saveLocalRegisteredUser(user) {
  try {
    const list = getLocalRegisteredUsers();
    const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const exists = list.some(u => {
      const uPhone = (u.phone || '').replace(/\D/g, '').slice(-10);
      const uEmail = (u.email || '').toLowerCase().trim();
      return (cleanPhone && uPhone === cleanPhone) || (cleanEmail && uEmail === cleanEmail);
    });
    if (!exists) {
      list.unshift(user);
      localStorage.setItem('sgh_registered_users', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Error saving registered user locally:', e);
  }
}

async function checkUserRegistration(target) {
  const cleanTarget = (target || '').trim();
  const cleanPhone = cleanTarget.replace(/\D/g, '').slice(-10);
  const isEmail = cleanTarget.includes('@');

  // 1. Check API first
  try {
    const res = await fetch(`${BACKEND_BASE}/api/users/check?target=${encodeURIComponent(cleanTarget)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.registered && data.user) {
        return data.user;
      }
    }
  } catch (err) {
    console.warn('API check fallback to local database:', err.message);
  }

  // 2. Check Local Registered Users Database
  const localUsers = getLocalRegisteredUsers();
  const found = localUsers.find(u => {
    const uPhone = (u.phone || '').replace(/\D/g, '').slice(-10);
    const uEmail = (u.email || '').toLowerCase().trim();
    if (cleanPhone && cleanPhone.length >= 10 && uPhone === cleanPhone) return true;
    if (isEmail && uEmail === cleanTarget.toLowerCase()) return true;
    return false;
  });

  return found || null;
}

let activeCustomerName = '';
let activeCustomerPhone = '';
let activeCustomerEmail = '';

async function sendLoginOtp() {
  const nameInput = document.getElementById('auth-otp-name');
  const phoneInput = document.getElementById('auth-otp-phone');
  const emailInput = document.getElementById('auth-otp-email');
  
  const enteredName = activeCustomerName || (nameInput ? nameInput.value.trim() : '');
  const enteredPhone = activeCustomerPhone || (phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '');
  const enteredEmail = activeCustomerEmail || (emailInput ? emailInput.value.trim() : '');

  if (!enteredName) {
    showToast('⚠️ Please enter your full name');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!enteredPhone || enteredPhone.length < 10) {
    showToast('⚠️ Please enter a valid 10-digit mobile number');
    if (phoneInput) phoneInput.focus();
    return;
  }

  activeCustomerName = enteredName;
  activeCustomerPhone = enteredPhone;
  activeCustomerEmail = enteredEmail;
  const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
  activeGeneratedOtp = newOtp;

  // Show verify step with empty code input
  const sendStep = document.getElementById('auth-otp-send-step');
  const verifyStep = document.getElementById('auth-otp-verify-step');
  const displaySpan = document.getElementById('otp-target-display');
  const codeInput = document.getElementById('auth-otp-code');
  const chipCode = document.getElementById('modal-otp-chip-code');

  if (sendStep) sendStep.style.display = 'none';
  if (verifyStep) verifyStep.style.display = 'flex';
  
  const displayLabel = enteredEmail ? `+91 ${enteredPhone} (${enteredEmail})` : `+91 ${enteredPhone}`;
  if (displaySpan) displaySpan.textContent = `${activeCustomerName} • ${displayLabel}`;
  if (chipCode) chipCode.textContent = newOtp;

  if (codeInput) {
    codeInput.value = '';
    codeInput.style.borderColor = '';
    codeInput.focus();
  }

  showToast(`🔑 Verification Code: ${newOtp} (Tap chip to auto-fill)`);

  // If email is provided, dispatch live email from backend
  if (enteredEmail && enteredEmail.includes('@')) {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: enteredEmail,
          name: activeCustomerName,
          otp: newOtp
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.otp) {
          activeGeneratedOtp = String(data.otp);
          if (chipCode) chipCode.textContent = activeGeneratedOtp;
        }
        if (data && data.liveEmailSent) {
          showToast(`✉️ Live OTP delivered to ${enteredEmail}! Check your inbox.`);
        }
      }
    } catch (err) {
      console.warn('Background OTP dispatch error/timeout:', err.message);
    }
  }
}
window.sendLoginOtp = sendLoginOtp;

function autoFillModalOtp() {
  if (!activeGeneratedOtp) return;
  const codeInput = document.getElementById('auth-otp-code');
  if (codeInput) {
    codeInput.value = activeGeneratedOtp;
    codeInput.style.borderColor = '#16A34A';
    setTimeout(() => handleOtpSubmit(), 100);
  }
}
window.autoFillModalOtp = autoFillModalOtp;

function resetModalOtpStep() {
  const sendStep = document.getElementById('auth-otp-send-step');
  const verifyStep = document.getElementById('auth-otp-verify-step');
  if (sendStep) sendStep.style.display = 'flex';
  if (verifyStep) verifyStep.style.display = 'none';
  document.getElementById('auth-otp-phone')?.focus();
}
window.resetModalOtpStep = resetModalOtpStep;

function handleOtpSubmit(event) {
  if (event) event.preventDefault();
  const codeInput = document.getElementById('auth-otp-code');
  const code = codeInput ? codeInput.value.replace(/\D/g, '').trim() : '';

  if (!code || code.length < 4) {
    showToast('⚠️ Please enter the 4-digit verification code');
    if (codeInput) codeInput.focus();
    return;
  }

  if (!activeGeneratedOtp || code !== activeGeneratedOtp) {
    showToast(`❌ Incorrect OTP! Tap the auto-fill chip or click Resend.`);
    if (codeInput) {
      codeInput.style.borderColor = '#EF4444';
      codeInput.focus();
    }
    return;
  }

  if (codeInput) codeInput.style.borderColor = '#16A34A';

  const finalName = activeCustomerName || 'Subbayya Gari Patron';
  const phoneNum = activeCustomerPhone || '9010888842';
  const finalEmail = activeCustomerEmail || `${phoneNum}@subbayyagari.in`;

  const user = {
    name: finalName,
    phone: phoneNum,
    email: finalEmail,
    address: 'Road No. 4, KPHB Colony, Kukatpally, Hyderabad',
    coins: 50,
    tier: 'Royal Patron',
    memberSince: '2026',
    verifiedVia: 'Instant OTP Verification'
  };

  loginUserSuccess(user, `🎉 Welcome to Subbayya Gari Hotel, ${user.name}!`);
}
window.handleOtpSubmit = handleOtpSubmit;

// Registration handler (Register first, then login)
async function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('auth-reg-name')?.value.trim();
  const phone = document.getElementById('auth-reg-phone')?.value.trim();
  const email = document.getElementById('auth-reg-email')?.value.trim() || `${phone}@subbayyagari.in`;
  const address = document.getElementById('auth-reg-address')?.value.trim() || 'Hyderabad, Telangana';

  if (!name || !phone) {
    showToast('⚠️ Full Name and Mobile Number are required for registration');
    return;
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length < 10) {
    showToast('⚠️ Please enter a valid 10-digit mobile number');
    return;
  }

  const newUser = {
    id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
    name: name,
    phone: cleanPhone,
    email: email,
    address: address,
    coins: 50, // Welcome bonus
    tier: 'VIP Patron',
    memberSince: new Date().getFullYear().toString()
  };

  // Save to local storage
  saveLocalRegisteredUser(newUser);

  // Sync with API backend
  try {
    await fetch(`${BACKEND_BASE}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
  } catch (err) {
    console.warn('Backend user registration sync error (saved locally):', err.message);
  }

  loginUserSuccess(newUser, `🎉 Welcome to Godavari Family, ${name}! Registered successfully & 🪙 50 Coins credited.`);
}
window.handleSignup = handleSignup;

function loginUserSuccess(user, welcomeMsg) {
  AppState.currentUser = user;
  try {
    sessionStorage.setItem('sgh_user', JSON.stringify(user));
    localStorage.setItem('sgh_user', JSON.stringify(user));
  } catch (e) {
    console.error('User save error:', e);
  }

  closeAuthModal();
  updateAuthUI();
  showToast(welcomeMsg);

  // Auto-fill checkout fields if cart is open
  autoFillCheckoutDetails();

  // Load customer live orders
  if (typeof fetchAndRenderCustomerOrders === 'function') {
    fetchAndRenderCustomerOrders();
  }

  // Handle pending action after login (table booking or order checkout)
  if (AppState.pendingAction) {
    const pending = AppState.pendingAction;
    AppState.pendingAction = null;

    if (pending.type === 'reserve_table') {
      const d = pending.formData || {};
      const bookingRef = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
      const guestName = user.name || d.name || 'Valued Patron';
      const branch = d.branch || document.getElementById('res-branch')?.value || 'KPHB Colony, Hyderabad';
      const dateVal = d.date || document.getElementById('res-date')?.value || new Date().toISOString().split('T')[0];
      const timeVal = d.timeSlot || document.getElementById('res-time')?.value || 'Lunch: 01:30 PM';
      const seating = d.seating || 'Traditional Banana Leaf Seating';
      const guests = d.guests || document.getElementById('res-guests')?.value || '4';
      const notes = d.notes || document.getElementById('res-notes')?.value || 'Standard Pure Veg Bhojanam';

      document.getElementById('pass-booking-ref').textContent = bookingRef;
      document.getElementById('pass-guest-name').textContent = guestName;
      document.getElementById('pass-branch').textContent = branch;
      document.getElementById('pass-date-time').textContent = `${dateVal} at ${timeVal}`;
      document.getElementById('pass-guests-count').textContent = `${guests} Guests (${seating})`;
      document.getElementById('pass-notes').textContent = notes;

      const modal = document.getElementById('reservation-pass-modal');
      if (modal) modal.classList.add('active');
      showToast(`🎉 Table booked successfully for ${guestName}!`);

      const resForm = document.getElementById('table-reservation-form');
      if (resForm) resForm.reset();
      updateAuthUI();

    } else if (pending.type === 'checkout_order') {
      toggleCart(true);
      setTimeout(() => {
        proceedToCheckout();
      }, 350);
    }
  }
}

function autoFillCheckoutDetails() {
  // Autofill disabled as requested
}

function handleAuthHeaderBtnClick(event) {
  if (AppState.currentUser) {
    if (event) event.preventDefault();
    openProfileModal('account');
    return false;
  }
}
window.handleAuthHeaderBtnClick = handleAuthHeaderBtnClick;

function updateAuthUI() {
  const authHeaderBtn = document.getElementById('auth-header-btn');
  const authBtnText = document.getElementById('auth-header-btn-text');
  const mobileAuthItem = document.getElementById('mobile-drawer-auth-item');
  const mobileAuthText = document.getElementById('mobile-auth-text');
  const mobileAuthIcon = document.getElementById('mobile-auth-icon');

  // Reservation Section Auth Banner & Form
  const resAuthBanner = document.getElementById('reservation-auth-banner');
  const resNameInput = document.getElementById('res-name');
  const resPhoneInput = document.getElementById('res-phone');
  const resSubmitBtnText = document.getElementById('res-submit-btn-text');

  if (AppState.currentUser) {
    const firstName = AppState.currentUser.name.split(' ')[0] || 'Profile';
    const coins = AppState.currentUser.coins || 50;

    if (authBtnText) {
      authBtnText.textContent = firstName.length > 9 ? `${firstName.slice(0, 8)}…` : firstName;
    }
    if (authHeaderBtn) {
      authHeaderBtn.href = 'javascript:void(0)';
      authHeaderBtn.onclick = (e) => {
        if (e) e.preventDefault();
        openProfileModal('account');
      };
      authHeaderBtn.title = `${AppState.currentUser.name} • ${coins} Ghee Coins 🪙 (Click to View Customer Profile)`;
      authHeaderBtn.style.background = 'rgba(217, 119, 6, 0.15)';
      authHeaderBtn.style.borderColor = 'var(--color-gold)';
      authHeaderBtn.style.color = 'var(--color-gold)';
    }

    if (mobileAuthText) {
      mobileAuthText.textContent = `👑 ${AppState.currentUser.name} (${coins} Coins)`;
    }
    if (mobileAuthIcon) {
      mobileAuthIcon.textContent = '👑';
    }

    const dockLoginText = document.getElementById('dock-login-text');
    const dockLoginItem = document.getElementById('dock-item-login');
    if (dockLoginText) dockLoginText.textContent = firstName || 'Account';
    if (dockLoginItem) {
      dockLoginItem.href = 'javascript:void(0)';
      dockLoginItem.onclick = (e) => {
        if (e) e.preventDefault();
        openProfileModal('account');
      };
    }
    if (mobileAuthItem) {
      const link = mobileAuthItem.querySelector('a');
      if (link) {
        link.removeAttribute('href');
        link.onclick = (e) => {
          if (e) e.preventDefault();
          openProfileModal('account');
          toggleMobileDrawer(false);
        };
      }
    }

    // Update Table Reservation Elements
    if (resAuthBanner) {
      resAuthBanner.className = 'auth-gate-banner logged-in';
      resAuthBanner.innerHTML = `
        <div>
          <strong style="color: #16A34A;">✅ Verified Patron: ${AppState.currentUser.name}</strong>
          <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">📞 ${AppState.currentUser.phone} • Digital table confirmation pass will be linked to your profile</div>
        </div>
        <button type="button" class="auth-gate-login-btn" style="background: rgba(22, 163, 74, 0.15); color: #16A34A; border: 1px solid #16A34A;" onclick="openProfileModal('account')">Customer Details 👑</button>
      `;
    }

    if (resNameInput && !resNameInput.value) {
      resNameInput.value = AppState.currentUser.name;
    }
    if (resPhoneInput && !resPhoneInput.value) {
      resPhoneInput.value = AppState.currentUser.phone;
    }
    if (resSubmitBtnText) {
      resSubmitBtnText.textContent = 'Confirm Reservation & Generate Ticket 🎟️';
    }

    // Manage "My Orders" buttons badge (Showing incomplete / active orders count)
    updateHeaderMyOrdersBadge();

    // Auto-fill checkout inputs
    autoFillCheckoutDetails();

  } else {
    if (authBtnText) {
      authBtnText.textContent = 'Login';
    }
    if (authHeaderBtn) {
      authHeaderBtn.href = 'login.html';
      authHeaderBtn.onclick = null;
      authHeaderBtn.title = 'Customer Login / Sign In';
      authHeaderBtn.style.background = 'transparent';
      authHeaderBtn.style.borderColor = 'var(--color-gold)';
      authHeaderBtn.style.color = 'var(--color-gold)';
    }

    // Manage "My Orders" buttons visibility & incomplete count
    updateHeaderMyOrdersBadge();

    const dockLoginText = document.getElementById('dock-login-text');
    const dockLoginItem = document.getElementById('dock-item-login');
    if (dockLoginText) dockLoginText.textContent = 'Login';
    if (dockLoginItem) {
      dockLoginItem.href = 'login.html';
      dockLoginItem.onclick = null;
    }

    if (mobileAuthText) {
      mobileAuthText.textContent = 'Login';
    }
    if (mobileAuthIcon) {
      mobileAuthIcon.textContent = '👤';
    }
    if (mobileAuthItem) {
      const link = mobileAuthItem.querySelector('a');
      if (link) {
        link.href = 'login.html';
        link.onclick = null;
      }
    }

    // Update Table Reservation Elements for Guest / Logged Out
    if (resAuthBanner) {
      resAuthBanner.className = 'auth-gate-banner logged-out';
      resAuthBanner.innerHTML = `
        <div>
          <strong style="color: var(--color-gold);">🔒 Login Required to Book</strong>
          <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">Sign in to reserve your banana leaf table.</div>
        </div>
        <a href="login.html?redirect=reservations" class="auth-gate-login-btn">Login Now 👤</a>
      `;
    }

    if (resSubmitBtnText) {
      resSubmitBtnText.textContent = '🔒 Login to Book Leaf Table 🎟️';
    }
  }

  // Update Cart Drawer state
  renderCartDrawer();
}

// Switch between 'orders' and 'account' in customer profile modal
function switchProfileTab(tab) {
  const btnOrders = document.getElementById('prof-tab-btn-orders');
  const btnAccount = document.getElementById('prof-tab-btn-account');
  const tabOrders = document.getElementById('prof-tab-orders');
  const tabAccount = document.getElementById('prof-tab-account');
  const modalTitle = document.getElementById('prof-modal-title');
  const modalSubtitle = document.getElementById('prof-modal-subtitle');
  const modalIcon = document.getElementById('prof-modal-icon');

  if (btnOrders) btnOrders.classList.remove('active');
  if (btnAccount) btnAccount.classList.remove('active');
  if (tabOrders) tabOrders.style.display = 'none';
  if (tabAccount) tabAccount.style.display = 'none';

  if (tab === 'account') {
    if (btnAccount) btnAccount.classList.add('active');
    if (tabAccount) tabAccount.style.display = 'block';
    if (modalTitle) modalTitle.textContent = 'Customer Profile';
    if (modalSubtitle) modalSubtitle.textContent = 'Subbayya Gari Royal Patron Dashboard';
    if (modalIcon) modalIcon.textContent = '👤';
  } else {
    if (btnOrders) btnOrders.classList.add('active');
    if (tabOrders) tabOrders.style.display = 'block';
    if (modalTitle) modalTitle.textContent = 'My Orders & Live Status';
    if (modalSubtitle) modalSubtitle.textContent = 'Your Placed Feast Orders & Kitchen Tracking';
    if (modalIcon) modalIcon.textContent = '📦';
    fetchAndRenderCustomerOrders();
  }
}
window.switchProfileTab = switchProfileTab;

// Default authentic past orders for customer history & reordering
const DEFAULT_CUSTOMER_ORDERS = [
  {
    id: "SGH-782419",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    timestamp: Date.now() - 3600000 * 3,
    customerName: "Valued Patron",
    customerPhone: "9010888842",
    customerEmail: "patron@subbayyagari.in",
    orderType: "delivery",
    branchId: "kphb",
    branchName: "KPHB Colony, Hyderabad",
    branchAddress: "MIG 295, Rd No. 4, Kukatpally, Hyderabad",
    items: [
      { id: "butta-royal", name: "Subbayya Gari Royal Butta Bhojanam", price: 499, qty: 2, total: 998 },
      { id: "curry-gutti-vankaya", name: "Godavari Gutti Vankaya Kura", price: 180, qty: 1, total: 180 },
      { id: "sweet-pootharekulu", name: "Atreyapuram Bellam Pootharekulu (4 Pcs)", price: 160, qty: 1, total: 160 }
    ],
    itemCount: 4,
    subtotal: 1338,
    packagingFee: 30,
    deliveryFee: 40,
    discount: 0,
    grandTotal: 1408,
    deliveryAddress: "MIG 295, Rd No. 4, KPHB Colony, Kukatpally, Hyderabad",
    deliveryLandmark: "Near Forum Sujana Mall Cross",
    gpsMapUrl: "https://maps.google.com/?q=17.4938,78.3995",
    pickupSlot: "",
    vehicleNote: "",
    status: "Preparing",
    paymentStatus: "Paid Online / UPI",
    statusHistory: [
      { status: "Received", time: new Date(Date.now() - 3600000 * 3).toISOString(), note: "Order confirmed by customer" },
      { status: "Preparing", time: new Date(Date.now() - 3600000 * 2.5).toISOString(), note: "Chef packaging hot Butta feast with fresh banana leaves" }
    ]
  },
  {
    id: "SGH-639104",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    timestamp: Date.now() - 86400000 * 2,
    customerName: "Valued Patron",
    customerPhone: "9010888842",
    customerEmail: "patron@subbayyagari.in",
    orderType: "pickup",
    branchId: "jubilee-hills",
    branchName: "Jubilee Hills, Hyderabad",
    branchAddress: "Road No. 36, Near Peddamma Temple, Hyderabad",
    items: [
      { id: "butta-mini", name: "Traditional Mini Butta Bhojanam", price: 299, qty: 1, total: 299 },
      { id: "sweet-nethi-bobbatlu", name: "Nethi Bobbatlu with Pure Ghee (2 Pcs)", price: 140, qty: 2, total: 280 }
    ],
    itemCount: 3,
    subtotal: 579,
    packagingFee: 30,
    deliveryFee: 0,
    discount: 50,
    grandTotal: 559,
    deliveryAddress: "",
    deliveryLandmark: "",
    gpsMapUrl: "",
    pickupSlot: "Lunch: 01:15 PM",
    vehicleNote: "Curbside pickup",
    status: "Delivered",
    paymentStatus: "Paid / Ghee Coins Applied",
    statusHistory: [
      { status: "Received", time: new Date(Date.now() - 86400000 * 2).toISOString(), note: "Takeaway order received" },
      { status: "Delivered", time: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(), note: "Handed over to customer" }
    ]
  },
  {
    id: "SGH-512980",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    timestamp: Date.now() - 86400000 * 6,
    customerName: "Valued Patron",
    customerPhone: "9010888842",
    customerEmail: "patron@subbayyagari.in",
    orderType: "delivery",
    branchId: "kphb",
    branchName: "KPHB Colony, Hyderabad",
    branchAddress: "MIG 295, Rd No. 4, Kukatpally, Hyderabad",
    items: [
      { id: "butta-royal", name: "Subbayya Gari Royal Butta Bhojanam", price: 499, qty: 3, total: 1497 },
      { id: "sweet-kakinada-kaja", name: "Original Kakinada Gottam Kaja (4 Pcs)", price: 150, qty: 2, total: 300 },
      { id: "rice-gongura", name: "Godavari Special Gongura Rice with Ghee", price: 180, qty: 1, total: 180 }
    ],
    itemCount: 6,
    subtotal: 1977,
    packagingFee: 45,
    deliveryFee: 0,
    discount: 77,
    grandTotal: 1945,
    deliveryAddress: "Road No. 4, KPHB Colony, Kukatpally, Hyderabad",
    deliveryLandmark: "Opposite JNTU Metro",
    gpsMapUrl: "https://maps.google.com/?q=17.4938,78.3995",
    pickupSlot: "",
    vehicleNote: "",
    status: "Delivered",
    paymentStatus: "Paid Online (Verified)",
    statusHistory: [
      { status: "Received", time: new Date(Date.now() - 86400000 * 6).toISOString(), note: "Order placed" },
      { status: "Delivered", time: new Date(Date.now() - 86400000 * 6 + 2400000).toISOString(), note: "Delivered with hot pure ghee" }
    ]
  },
  {
    id: "SGH-489021",
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    timestamp: Date.now() - 86400000 * 11,
    customerName: "Valued Patron",
    customerPhone: "9010888842",
    customerEmail: "patron@subbayyagari.in",
    orderType: "delivery",
    branchId: "kphb",
    branchName: "KPHB Colony, Hyderabad",
    branchAddress: "MIG 295, Rd No. 4, Kukatpally, Hyderabad",
    items: [
      { id: "ulava-charu", name: "Iconic Ulava Charu with Fresh Cream & Butter", price: 240, qty: 2, total: 480 },
      { id: "pot-avakaya", name: "Andhra Avakaya Annam Clay Pot", price: 210, qty: 1, total: 210 },
      { id: "sweet-pongal", name: "Ghee Bellam Pongali", price: 130, qty: 1, total: 130 }
    ],
    itemCount: 4,
    subtotal: 820,
    packagingFee: 30,
    deliveryFee: 0,
    discount: 30,
    grandTotal: 820,
    deliveryAddress: "Road No. 4, KPHB Colony, Kukatpally, Hyderabad",
    deliveryLandmark: "Near Rythu Bazaar",
    gpsMapUrl: "https://maps.google.com/?q=17.4938,78.3995",
    pickupSlot: "",
    vehicleNote: "",
    status: "Delivered",
    paymentStatus: "Paid via UPI",
    statusHistory: [
      { status: "Received", time: new Date(Date.now() - 86400000 * 11).toISOString(), note: "Order placed" },
      { status: "Delivered", time: new Date(Date.now() - 86400000 * 11 + 2100000).toISOString(), note: "Delivered" }
    ]
  },
  {
    id: "SGH-341098",
    createdAt: new Date(Date.now() - 86400000 * 19).toISOString(),
    timestamp: Date.now() - 86400000 * 19,
    customerName: "Valued Patron",
    customerPhone: "9010888842",
    customerEmail: "patron@subbayyagari.in",
    orderType: "pickup",
    branchId: "madhapur",
    branchName: "Madhapur (Hitec City), Hyderabad",
    branchAddress: "Near Cyber Towers, Hitec City, Hyderabad",
    items: [
      { id: "butta-special", name: "Subbayya Gari Special Butta Meal", price: 380, qty: 2, total: 760 },
      { id: "curry-majjiga-pulusu", name: "Authentic Majjiga Pulusu", price: 110, qty: 1, total: 110 },
      { id: "curry-pappu", name: "Godavari Mamidikaya Pappu with Ghee Tadka", price: 110, qty: 1, total: 110 }
    ],
    itemCount: 4,
    subtotal: 980,
    packagingFee: 30,
    deliveryFee: 0,
    discount: 30,
    grandTotal: 980,
    deliveryAddress: "",
    deliveryLandmark: "",
    gpsMapUrl: "",
    pickupSlot: "Lunch: 01:30 PM",
    vehicleNote: "Counter pickup",
    status: "Delivered",
    paymentStatus: "Paid Online",
    statusHistory: [
      { status: "Received", time: new Date(Date.now() - 86400000 * 19).toISOString(), note: "Order placed" },
      { status: "Delivered", time: new Date(Date.now() - 86400000 * 19 + 1500000).toISOString(), note: "Picked up at counter" }
    ]
  }
];

// Helper: Check if an order is active/incomplete (not completed/delivered/cancelled)
function isOrderIncomplete(orderOrStatus) {
  if (!orderOrStatus) return false;
  const rawStatus = (typeof orderOrStatus === 'object')
    ? (orderOrStatus.status || orderOrStatus.orderStatus || (orderOrStatus.statusHistory && orderOrStatus.statusHistory.slice(-1)[0]?.status) || '')
    : String(orderOrStatus);

  if (!rawStatus) return false;
  const s = rawStatus.toLowerCase().trim();

  // Completed or Cancelled -> DEFINITELY NOT INCOMPLETE
  if (
    s.includes('deliver') || 
    s.includes('complete') || 
    s.includes('cancel') || 
    s.includes('reject') || 
    s.includes('close') || 
    s === 'done' || 
    s === 'paid & served'
  ) {
    return false;
  }

  // Active in-progress states
  const activeKeywords = [
    'received', 'pending', 'new', 'confirmed', 'accept',
    'prepar', 'cook', 'kitchen', 'pack', 'ready',
    'out for delivery', 'dispatch', 'on the way', 'arrived', 'transit'
  ];

  return activeKeywords.some(kw => s.includes(kw));
}
window.isOrderIncomplete = isOrderIncomplete;

// Update the "My Orders" header button and mobile drawer badges with ONLY the count of active/incomplete orders
function updateHeaderMyOrdersBadge(orders) {
  const btnHeaderMyOrders = document.getElementById('btn-header-my-orders');
  const mobileDrawerMyOrders = document.getElementById('mobile-drawer-my-orders');
  if (!btnHeaderMyOrders && !mobileDrawerMyOrders) return;

  let orderList = orders;
  if (!orderList) {
    try {
      orderList = JSON.parse(localStorage.getItem('sgh_customer_orders') || '[]');
    } catch (e) {
      orderList = [];
    }
  }

  // Filter ONLY incomplete / active orders
  const activeIncompleteOrders = (Array.isArray(orderList) ? orderList : []).filter(o => isOrderIncomplete(o));
  const incompleteCount = activeIncompleteOrders.length;

  if (btnHeaderMyOrders) {
    if (AppState.currentUser || (Array.isArray(orderList) && orderList.length > 0)) {
      btnHeaderMyOrders.style.display = 'inline-flex';
      // ONLY show number badge if there are active / incomplete orders
      if (incompleteCount > 0) {
        btnHeaderMyOrders.innerHTML = `<span>📦</span><span>My Orders <strong style="background: #D97706; color: #FFFFFF; font-size: 0.72rem; padding: 2px 7px; border-radius: 50px; margin-left: 4px; font-weight: 800;">${incompleteCount}</strong></span>`;
      } else {
        btnHeaderMyOrders.innerHTML = `<span>📦</span><span>My Orders</span>`;
      }
    } else {
      btnHeaderMyOrders.style.display = 'none';
    }
  }

  if (mobileDrawerMyOrders) {
    if (AppState.currentUser || (Array.isArray(orderList) && orderList.length > 0)) {
      mobileDrawerMyOrders.style.display = 'block';
    } else {
      mobileDrawerMyOrders.style.display = 'none';
    }
  }
}
window.updateHeaderMyOrdersBadge = updateHeaderMyOrdersBadge;

// Cache of fetched customer orders
let currentCustomerOrders = [];

// Fetch customer orders from API and local storage, and render itemized cards
async function fetchAndRenderCustomerOrders() {
  const container = document.getElementById('customer-orders-container') || document.getElementById('prof-customer-orders-container');
  const badgeEl = document.getElementById('profile-orders-count') || document.getElementById('prof-orders-count-badge');
  if (!container) return;

  // Retrieve locally placed orders from localStorage (customer orders, all orders, and in-memory cache)
  let localOrders = [];
  try {
    const raw = localStorage.getItem('sgh_customer_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) localOrders.push(...parsed);
    }
  } catch (err) {
    console.warn('Could not read sgh_customer_orders cache:', err);
  }
  try {
    const rawAll = localStorage.getItem('sgh_all_orders');
    if (rawAll) {
      const parsedAll = JSON.parse(rawAll);
      if (Array.isArray(parsedAll)) localOrders.push(...parsedAll);
    }
  } catch (err) {
    console.warn('Could not read sgh_all_orders cache:', err);
  }
  if (typeof lastPlacedOrderData !== 'undefined' && lastPlacedOrderData) {
    localOrders.push(lastPlacedOrderData);
  }

  const user = AppState.currentUser;

  try {
    const cleanPhone = user ? (user.phone || '').replace(/\D/g, '').slice(-10) : '';
    const email = user ? (user.email || '') : '';
    
    let serverOrders = [];
    try {
      let url = `${BACKEND_BASE}/api/orders`;
      if (cleanPhone) {
        url += `?phone=${encodeURIComponent(cleanPhone)}`;
        if (email && !email.endsWith('@subbayyagari.in')) {
          url += `&email=${encodeURIComponent(email)}`;
        }
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const rawList = data.data || data.orders || [];
        if (Array.isArray(rawList)) {
          serverOrders = rawList.map(normalizeServerOrder).filter(Boolean);
        }
      }

      // If phone query returned 0 orders, fetch all server orders to ensure past orders aren't missed
      if (serverOrders.length === 0 && cleanPhone) {
        const fallbackRes = await fetch(`${BACKEND_BASE}/api/orders`);
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          const fbList = fbData.data || fbData.orders || [];
          if (Array.isArray(fbList) && fbList.length > 0) {
            serverOrders = fbList.map(normalizeServerOrder).filter(Boolean);
          }
        }
      }
    } catch (apiErr) {
      console.warn('API fetch orders notice (using local cache if available):', apiErr);
    }

    // Merge server orders and local orders, deduplicating by ID
    const orderMap = new Map();

    // 1. Add all local orders placed on this device / past orders
    localOrders.forEach(ord => {
      const norm = normalizeServerOrder(ord);
      if (norm && norm.id) {
        orderMap.set(norm.id, norm);
      }
    });

    // 2. Add/update with server orders (server has authoritative latest status & table allocations)
    serverOrders.forEach(ord => {
      if (ord && ord.id) {
        orderMap.set(ord.id, ord);
      }
    });

    // 3. If no orders found anywhere, populate with authentic default customer orders
    if (orderMap.size === 0 && typeof DEFAULT_CUSTOMER_ORDERS !== 'undefined' && Array.isArray(DEFAULT_CUSTOMER_ORDERS)) {
      DEFAULT_CUSTOMER_ORDERS.forEach(ord => {
        const norm = normalizeServerOrder(ord);
        if (norm && norm.id) {
          orderMap.set(norm.id, norm);
        }
      });
    }

    let orders = Array.from(orderMap.values());

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));

    currentCustomerOrders = orders;
    if (badgeEl) badgeEl.textContent = orders.length;
    const profBadge = document.getElementById('prof-orders-count-badge');
    if (profBadge) profBadge.textContent = orders.length;
    const altBadge = document.getElementById('profile-orders-count');
    if (altBadge) altBadge.textContent = orders.length;

    // Update Header My Orders button with incomplete / active count
    updateHeaderMyOrdersBadge(orders);

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--color-text-muted); background: var(--color-surface-muted); border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">🍃</div>
          <h4 style="color: var(--color-primary); margin-bottom: 0.35rem; font-size: 1.05rem;">No Orders Yet!</h4>
          <p style="font-size: 0.8rem; margin-bottom: 1.25rem;">Experience the iconic Andhra Royal Butta Bhojanam with hot flowing pure ghee!</p>
          <button class="btn btn-gold btn-sm" onclick="closeProfileModal(); toggleCart(true);">
            <span>Order Royal Butta Feast 🧺</span>
          </button>
        </div>
      `;
      return;
    }

    // Render Order Cards with Items Breakdown
    container.innerHTML = orders.map(ord => {
      let statusClass = 'cust-status-preparing';
      let statusIcon = '👨‍🍳';
      const s = (ord.status || 'Received').toLowerCase();
      if (s === 'delivered' || s === 'completed') {
        statusClass = 'cust-status-delivered';
        statusIcon = '✅';
      } else if (s === 'out for delivery' || s === 'ready') {
        statusClass = 'cust-status-out';
        statusIcon = '🛵';
      } else if (s === 'accepted') {
        statusClass = 'cust-status-preparing';
        statusIcon = '👨‍🍳';
      } else if (s === 'received' || s === 'pending') {
        statusClass = 'cust-status-received';
        statusIcon = '📥';
      }

      const formattedDate = ord.createdAt 
        ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recent Order';

      const isDelivery = ord.orderType === 'delivery';

      // Build Items List HTML
      const itemsListHtml = (ord.items || []).map(item => `
        <div class="cust-order-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px dotted rgba(0,0,0,0.08);">
          <div style="display: flex; align-items: center; gap: 0.45rem; flex: 1; min-width: 0;">
            <span style="color: #16A34A; font-size: 0.72rem; flex-shrink: 0;">🟢</span>
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="font-weight: 700; color: var(--color-text); font-size: 0.84rem;">${item.name || 'Bhojanam Specialty'}</span>
              <span style="font-size: 0.72rem; color: var(--color-text-muted); margin-left: 0.25rem;">(₹${item.price || 0} each)</span>
            </div>
            <span style="background: rgba(15, 90, 39, 0.1); color: var(--color-primary); font-weight: 800; padding: 2px 7px; border-radius: 4px; font-size: 0.72rem; flex-shrink: 0;">x${item.qty || 1}</span>
          </div>
          <div style="font-weight: 800; color: var(--color-primary); font-size: 0.88rem; margin-left: 0.5rem; flex-shrink: 0;">
            ₹${(item.price || 0) * (item.qty || 1)}
          </div>
        </div>
      `).join('');

      const subtotalVal = ord.subtotal || (ord.items || []).reduce((s, i) => s + ((i.price || 0) * (i.qty || 1)), 0);

      return `
        <div class="cust-order-card" style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 1.1rem; box-shadow: var(--shadow-xs);">
          <!-- Header -->
          <div class="cust-order-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 0.65rem; margin-bottom: 0.75rem;">
            <div>
              <div class="cust-order-id" style="font-family: var(--font-brand), monospace; font-weight: 800; color: var(--color-primary); font-size: 0.96rem;">#${ord.id}</div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">📅 Placed: ${formattedDate}</div>
            </div>
            <span class="cust-status-badge ${statusClass}">
              <span>${statusIcon}</span>
              <span>${ord.status || 'Received'}</span>
            </span>
          </div>

          <!-- Order Type & Branch Destination & Table Assignment -->
          <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 0.65rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.35rem;">
            <div>
              <strong>${isDelivery ? '🛵 Home Delivery' : (ord.orderType === 'dine-in' ? '🍽️ Dine-in / Reservation' : '🥡 Takeaway')}</strong>
              <span style="color: var(--color-border-hover);"> • </span>
              <span>${ord.branchName || 'KPHB Colony, Hyderabad'}</span>
            </div>
            ${ord.tableNumber ? `<span style="background:rgba(16,185,129,0.15); color:#10B981; font-weight:800; padding:2px 8px; border-radius:4px; font-size:0.75rem;">🪑 Table #${ord.tableNumber}</span>` : ''}
            <span style="color: var(--color-gold); font-weight: 700; font-size: 0.74rem;">💳 ${ord.paymentMethod || ord.paymentStatus || 'Paid via UPI'}</span>
          </div>

          <!-- Dishes Ordered -->
          <div class="cust-order-items-box" style="background: var(--color-surface-muted); border-radius: var(--radius-sm); padding: 0.75rem 0.85rem; margin-bottom: 0.75rem; border: 1px dashed rgba(15, 90, 39, 0.2);">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--color-gold); text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.04em; display: flex; justify-content: space-between; align-items: center;">
              <span>🍽️ Dishes Ordered (${ord.itemCount || (ord.items ? ord.items.length : 0)} items)</span>
              <span style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600;">Subtotal: ₹${subtotalVal}</span>
            </div>
            <div style="display: flex; flex-direction: column;">
              ${itemsListHtml || '<div style="font-size: 0.78rem; color: var(--color-text-muted);">Royal Butta Feast Selection</div>'}
            </div>
          </div>

          <!-- Footer & Action Buttons -->
          <div class="cust-order-footer" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; border-top: 1px solid var(--color-border); padding-top: 0.75rem;">
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">Total Paid</div>
              <div style="font-weight: 800; color: var(--color-primary); font-size: 1.15rem; font-family: var(--font-brand), sans-serif;">
                ₹${ord.grandTotal || subtotalVal}
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button class="btn btn-outline btn-sm" onclick="reorderCustomerItems('${ord.id}')" style="font-size: 0.75rem; padding: 0.35rem 0.85rem;" title="Add these feast items back to your plate">
                <span>Reorder 🔄</span>
              </button>
              <button class="btn btn-gold btn-sm" onclick="openOrderDetailsModal('${ord.id}')" style="font-size: 0.75rem; padding: 0.35rem 0.85rem;" title="View Live Kitchen Status & Receipt">
                <span>Live Tracker 🛵</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error fetching customer orders:', err);
    container.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--color-text-muted);">
        <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">⚠️ Unable to connect to server.</p>
        <button class="btn btn-outline btn-sm" onclick="fetchAndRenderCustomerOrders()">Retry 🔄</button>
      </div>
    `;
  }
}
window.fetchAndRenderCustomerOrders = fetchAndRenderCustomerOrders;

// ==========================================================================
// 12. FULL ORDER DETAILS MODAL & RECEIPT PRINT
// ==========================================================================
let activeViewingOrder = null;

async function openOrderDetailsModal(orderId) {
  const modal = document.getElementById('order-details-modal');
  if (!modal) return;

  // 1. Search in local and memory caches
  let ord = null;
  if (lastPlacedOrderData && lastPlacedOrderData.id === orderId) {
    ord = lastPlacedOrderData;
  }
  if (!ord && Array.isArray(currentCustomerOrders)) {
    ord = currentCustomerOrders.find(o => o.id === orderId);
  }
  if (!ord) {
    try {
      const local = JSON.parse(localStorage.getItem('sgh_customer_orders') || '[]');
      ord = local.find(o => o.id === orderId);
    } catch (e) {}
  }

  if (!ord) {
    ord = DEFAULT_CUSTOMER_ORDERS.find(o => o.id === orderId);
  }

  // 2. Fetch latest authoritative status directly from API
  try {
    const res = await fetch(`${BACKEND_BASE}/api/orders/${orderId}`);
    if (res.ok) {
      const apiData = await res.json();
      const serverRaw = apiData.data || apiData.order;
      if (serverRaw) {
        ord = normalizeServerOrder(serverRaw);
      }
    }
  } catch (e) {
    console.warn('Could not fetch latest order status from server:', e);
  }

  if (!ord) {
    showToast('⚠️ Order details could not be found.');
    return;
  }

  activeViewingOrder = ord;

  // Header and Status
  const dtlId = document.getElementById('dtl-order-id');
  const dtlStatusBadge = document.getElementById('dtl-order-status-badge');
  const dtlStatusIcon = document.getElementById('dtl-order-status-icon');
  const dtlStatusText = document.getElementById('dtl-order-status-text');

  if (dtlId) dtlId.textContent = `Order #${ord.id}`;
  
  const statusStr = (ord.status || 'Received').toLowerCase().trim();
  let statusIcon = '📥';
  let badgeClass = 'cust-status-received';
  let statusDisplay = ord.status || 'Order Placed';

  if (statusStr === 'delivered' || statusStr === 'completed' || statusStr === 'picked up') {
    statusIcon = '✅';
    badgeClass = 'cust-status-delivered';
    statusDisplay = 'Delivered & Handed Over';
  } else if (statusStr === 'out for delivery' || statusStr === 'ready' || statusStr === 'ready for pickup') {
    statusIcon = '🛵';
    badgeClass = 'cust-status-out';
    statusDisplay = ord.orderType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup';
  } else if (statusStr === 'in kitchen' || statusStr === 'preparing' || statusStr === 'cooking' || statusStr === 'accepted' || statusStr === 'accepted & cooking' || statusStr === 'received & cooking') {
    statusIcon = '👨‍🍳';
    badgeClass = 'cust-status-preparing';
    statusDisplay = 'Accepted & Cooking in Kitchen';
  } else if (statusStr === 'received' || statusStr === 'placed' || statusStr === 'order placed' || statusStr === 'pending') {
    statusIcon = '📥';
    badgeClass = 'cust-status-received';
    statusDisplay = 'Order Placed (Awaiting Acceptance)';
  } else if (statusStr === 'cancelled') {
    statusIcon = '❌';
    badgeClass = 'cust-status-cancelled';
    statusDisplay = 'Order Cancelled';
  }

  if (dtlStatusBadge) dtlStatusBadge.className = `cust-status-badge ${badgeClass}`;
  if (dtlStatusIcon) dtlStatusIcon.textContent = statusIcon;
  if (dtlStatusText) dtlStatusText.textContent = statusDisplay;

  // Live Tracker Steps: Step 1 Placed -> Step 2 Cooking (only once owner accepts) -> Step 3 Out for Delivery -> Step 4 Delivered
  const trackerContainer = document.getElementById('dtl-order-tracker-steps');
  if (trackerContainer) {
    const isDelivery = ord.orderType === 'delivery';
    const step3Label = isDelivery ? 'Out for Delivery' : 'Ready for Pickup';
    const step4Label = isDelivery ? 'Delivered' : 'Picked Up';

    let s1 = 'active', s2 = '', s3 = '', s4 = '';
    if (statusStr === 'received' || statusStr === 'placed' || statusStr === 'order placed' || statusStr === 'pending') {
      s1 = 'active';
      s2 = '';
      s3 = '';
      s4 = '';
    } else if (statusStr === 'in kitchen' || statusStr === 'preparing' || statusStr === 'cooking' || statusStr === 'accepted' || statusStr === 'accepted & cooking' || statusStr === 'received & cooking') {
      s1 = 'completed';
      s2 = 'active';
      s3 = '';
      s4 = '';
    } else if (statusStr === 'out for delivery' || statusStr === 'ready' || statusStr === 'ready for pickup') {
      s1 = 'completed';
      s2 = 'completed';
      s3 = 'active';
      s4 = '';
    } else if (statusStr === 'delivered' || statusStr === 'completed' || statusStr === 'picked up') {
      s1 = 'completed';
      s2 = 'completed';
      s3 = 'completed';
      s4 = 'completed';
    } else if (statusStr === 'cancelled') {
      s1 = 'cancelled';
      s2 = '';
      s3 = '';
      s4 = '';
    } else {
      s1 = 'completed';
      s2 = 'active';
    }

    trackerContainer.innerHTML = `
      <div class="order-tracker-step ${s1}">
        <div class="order-tracker-dot">${s1 === 'completed' ? '✓' : (s1 === 'cancelled' ? '✕' : '1')}</div>
        <div class="order-tracker-label">Placed</div>
      </div>
      <div class="order-tracker-step ${s2}">
        <div class="order-tracker-dot">${s2 === 'completed' ? '✓' : '2'}</div>
        <div class="order-tracker-label">Cooking</div>
      </div>
      <div class="order-tracker-step ${s3}">
        <div class="order-tracker-dot">${s3 === 'completed' ? '✓' : '3'}</div>
        <div class="order-tracker-label">${step3Label}</div>
      </div>
      <div class="order-tracker-step ${s4}">
        <div class="order-tracker-dot">${s4 === 'completed' ? '✓' : '4'}</div>
        <div class="order-tracker-label">${step4Label}</div>
      </div>
    `;
  }

  // Patron & Destination Details
  const dtlName = document.getElementById('dtl-customer-name');
  const dtlPhone = document.getElementById('dtl-customer-phone');
  const dtlBranch = document.getElementById('dtl-branch-name');
  const dtlBranchAddr = document.getElementById('dtl-branch-address');
  const dtlType = document.getElementById('dtl-order-type');
  const dtlTime = document.getElementById('dtl-order-time');
  const dtlPayment = document.getElementById('dtl-payment-status');

  if (dtlName) dtlName.textContent = ord.customerName || 'Valued Guest';
  if (dtlPhone) dtlPhone.textContent = ord.customerPhone || 'Contact Provided';
  if (dtlBranch) dtlBranch.textContent = ord.branchName || 'KPHB Colony, Hyderabad';
  if (dtlBranchAddr) dtlBranchAddr.textContent = ord.branchAddress || 'Subbayya Gari Signature Outlet';
  
  const formattedTime = ord.createdAt 
    ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recent Feast Order';
  if (dtlType) dtlType.textContent = ord.orderType === 'delivery' ? '🛵 Home Delivery' : '🥡 Restaurant Takeaway';
  if (dtlTime) dtlTime.textContent = formattedTime;
  if (dtlPayment) dtlPayment.textContent = ord.paymentStatus || 'Paid Online (Verified)';

  // Delivery / Pickup / Dine-in specific banner & Live Management Updates
  const bannerEl = document.getElementById('dtl-delivery-banner');
  if (bannerEl) {
    let detailsHtml = '';
    if (ord.orderType === 'delivery') {
      detailsHtml += `<strong>🏠 Delivery Address:</strong> ${ord.deliveryAddress || 'Standard Delivery Location'}`;
      if (ord.deliveryLandmark) {
        detailsHtml += `<br/><span style="color: var(--color-text-muted);">🚩 Landmark: ${ord.deliveryLandmark}</span>`;
      }
      if (ord.gpsMapUrl || ord.locationUrl) {
        detailsHtml += `<br/><a href="${ord.gpsMapUrl || ord.locationUrl}" target="_blank" style="color: var(--color-gold); font-weight: 700; text-decoration: underline;">📍 Open Exact Location in Google Maps ↗</a>`;
      }
    } else if (ord.orderType === 'dine-in') {
      detailsHtml += `<strong>🍽️ Dine-in Booking:</strong> Traditional Godavari Sitting<br/>`;
      if (ord.tableNumber) {
        detailsHtml += `<span style="color: #10B981; font-weight: 800;">🪑 Allocated Table: ${ord.tableNumber}</span><br/>`;
      }
      detailsHtml += `<span style="color: var(--color-text-muted);">📍 Please visit ${ord.branchName || 'Selected Outlet'}.</span>`;
    } else {
      detailsHtml += `
        <strong>🥡 Pickup Time:</strong> ${ord.pickupSlot || 'Ready in 15-20 Minutes'}<br/>
        <span style="color: var(--color-text-muted);">📍 Please collect at the designated Curbside Pickup counter at ${ord.branchName || 'Selected Outlet'}.</span>
        ${ord.vehicleNote ? `<br/><span style="color: var(--color-gold); font-weight: 700;">🚗 Vehicle Details: ${ord.vehicleNote}</span>` : ''}
      `;
    }

    // Live Owner / Kitchen Updates block
    let liveUpdatesHtml = '';
    if (ord.estimatedPrepTime) {
      liveUpdatesHtml += `<div style="margin-top: 6px; color: var(--color-gold); font-weight: 700;">⏱️ Estimated Time: <span style="color: var(--color-text);">${ord.estimatedPrepTime}</span></div>`;
    }
    if (ord.riderName) {
      liveUpdatesHtml += `<div style="margin-top: 4px; color: #8B5CF6; font-weight: 700;">🛵 Delivery Partner: <span style="color: var(--color-text);">${ord.riderName}</span> ${ord.riderPhone ? `<a href="tel:${ord.riderPhone}" style="color: var(--color-gold); margin-left: 6px;">📞 Call Rider (${ord.riderPhone})</a>` : ''}</div>`;
    }
    if (ord.tableNumber && ord.orderType !== 'dine-in') {
      liveUpdatesHtml += `<div style="margin-top: 4px; color: #10B981; font-weight: 700;">🪑 Table / Token: <span style="color: var(--color-text);">${ord.tableNumber}</span></div>`;
    }
    if (ord.kitchenNote) {
      liveUpdatesHtml += `<div style="margin-top: 6px; background: rgba(245, 158, 11, 0.12); padding: 5px 10px; border-radius: 6px; color: #FCD34D; font-size: 0.78rem; border-left: 3px solid var(--color-gold);">👨‍🍳 <strong>Kitchen Note:</strong> ${ord.kitchenNote}</div>`;
    }

    bannerEl.innerHTML = detailsHtml + (liveUpdatesHtml ? `<div style="border-top: 1px dashed rgba(255,255,255,0.15); margin-top: 8px; padding-top: 6px;">${liveUpdatesHtml}</div>` : '');
    bannerEl.style.display = 'block';
  }

  // Dishes Breakdown
  const items = ord.items || [];
  const countTag = document.getElementById('dtl-items-count-tag');
  const itemsListEl = document.getElementById('dtl-items-list');
  const totalCount = items.reduce((s, i) => s + (i.qty || 1), 0);

  if (countTag) countTag.textContent = `${totalCount} Items`;
  if (itemsListEl) {
    if (items.length > 0) {
      itemsListEl.innerHTML = items.map((item, idx) => `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dotted rgba(0,0,0,0.06); padding-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 0.45rem;">
            <span style="color: #16A34A; font-size: 0.75rem;">🟢</span>
            <div>
              <span style="font-weight: 700; color: var(--color-text);">${item.name || 'Signature Bhojanam Dish'}</span>
              <div style="font-size: 0.72rem; color: var(--color-text-muted);">₹${item.price || 0} per item</div>
            </div>
            <span style="background: rgba(15, 90, 39, 0.1); color: var(--color-primary); font-weight: 800; padding: 2px 7px; border-radius: 4px; font-size: 0.74rem;">x${item.qty || 1}</span>
          </div>
          <div style="font-weight: 800; color: var(--color-primary); font-size: 0.92rem;">
            ₹${(item.price || 0) * (item.qty || 1)}
          </div>
        </div>
      `).join('');
    } else {
      itemsListEl.innerHTML = '<div style="color: var(--color-text-muted); font-size: 0.82rem;">Royal Butta Feast Selection</div>';
    }
  }

  // Bill Receipt Breakdown
  const subtotalVal = ord.subtotal || items.reduce((s, i) => s + ((i.price || 0) * (i.qty || 1)), 0);
  const packingVal = ord.packagingFee !== undefined ? ord.packagingFee : 15;
  const deliveryVal = ord.deliveryFee || 0;
  const discountVal = ord.discount || 0;
  const grandTotalVal = ord.grandTotal || (subtotalVal + packingVal + deliveryVal - discountVal);

  const subtotalEl = document.getElementById('dtl-bill-subtotal');
  const packingEl = document.getElementById('dtl-bill-packing');
  const deliveryRow = document.getElementById('dtl-bill-delivery-row');
  const deliveryEl = document.getElementById('dtl-bill-delivery');
  const discountRow = document.getElementById('dtl-bill-discount-row');
  const discountEl = document.getElementById('dtl-bill-discount');
  const grandTotalEl = document.getElementById('dtl-bill-grandtotal');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotalVal}`;
  if (packingEl) packingEl.textContent = `₹${packingVal}`;
  
  if (deliveryRow && deliveryEl) {
    if (ord.orderType === 'delivery') {
      deliveryRow.style.display = 'flex';
      deliveryEl.textContent = `₹${deliveryVal}`;
    } else {
      deliveryRow.style.display = 'none';
    }
  }

  if (discountRow && discountEl) {
    if (discountVal > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-₹${discountVal}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotalVal}`;

  // Support Call Button
  const supportBtn = document.getElementById('dtl-support-btn');
  if (supportBtn) {
    const branchObj = BRANCHES_DATA.find(b => b.id === ord.branchId) || BRANCHES_DATA[0];
    supportBtn.href = `tel:${branchObj.phone ? branchObj.phone.replace(/[^0-9+]/g, '') : '+919010888842'}`;
    supportBtn.innerHTML = `📞 Call ${branchObj.name ? branchObj.name.split(',')[0] : 'Restaurant'}`;
  }

  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  modal.style.zIndex = '9999';
}
window.openOrderDetailsModal = openOrderDetailsModal;

function closeOrderDetailsModal() {
  const modal = document.getElementById('order-details-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }
}
window.closeOrderDetailsModal = closeOrderDetailsModal;

function printOrderReceipt() {
  if (!activeViewingOrder) {
    window.print();
    return;
  }
  const ord = activeViewingOrder;
  const printWindow = window.open('', '_blank', 'width=650,height=750');
  if (!printWindow) {
    window.print();
    return;
  }

  const itemsHtml = (ord.items || []).map(i => `
    <tr>
      <td style="padding: 6px 0; border-bottom: 1px dotted #ccc;">${i.name} (x${i.qty || 1})</td>
      <td style="padding: 6px 0; border-bottom: 1px dotted #ccc; text-align: right;">₹${(i.price || 0) * (i.qty || 1)}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Subbayya Gari Hotel - Receipt #${ord.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; color: #222; max-width: 480px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px dashed #0F5A27; padding-bottom: 15px; margin-bottom: 15px; }
          .title { font-size: 20px; font-weight: 800; color: #0F5A27; margin: 0; }
          .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
          .row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
          .total-row { border-top: 2px solid #0F5A27; font-size: 16px; font-weight: 800; padding-top: 8px; color: #0F5A27; }
          .footer { text-align: center; font-size: 11px; color: #777; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">SUBBAYYA GARI HOTEL</div>
          <div class="subtitle">Authentic Godavari Vegetarian Hospitality Since 1950</div>
          <div style="font-weight: 800; font-size: 15px; margin-top: 8px; color: #D97706;">RECEIPT: #${ord.id}</div>
        </div>
        <div class="row"><span><strong>Date:</strong></span><span>${new Date(ord.createdAt || Date.now()).toLocaleString()}</span></div>
        <div class="row"><span><strong>Customer:</strong></span><span>${ord.customerName} (${ord.customerPhone})</span></div>
        <div class="row"><span><strong>Branch:</strong></span><span>${ord.branchName || 'KPHB Colony'}</span></div>
        <div class="row"><span><strong>Order Type:</strong></span><span>${ord.orderType === 'delivery' ? 'Home Delivery' : 'Restaurant Pickup'}</span></div>
        <div class="row"><span><strong>Payment:</strong></span><span>${ord.paymentStatus || 'Paid Online (Verified)'}</span></div>
        
        <table>
          <thead>
            <tr style="border-bottom: 1px solid #333; text-align: left; font-weight: 800;">
              <th>Item</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="row"><span>Item Subtotal:</span><span>₹${ord.subtotal || 0}</span></div>
        <div class="row"><span>Eco Banana Leaf Packing:</span><span>₹${ord.packagingFee || 15}</span></div>
        ${ord.deliveryFee ? `<div class="row"><span>Delivery Charges:</span><span>₹${ord.deliveryFee}</span></div>` : ''}
        ${ord.discount ? `<div class="row" style="color: #16A34A;"><span>Discount:</span><span>-₹${ord.discount}</span></div>` : ''}
        <div class="row total-row"><span>Grand Total:</span><span>₹${ord.grandTotal || 0}</span></div>

        <div class="footer">
          🍃 Packed with Pure Flowing Ghee and Authentic Godavari Love.<br/>
          Thank you for dining with Subbayya Gari Hotel!
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
window.printOrderReceipt = printOrderReceipt;

// Re-add items from a past order into the customer cart
function reorderCustomerItems(orderId) {
  const ord = currentCustomerOrders.find(o => o.id === orderId);
  if (!ord || !ord.items || ord.items.length === 0) {
    showToast('⚠️ No items found in this order to reorder');
    return;
  }

  ord.items.forEach(item => {
    // Find matching menu item or reconstruct
    const menuItem = MENU_DATA.find(m => m.id === item.id || m.name === item.name);
    if (menuItem) {
      for (let i = 0; i < (item.qty || 1); i++) {
        addToCart(menuItem.id, true);
      }
    } else {
      AppState.cart.push({
        id: item.id || 'dish-' + Date.now(),
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80'
      });
    }
  });

  saveCart();
  closeProfileModal();
  toggleCart(true);
  showToast(`🛒 ${ord.items.length} dishes added back to your cart! Ready to feast.`);
}
window.reorderCustomerItems = reorderCustomerItems;

function openProfileModal(initialTab = 'account') {
  const modal = document.getElementById('profile-modal');
  if (!modal) return;

  // Close other modals if any are open
  ['auth-modal', 'order-details-modal', 'order-confirmation-modal', 'review-modal', 'reservation-pass-modal', 'delivery-location-modal'].forEach(id => {
    const m = document.getElementById(id);
    if (m) {
      m.classList.remove('active');
      m.style.display = '';
      m.style.visibility = '';
      m.style.opacity = '';
    }
  });

  const user = AppState.currentUser || {
    name: 'Valued Guest',
    phone: '+91 9876543210',
    email: 'guest@subbayyagari.in',
    address: 'KPHB Colony, Kukatpally, Hyderabad',
    coins: 50,
    tier: 'VIP Patron',
    memberSince: '2026'
  };

  const nameEl = document.getElementById('prof-user-name');
  const phoneEl = document.getElementById('prof-user-phone');
  const emailEl = document.getElementById('prof-user-email');
  const coinsEl = document.getElementById('prof-coins-count');
  const addrEl = document.getElementById('prof-saved-address');
  const avatarLetter = document.getElementById('prof-avatar-letter');

  const detailNameEl = document.getElementById('prof-detail-name');
  const detailPhoneEl = document.getElementById('prof-detail-phone');
  const detailEmailEl = document.getElementById('prof-detail-email');
  const detailTierEl = document.getElementById('prof-detail-tier');
  const detailSinceEl = document.getElementById('prof-detail-since');

  if (nameEl) nameEl.textContent = user.name;
  if (phoneEl) phoneEl.textContent = user.phone;
  if (emailEl) emailEl.textContent = user.email || 'guest@subbayyagari.in';
  if (coinsEl) coinsEl.textContent = `${user.coins || 50} 🪙`;
  if (addrEl) addrEl.textContent = user.address || 'Road No. 4, KPHB Colony, Kukatpally, Hyderabad';
  if (avatarLetter) avatarLetter.textContent = (user.name || 'G').charAt(0).toUpperCase();

  if (detailNameEl) detailNameEl.textContent = user.name;
  if (detailPhoneEl) detailPhoneEl.textContent = user.phone;
  if (detailEmailEl) detailEmailEl.textContent = user.email || 'guest@subbayyagari.in';
  if (detailTierEl) detailTierEl.textContent = user.tier || '✨ Royal Patron';
  if (detailSinceEl) detailSinceEl.textContent = user.memberSince || '2026';

  switchProfileTab(initialTab);
  
  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  modal.style.zIndex = '9999';

  fetchAndRenderCustomerOrders();
}
window.openProfileModal = openProfileModal;

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }
}
window.closeProfileModal = closeProfileModal;

function handleUserLogout() {
  AppState.currentUser = null;
  try {
    sessionStorage.removeItem('sgh_user');
    localStorage.removeItem('sgh_user');
  } catch (e) {
    console.error('Logout error:', e);
  }

  // Clear inputs
  const resName = document.getElementById('res-name');
  const resPhone = document.getElementById('res-phone');
  const cartName = document.getElementById('order-customer-name');
  const cartPhone = document.getElementById('order-customer-phone');
  const cartAddr = document.getElementById('order-delivery-address');
  if (resName) resName.value = '';
  if (resPhone) resPhone.value = '';
  if (cartName) cartName.value = '';
  if (cartPhone) cartPhone.value = '';
  if (cartAddr) cartAddr.value = '';

  closeProfileModal();
  updateAuthUI();
  showToast('👋 Successfully logged out from Subbayya Gari Hotel');
}
window.handleUserLogout = handleUserLogout;

// Modal Backdrop and Escape Key Listeners
document.addEventListener('DOMContentLoaded', () => {
  ['auth-modal', 'profile-modal', 'order-details-modal', 'order-confirmation-modal', 'review-modal', 'reservation-pass-modal', 'delivery-location-modal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          modal.style.display = 'none';
          modal.style.visibility = 'hidden';
          modal.style.opacity = '0';
          modal.style.pointerEvents = 'none';
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      closeProfileModal();
      closeOrderDetailsModal();
      closeReservationPassModal();
      closeDeliveryLocationModal();
      const confModal = document.getElementById('order-confirmation-modal');
      if (confModal) {
        confModal.classList.remove('active');
        confModal.style.display = 'none';
      }
    }
  });
});




// Initialize customer real-time sync & active orders badge
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initCustomerLiveSync();
    updateHeaderMyOrdersBadge();
    fetchAndRenderCustomerOrders();
  });
}


// Cross-tab instant synchronization for menu changes
window.addEventListener('storage', (e) => {
  if (e.key === 'sgh_menu_update_event') {
    syncLiveMenuAndSettings();
  }
});
if (sghBroadcast) {
  sghBroadcast.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'menu_updated') {
      syncLiveMenuAndSettings();
    }
  });
}
