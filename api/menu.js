/**
 * Menu Management API for Subbayya Gari Hotel
 * Real-time synchronization between Owner portal and Customer site
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');

// Default initial menu items (Subbayya Gari authentic catalog)
const DEFAULT_MENU = [
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
    inStock: true,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
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
    inStock: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    inStock: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
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
    inStock: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
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
    inStock: true,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    inStock: true,
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
    description: 'Chef special coastal Andhra flavored rice of the day tempered with cashew nuts, ghee, and mild spices.'
  },
  {
    id: 'meal-sambar-rice-half',
    name: 'Sambar Rice Half',
    telugu: 'సాంబార్ రైస్ హాఫ్',
    category: 'rice',
    price: 100,
    rating: 4.8,
    reviews: 820,
    spiceLevel: 'medium',
    dietary: ['jain-available'],
    isBestseller: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    description: 'Hot comforting rice simmered in slow-cooked drumstick and tomato sambar with a spoonful of melting ghee.'
  },
  {
    id: 'meal-curd-rice-half',
    name: 'Curd Rice Half',
    telugu: 'పెరుగన్నం హాఫ్',
    category: 'rice',
    price: 80,
    rating: 4.9,
    reviews: 630,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    description: 'Creamy Godavari buffalo milk curd rice tempered with mustard seeds, ginger, curry leaves, and pomegranate arils.'
  },
  {
    id: 'meal-plain-rice-half',
    name: 'Plain Rice Half',
    telugu: 'సాదా అన్నం హాఫ్',
    category: 'rice',
    price: 60,
    rating: 4.6,
    reviews: 310,
    spiceLevel: 'mild',
    dietary: ['jain-available'],
    isBestseller: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=800&q=80',
    description: 'Steaming hot Sona Masoori aged rice cooked to fluffy perfection, ideal pairing with hot Rasam and Pappu.'
  },
  {
    id: 'fry-kaju-paneer',
    name: 'Kaju Paneer Curry',
    telugu: 'జీడిపప్పు పన్నీర్ కూర',
    category: 'curries',
    price: 180,
    rating: 4.9,
    reviews: 1850,
    spiceLevel: 'medium',
    dietary: ['chef-special'],
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    description: 'Rich Andhra style onion-tomato gravy loaded with roasted Godavari cashews and soft cottage cheese cubes.'
  },
  {
    id: 'curry-gutti-vankaya',
    name: 'Gutti Vankaya Kura',
    telugu: 'గుత్తి వంకాయ కూర',
    category: 'curries',
    price: 140,
    rating: 5.0,
    reviews: 2100,
    spiceLevel: 'spicy',
    dietary: ['chef-special'],
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    description: 'Baby brinjals stuffed with freshly ground sesame, peanut, coconut, coriander spice paste simmered in tamarind extract.'
  },
  {
    id: 'sweet-bobbatlu',
    name: 'Nethi Bobbatlu (2 Pcs)',
    telugu: 'నేతి బొబ్బట్లు',
    category: 'sweets',
    price: 90,
    rating: 5.0,
    reviews: 2450,
    spiceLevel: 'mild',
    dietary: ['chef-special'],
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    description: 'Soft melt-in-mouth traditional flatbread stuffed with sweet chana dal & organic jaggery, drenched in pure warm Godavari ghee.'
  },
  {
    id: 'sweet-kakinada-khaja',
    name: 'Kakinada Gottam Khaja (250g)',
    telugu: 'కాకినాడ గొట్టం ఖాజా',
    category: 'sweets',
    price: 160,
    rating: 5.0,
    reviews: 3100,
    spiceLevel: 'mild',
    dietary: ['chef-special'],
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
    description: 'The historic royal delicacy of Kakinada. Crispy multilayered crust outside bursting with sweet fragrant cardamom syrup inside.'
  },
  {
    id: 'sweet-pootharekulu',
    name: 'Atreyapuram Pootharekulu (4 Pcs)',
    telugu: 'ఆత్రేయపురం పూతరేకులు',
    category: 'sweets',
    price: 180,
    rating: 5.0,
    reviews: 2890,
    spiceLevel: 'mild',
    dietary: ['chef-special'],
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    description: 'Paper-thin rice starch edible film hand-folded with dry fruits, jaggery, and generous pure ghee from Godavari banks.'
  }
];

function getMenu() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(MENU_FILE)) {
      fs.writeFileSync(MENU_FILE, JSON.stringify(DEFAULT_MENU, null, 2), 'utf-8');
      return DEFAULT_MENU;
    }
    const raw = fs.readFileSync(MENU_FILE, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    return parsed.length > 0 ? parsed : DEFAULT_MENU;
  } catch (err) {
    console.error('Error reading menu file:', err);
    return DEFAULT_MENU;
  }
}

function saveMenu(menu) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MENU_FILE, JSON.stringify(menu, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing menu file:', err);
    return false;
  }
}

module.exports = {
  // GET /api/menu
  getMenuHandler: (req, res) => {
    const menu = getMenu();
    res.json({
      success: true,
      count: menu.length,
      menu,
      data: menu
    });
  },

  // POST /api/menu/update - Update price, stock status, or details of an item
  updateMenuItemHandler: (req, res) => {
    try {
      const { id, price, originalPrice, inStock, isAvailable, isBestseller, name, description, image, photo, imageUrl } = req.body || {};

      if (!id && !name) {
        return res.status(400).json({ success: false, error: 'Item ID or name is required.' });
      }

      const menu = getMenu();
      const targetId = (id || '').toString();
      const targetName = (name || '').toLowerCase().trim();

      const itemIndex = menu.findIndex(item =>
        (targetId && item.id === targetId) ||
        (targetName && item.name.toLowerCase().trim() === targetName) ||
        (targetId && item.name.toLowerCase().trim() === targetId.toLowerCase().trim())
      );

      if (itemIndex === -1) {
        return res.status(404).json({ success: false, error: `Item with id ${id || name} not found.` });
      }

      const item = menu[itemIndex];
      if (price !== undefined && !isNaN(Number(price))) item.price = Number(price);
      if (originalPrice !== undefined && !isNaN(Number(originalPrice))) item.originalPrice = Number(originalPrice);
      if (inStock !== undefined) item.inStock = Boolean(inStock);
      if (isAvailable !== undefined) item.inStock = Boolean(isAvailable);
      if (isBestseller !== undefined) item.isBestseller = Boolean(isBestseller);
      if (name) item.name = name;
      if (description) item.description = description;

      const newImg = image || photo || imageUrl;
      if (newImg && typeof newImg === 'string' && newImg.trim()) {
        item.image = newImg.trim();
      }

      menu[itemIndex] = item;
      saveMenu(menu);

      console.log(`[Menu Updated by Owner] ${item.name} (${item.id}): Price=₹${item.price}, Photo=${item.image ? item.image.slice(0, 40) + '...' : 'none'}, inStock=${item.inStock}`);

      res.json({
        success: true,
        message: `Updated ${item.name} successfully!`,
        item,
        data: item
      });
    } catch (err) {
      console.error('Error updating menu item:', err);
      res.status(500).json({ success: false, error: 'Server error updating menu item' });
    }
  },

  resetMenuHandler: (req, res) => {
    saveMenu(DEFAULT_MENU);
    res.json({
      success: true,
      message: 'Menu restored to authentic defaults.',
      menu: DEFAULT_MENU
    });
  }
};
