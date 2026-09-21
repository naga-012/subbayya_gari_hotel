/**
 * SUBBAYYA GARI HOTEL - CORE JAVASCRIPT APPLICATION
 * Authentic Andhra Vegetarian Culinary Experience Since 1950
 */

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
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033282-01968be8c460?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033282-01968be8c460?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033282-01968be8c460?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033282-01968be8c460?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
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
    localStorage.removeItem('sgh_user');
    const savedUser = sessionStorage.getItem('sgh_user');
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

  // Sync with Reservation Dropdown
  const resBranch = document.getElementById('res-branch');
  if (resBranch) {
    for (let opt of resBranch.options) {
      if (opt.value.toLowerCase().includes(branch.city.toLowerCase()) || 
          opt.value.toLowerCase().includes(branch.name.toLowerCase())) {
        resBranch.value = opt.value;
        break;
      }
    }
  }

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
    // 1. Fetch live menu prices & stock status
    const menuRes = await fetch('/api/menu');
    if (menuRes.ok) {
      const menuData = await menuRes.json();
      if (menuData && Array.isArray(menuData.menu)) {
        let hasChanges = false;
        menuData.menu.forEach(liveItem => {
          const localItem = MENU_DATA.find(m => m.id === liveItem.id);
          if (localItem) {
            if (localItem.price !== liveItem.price || localItem.inStock !== liveItem.inStock) {
              localItem.price = liveItem.price;
              localItem.inStock = liveItem.inStock;
              hasChanges = true;
            }
          }
        });
        if (hasChanges) {
          renderMenuGrid();
          if (typeof renderRateBoard === 'function') renderRateBoard();
          updateCartBadge();
        }
      }
    }

    // 2. Fetch live settings & announcement banner
    const settingsRes = await fetch('/api/settings');
    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      const settings = settingsData.settings;
      if (settings) {
        // Update top announcement bar if present
        const announceTextEl = document.querySelector('.announcement-bar span:nth-child(2)');
        if (announceTextEl && settings.announcementText) {
          announceTextEl.textContent = settings.announcementText;
        }
      }
    }
  } catch (err) {
    // Network silent catch
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
  const item = MENU_DATA.find(m => m.id === itemId);
  if (!item) return;

  const existing = AppState.cart.find(c => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    AppState.cart.push({
      id: item.id,
      name: item.name,
      telugu: item.telugu,
      price: item.price,
      image: item.image,
      qty: 1
    });
  }

  saveCart();
  renderMenuGrid();
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

  // Update Cart Auth Banner and Checkout Button State
  const cartAuthBanner = document.getElementById('cart-auth-banner');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const cartCheckoutBtnText = document.getElementById('cart-checkout-btn-text');
  const orderModeLabel = isDelivery ? 'Delivery' : 'Pickup';

  if (AppState.currentUser) {
    if (cartAuthBanner) {
      cartAuthBanner.className = 'auth-gate-banner logged-in';
      cartAuthBanner.innerHTML = `
        <div>
          <strong style="color: #16A34A;">✅ Verified Guest: ${AppState.currentUser.name}</strong>
          <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">📞 ${AppState.currentUser.phone} • ${AppState.currentUser.coins || 50} Ghee Coins 🪙</div>
        </div>
        <button type="button" class="auth-gate-login-btn" style="background: rgba(22, 163, 74, 0.15); color: #16A34A; border: 1px solid #16A34A;" onclick="openProfileModal()">Profile 👑</button>
      `;
    }

    if (cartCheckoutBtnText) {
      cartCheckoutBtnText.textContent = `Send ${orderModeLabel} Order via WhatsApp 🚀`;
    }
    if (cartCheckoutBtn) {
      cartCheckoutBtn.classList.remove('btn-outline-gold');
      cartCheckoutBtn.classList.add('btn-gold');
    }

    // Auto-fill logged in user info if empty
    const nameInput = document.getElementById('order-customer-name');
    const phoneInput = document.getElementById('order-customer-phone');
    const addrInput = document.getElementById('order-delivery-address');
    if (nameInput && !nameInput.value) nameInput.value = AppState.currentUser.name || '';
    if (phoneInput && !phoneInput.value) phoneInput.value = AppState.currentUser.phone || '';
    if (addrInput && !addrInput.value && AppState.currentUser.address) addrInput.value = AppState.currentUser.address;
  } else {
    if (cartAuthBanner) {
      cartAuthBanner.className = 'auth-gate-banner logged-out';
      cartAuthBanner.innerHTML = `
        <div>
          <strong style="color: var(--color-gold);">🔒 Login Required for ${orderModeLabel}</strong>
          <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">Please log in with your mobile OTP to place your order.</div>
        </div>
        <button type="button" class="auth-gate-login-btn" onclick="openAuthModal('otp')">Login / Sign Up 👤</button>
      `;
    }

    if (cartCheckoutBtnText) {
      cartCheckoutBtnText.textContent = `🔒 Login to Place ${orderModeLabel} Order`;
    }
  }
}

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

function proceedToCheckout() {
  if (AppState.cart.length === 0) {
    showToast('⚠️ Your cart is empty. Add dishes to proceed!');
    return;
  }

  const isDelivery = AppState.orderType === 'delivery';
  const orderModeLabel = isDelivery ? 'Delivery' : 'Pickup';

  // REQUIRE LOGIN FOR DELIVERY AND PICKUP ORDERS
  if (!AppState.currentUser) {
    showToast(`🔒 Please log in to complete your ${orderModeLabel} order!`);
    AppState.pendingAction = {
      type: 'checkout_order'
    };
    openAuthModal('otp');
    return;
  }
  
  const customerName = document.getElementById('order-customer-name')?.value.trim() || AppState.currentUser.name;
  const customerPhone = document.getElementById('order-customer-phone')?.value.trim() || AppState.currentUser.phone;

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

  const activeBranchObj = BRANCHES_DATA.find(b => b.id === AppState.selectedBranch) || BRANCHES_DATA[0];

  const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const packagingFee = 30;
  const exactKm = AppState.deliveryExactKm || AppState.deliveryDistanceKm || 2;
  // Delivery charge calculation: 2km <= 30rs, then ₹10/km
  const deliveryFee = isDelivery ? calculateDeliveryFee(exactKm) : 0;
  
  let discount = 0;
  if (AppState.appliedPromo === 'BUTTA10') {
    discount = Math.round(subtotal * 0.10);
  }

  const grandTotal = subtotal + packagingFee + deliveryFee - discount;
  
  // Format WhatsApp Order Message
  let message = `*🌿 SUBBAYYA GARI HOTEL - NEW ORDER*%0A`;
  message += `👤 *Customer Name:* ${encodeURIComponent(customerName)}%0A`;
  message += `📞 *Phone / WhatsApp:* ${encodeURIComponent(customerPhone)}%0A`;
  
  if (!isDelivery) {
    message += `📦 *Order Type:* 🥡 RESTAURANT PICKUP / TAKEAWAY%0A`;
    message += `🏢 *Pickup Outlet:* ${encodeURIComponent(activeBranchObj.name)}%0A`;
    message += `📍 *Outlet Address:* ${encodeURIComponent(activeBranchObj.address)}%0A`;
    message += `⏰ *Pickup Schedule:* ${encodeURIComponent(pickupSlot)}%0A`;
    if (vehicleNote) {
      message += `🚗 *Vehicle / Handover Note:* ${encodeURIComponent(vehicleNote)}%0A`;
    }
    message += `🛵 *Delivery Fee:* FREE (Self Pickup)%0A`;
  } else {
    message += `📦 *Order Type:* 🛵 HOME DELIVERY (${exactKm} km — ₹30 for ≤2km + ₹10/km)%0A`;
    message += `🏢 *Serving Branch:* ${encodeURIComponent(activeBranchObj.name)}%0A`;
    if (deliveryAddress) {
      message += `🏠 *Delivery Address:* ${encodeURIComponent(deliveryAddress)}%0A`;
    }
    if (deliveryLandmark) {
      message += `🚩 *Landmark:* ${encodeURIComponent(deliveryLandmark)}%0A`;
    }
    if (gpsMapUrl) {
      message += `📍 *Exact Google Maps Live Location:* ${encodeURIComponent(gpsMapUrl)}%0A`;
    }
    message += `🛵 *Delivery Charges:* ₹${deliveryFee} (${exactKm} km — ₹30 for ≤2km + ₹10/km)%0A`;
  }

  message += `%0A*📋 ORDER DETAILS:*%0A`;
  
  AppState.cart.forEach((item, idx) => {
    message += `${idx + 1}. ${item.name} x ${item.qty} = ₹${item.price * item.qty}%0A`;
  });

  message += `%0A*💰 Item Total:* ₹${subtotal}%0A`;
  message += `*🍃 Packaging (Banana Leaf & Butta):* ₹${packagingFee}%0A`;
  if (isDelivery) {
    message += `*🛵 Delivery Charges:* ₹${deliveryFee} (${exactKm} km)%0A`;
  }
  if (discount > 0) {
    message += `*🎉 Godavari Promo:* -₹${discount}%0A`;
  }
  message += `*⭐ Grand Total:* ₹${grandTotal}%0A%0A`;
  message += `_Packing: Authentic Traditional Banana Leaf & Eco Butta_%0A`;
  message += `_Thank you for ordering with Subbayya Gari Godavari Bhojanam!_`;

  const newOrderId = 'SGH-' + Math.floor(100000 + Math.random() * 900000);
  const orderItemsCopy = AppState.cart.map(i => ({
    id: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty,
    total: i.price * i.qty
  }));

  const orderPayload = {
    id: newOrderId,
    customerName: customerName,
    customerPhone: customerPhone,
    customerEmail: AppState.currentUser ? AppState.currentUser.email : '',
    orderType: AppState.orderType,
    branchId: activeBranchObj.id,
    branchName: activeBranchObj.name,
    branchAddress: activeBranchObj.address,
    items: orderItemsCopy,
    itemCount: orderItemsCopy.reduce((s, i) => s + i.qty, 0),
    subtotal: subtotal,
    packagingFee: packagingFee,
    deliveryFee: deliveryFee,
    discount: discount,
    grandTotal: grandTotal,
    deliveryAddress: deliveryAddress,
    deliveryLandmark: deliveryLandmark,
    gpsMapUrl: gpsMapUrl,
    pickupSlot: pickupSlot,
    vehicleNote: vehicleNote,
    paymentStatus: 'Paid Online / Verified'
  };

  // Asynchronously send to Server Orders Database
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  }).then(r => r.json()).then(resData => {
    console.log('[Order Sync] Saved successfully to backend database:', resData);
  }).catch(err => {
    console.warn('[Order Sync] Backend sync failed, kept locally:', err);
  });

  // Close Cart and show simulated live order ticket
  toggleCart(false);
  showOrderConfirmationModal(newOrderId, customerName, customerPhone, message, {
    orderType: AppState.orderType,
    branchName: activeBranchObj.name,
    branchAddress: activeBranchObj.address,
    pickupSlot: pickupSlot,
    vehicleNote: vehicleNote,
    address: deliveryAddress,
    landmark: deliveryLandmark,
    locationUrl: gpsMapUrl,
    items: orderItemsCopy,
    grandTotal: grandTotal
  });
}

function showOrderConfirmationModal(orderId, name, phone, whatsappMsg, details = {}) {
  const modal = document.getElementById('order-confirmation-modal');
  if (!modal) return;

  document.getElementById('conf-order-id').textContent = orderId;
  document.getElementById('conf-customer-name').textContent = name;
  document.getElementById('conf-branch').textContent = (details.branchName || AppState.selectedBranch).toUpperCase();
  document.getElementById('conf-total-items').textContent = (details.items ? details.items.reduce((s, i) => s + i.qty, 0) : AppState.cart.reduce((s, i) => s + i.qty, 0)) + ' Items';
  
  const orderTypeEl = document.getElementById('conf-order-type');
  if (orderTypeEl) {
    orderTypeEl.textContent = details.orderType === 'delivery' ? '🛵 Home Delivery' : '🥡 Restaurant Pickup';
  }

  const deliveryRow = document.getElementById('conf-delivery-row');
  const deliveryLoc = document.getElementById('conf-delivery-loc');
  if (deliveryRow && deliveryLoc) {
    if (details.orderType === 'delivery') {
      deliveryRow.style.display = 'block';
      let addrParts = [];
      if (details.address) addrParts.push(details.address);
      if (details.landmark) addrParts.push(`Landmark: ${details.landmark}`);
      if (details.locationUrl) {
        addrParts.push(`<a href="${details.locationUrl}" target="_blank" style="color: var(--color-gold); font-weight: 700; text-decoration: underline;">📍 View Live Location Pin ↗</a>`);
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
  if (waBtn) {
    waBtn.href = `https://api.whatsapp.com/send?phone=919010888842&text=${whatsappMsg}`;
  }

  modal.classList.add('active');
  
  // Clear cart
  AppState.cart = [];
  AppState.customerLocation = null;
  saveCart();
  renderMenuGrid();
}

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
      openAuthModal('otp');
      return;
    }

    const name = document.getElementById('res-name')?.value || AppState.currentUser.name;
    const phone = document.getElementById('res-phone')?.value || AppState.currentUser.phone;
    const branch = document.getElementById('res-branch')?.value || 'KPHB Colony, Hyderabad';
    const date = document.getElementById('res-date')?.value || '';
    const timeSlot = document.getElementById('res-time')?.value || '';
    const guests = document.getElementById('res-guests')?.value || '4';
    const notes = document.getElementById('res-notes')?.value || 'Standard Pure Veg Bhojanam';

    const bookingRef = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

    // Show Confirmation Ticket Modal
    document.getElementById('pass-booking-ref').textContent = bookingRef;
    document.getElementById('pass-guest-name').textContent = name;
    document.getElementById('pass-branch').textContent = branch;
    document.getElementById('pass-date-time').textContent = `${date} at ${timeSlot}`;
    document.getElementById('pass-guests-count').textContent = `${guests} Guests (${selectedSeating})`;
    document.getElementById('pass-notes').textContent = notes;

    const modal = document.getElementById('reservation-pass-modal');
    if (modal) modal.classList.add('active');

    showToast(`Table booked successfully for ${name}! 🎉`);
    form.reset();
    updateAuthUI();
  });
}

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

  // Close modals on overlay click or close button
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close-btn')) {
        modal.classList.remove('active');
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
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  if (!initialTab || initialTab === 'login' || !['otp', 'email', 'signup'].includes(initialTab)) {
    initialTab = 'otp';
  }
  switchAuthTab(initialTab);
  modal.classList.add('active');
}
window.openAuthModal = openAuthModal;

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}
window.closeAuthModal = closeAuthModal;

function switchAuthTab(tab) {
  if (!tab || tab === 'login' || !['otp', 'signup'].includes(tab)) {
    tab = 'otp';
  }

  const tabOtp = document.getElementById('auth-tab-otp');
  const tabSignup = document.getElementById('auth-tab-signup');
  const formOtp = document.getElementById('auth-form-otp');
  const formSignup = document.getElementById('auth-form-signup');

  // Reset tab button styles
  [tabOtp, tabSignup].forEach(t => {
    if (t) {
      t.style.background = 'transparent';
      t.style.color = 'var(--color-text-muted)';
      t.style.boxShadow = 'none';
      t.classList.remove('active');
    }
  });

  // Hide all forms
  if (formOtp) formOtp.style.display = 'none';
  if (formSignup) formSignup.style.display = 'none';

  if (tab === 'otp' && tabOtp && formOtp) {
    tabOtp.style.background = 'var(--color-surface)';
    tabOtp.style.color = 'var(--color-primary)';
    tabOtp.style.boxShadow = 'var(--shadow-xs)';
    tabOtp.classList.add('active');
    formOtp.style.display = 'flex';
    setTimeout(() => {
      const targetInput = document.getElementById('auth-otp-target');
      if (targetInput && targetInput.offsetParent !== null) targetInput.focus();
    }, 50);
  } else if (tab === 'signup' && tabSignup && formSignup) {
    tabSignup.style.background = 'var(--color-surface)';
    tabSignup.style.color = 'var(--color-primary)';
    tabSignup.style.boxShadow = 'var(--shadow-xs)';
    tabSignup.classList.add('active');
    formSignup.style.display = 'flex';
    setTimeout(() => {
      const regNameInput = document.getElementById('auth-reg-name');
      if (regNameInput && regNameInput.offsetParent !== null) regNameInput.focus();
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
    const res = await fetch(`/api/users/check?target=${encodeURIComponent(cleanTarget)}`);
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

async function sendLoginOtp() {
  const targetInput = document.getElementById('auth-otp-target') || document.getElementById('auth-otp-phone');
  const targetVal = targetInput ? targetInput.value.trim() : '';

  if (!targetVal) {
    showToast('⚠️ Please enter your email address');
    if (targetInput) targetInput.focus();
    return;
  }

  if (!targetVal.includes('@') || !targetVal.includes('.')) {
    showToast('⚠️ Please enter a valid email address (e.g. yourname@gmail.com)');
    if (targetInput) targetInput.focus();
    return;
  }

  activeOtpTarget = targetVal;
  const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
  activeGeneratedOtp = newOtp;

  // Show verify step with empty code input
  const sendStep = document.getElementById('auth-otp-send-step');
  const verifyStep = document.getElementById('auth-otp-verify-step');
  const displaySpan = document.getElementById('otp-target-display');
  const codeInput = document.getElementById('auth-otp-code');
  const sendBtn = document.getElementById('btn-send-otp');
  const resendBtn = document.getElementById('btn-resend-modal-otp');

  if (sendStep) sendStep.style.display = 'none';
  if (verifyStep) verifyStep.style.display = 'flex';
  if (displaySpan) displaySpan.textContent = targetVal;
  if (codeInput) {
    codeInput.value = ''; // Empty input: customer must enter code from Gmail
    codeInput.style.borderColor = '';
    codeInput.focus();
  }

  if (resendBtn) {
    resendBtn.style.pointerEvents = 'none';
    resendBtn.style.opacity = '0.6';
    resendBtn.textContent = 'Sending new OTP... ⏳';
    setTimeout(() => {
      resendBtn.style.pointerEvents = 'auto';
      resendBtn.style.opacity = '1';
      resendBtn.textContent = 'Resend OTP ✉️';
    }, 2000);
  }

  showToast(`✉️ Verification code sent to ${targetVal}! Please check your Gmail.`);

  // Background live dispatch to customer Gmail with exact synced OTP
  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetVal,
        name: targetVal.split('@')[0].replace(/[._]/g, ' '),
        otp: newOtp
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.otp) {
        activeGeneratedOtp = String(data.otp);
      }
      if (data && data.liveEmailSent) {
        showToast(`✉️ Live OTP delivered to ${targetVal}! Check your Gmail.`);
      } else {
        showToast(`🔑 Verification Code: ${activeGeneratedOtp}`);
      }
    }
  } catch (err) {
    console.warn('Background OTP dispatch error/timeout:', err.message);
  }
}
window.sendLoginOtp = sendLoginOtp;

function handleOtpSubmit(event) {
  if (event) event.preventDefault();
  const codeInput = document.getElementById('auth-otp-code');
  const code = codeInput ? codeInput.value.replace(/\D/g, '').trim() : '';

  if (!code || code.length < 4) {
    showToast('⚠️ Please enter the 4-digit verification code from your Gmail');
    if (codeInput) codeInput.focus();
    return;
  }

  // STRICT VALIDATION: If OTP was not generated or does not match, reject and block login
  if (!activeGeneratedOtp) {
    showToast(`⚠️ Please request an OTP first to receive your code from ${OTP_SENDER_EMAIL}`);
    return;
  }

  if (code !== activeGeneratedOtp) {
    showToast(`❌ Incorrect OTP! Please check your Gmail or click Resend OTP.`);
    if (codeInput) {
      codeInput.style.borderColor = '#EF4444';
      codeInput.focus();
    }
    return;
  }

  // Reset border if previously failed
  if (codeInput) codeInput.style.borderColor = '#16A34A';

  const email = activeOtpTarget;
  const rawName = email.split('@')[0].replace(/[._]/g, ' ');
  const guestName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Verified user session
  const user = {
    name: guestName || 'Valued Patron',
    phone: '9010888842',
    email: email,
    address: 'Road No. 4, KPHB Colony, Kukatpally, Hyderabad',
    coins: 50,
    tier: 'VIP Patron',
    memberSince: '2026',
    verifiedVia: `Email OTP from ${OTP_SENDER_EMAIL}`
  };

  loginUserSuccess(user, `🎉 Welcome to Subbayya Gari Hotel, ${user.name}! Verified from ${OTP_SENDER_EMAIL}.`);
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
    await fetch('/api/users/register', {
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
    localStorage.removeItem('sgh_user');
  } catch (e) {
    console.error('User save error:', e);
  }

  closeAuthModal();
  updateAuthUI();
  showToast(welcomeMsg);

  // Auto-fill checkout fields if cart is open
  autoFillCheckoutDetails();

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
  if (!AppState.currentUser) return;
  const nameInput = document.getElementById('order-customer-name');
  const phoneInput = document.getElementById('order-customer-phone');
  const addrInput = document.getElementById('order-delivery-address');

  if (nameInput && !nameInput.value) nameInput.value = AppState.currentUser.name;
  if (phoneInput && !phoneInput.value) phoneInput.value = AppState.currentUser.phone;
  if (addrInput && !addrInput.value && AppState.currentUser.address) addrInput.value = AppState.currentUser.address;
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
    const firstName = AppState.currentUser.name.split(' ')[0];
    const coins = AppState.currentUser.coins || 50;

    if (authBtnText) {
      authBtnText.textContent = `${firstName} (${coins} 🪙)`;
    }
    if (authHeaderBtn) {
      authHeaderBtn.href = 'javascript:void(0)';
      authHeaderBtn.onclick = (e) => {
        if (e) e.preventDefault();
        openProfileModal('account');
      };
      authHeaderBtn.title = 'View My Profile & Customer Details';
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

    // Show "My Orders" buttons only after customer has logged in
    const navMyOrders = document.getElementById('nav-item-my-orders');
    const btnHeaderMyOrders = document.getElementById('btn-header-my-orders');
    const mobileDrawerMyOrders = document.getElementById('mobile-drawer-my-orders');
    if (navMyOrders) navMyOrders.style.display = 'block';
    if (btnHeaderMyOrders) btnHeaderMyOrders.style.display = 'inline-flex';
    if (mobileDrawerMyOrders) mobileDrawerMyOrders.style.display = 'block';

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

    // Hide "My Orders" buttons before customer logs in
    const navMyOrders = document.getElementById('nav-item-my-orders');
    const btnHeaderMyOrders = document.getElementById('btn-header-my-orders');
    const mobileDrawerMyOrders = document.getElementById('mobile-drawer-my-orders');
    if (navMyOrders) navMyOrders.style.display = 'none';
    if (btnHeaderMyOrders) btnHeaderMyOrders.style.display = 'none';
    if (mobileDrawerMyOrders) mobileDrawerMyOrders.style.display = 'none';

    const dockLoginText = document.getElementById('dock-login-text');
    const dockLoginItem = document.getElementById('dock-item-login');
    if (dockLoginText) dockLoginText.textContent = 'Login';
    if (dockLoginItem) {
      dockLoginItem.href = 'login.html';
      dockLoginItem.onclick = null;
    }

    if (mobileAuthText) {
      mobileAuthText.textContent = 'Login / Guest Sign In';
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
          <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">Sign in via quick Mobile OTP or Email to reserve your banana leaf table.</div>
        </div>
        <button type="button" class="auth-gate-login-btn" onclick="openAuthModal('otp')">Login Now 👤</button>
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

  if (btnOrders) btnOrders.classList.remove('active');
  if (btnAccount) btnAccount.classList.remove('active');
  if (tabOrders) tabOrders.style.display = 'none';
  if (tabAccount) tabAccount.style.display = 'none';

  if (tab === 'account') {
    if (btnAccount) btnAccount.classList.add('active');
    if (tabAccount) tabAccount.style.display = 'block';
  } else {
    if (btnOrders) btnOrders.classList.add('active');
    if (tabOrders) tabOrders.style.display = 'block';
  }
}
window.switchProfileTab = switchProfileTab;

// Cache of fetched customer orders
let currentCustomerOrders = [];

// Fetch customer orders from API and render itemized cards
async function fetchAndRenderCustomerOrders() {
  const container = document.getElementById('prof-customer-orders-container');
  const badgeEl = document.getElementById('prof-orders-count-badge');
  if (!container) return;

  const user = AppState.currentUser;
  if (!user) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--color-text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔒</div>
        <p style="font-weight: 700; margin-bottom: 0.75rem;">Please log in to view your orders</p>
        <button class="btn btn-gold btn-sm" onclick="closeProfileModal(); openAuthModal('otp');">Sign In Now 🔑</button>
      </div>
    `;
    if (badgeEl) badgeEl.textContent = '0';
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 2rem 1rem; color: var(--color-text-muted);">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
      <div>Loading your feast orders...</div>
    </div>
  `;

  try {
    const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
    const email = user.email || '';
    
    // Fetch orders matching this user's phone or email
    let url = `/api/orders?phone=${encodeURIComponent(cleanPhone)}`;
    if (email && !email.endsWith('@subbayyagari.in')) {
      url += `&email=${encodeURIComponent(email)}`;
    }

    let orders = [];
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.orders) {
        orders = data.orders;
      }
    }

    // Fallback: If no orders match the specific phone or API is local-only, check all orders in API
    if (orders.length === 0) {
      const allRes = await fetch('/api/orders');
      if (allRes.ok) {
        const allData = await allRes.json();
        if (allData && allData.orders) {
          // If demo user or matching phone
          orders = allData.orders.filter(o => {
            const p = (o.customerPhone || '').replace(/\D/g, '').slice(-10);
            return p === cleanPhone || (o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase());
          });
          // If still empty and it's a demo/test session, show the active store orders as reference
          if (orders.length === 0 && allData.orders.length > 0) {
            orders = allData.orders;
          }
        }
      }
    }

    currentCustomerOrders = orders;
    if (badgeEl) badgeEl.textContent = orders.length;

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
      if (s === 'delivered') {
        statusClass = 'cust-status-delivered';
        statusIcon = '✅';
      } else if (s === 'out for delivery' || s === 'ready') {
        statusClass = 'cust-status-out';
        statusIcon = '🛵';
      } else if (s === 'received') {
        statusClass = 'cust-status-received';
        statusIcon = '📥';
      }

      const formattedDate = ord.createdAt 
        ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recent Order';

      const isDelivery = ord.orderType === 'delivery';

      // Build Items List HTML
      const itemsListHtml = (ord.items || []).map(item => `
        <div class="cust-order-item-row">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="color: #16A34A; font-size: 0.75rem;">🟢</span>
            <span style="font-weight: 600; color: var(--color-text);">${item.name || 'Bhojanam Specialty'}</span>
            <span style="background: rgba(15, 90, 39, 0.08); color: var(--color-primary); font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 0.72rem;">x${item.qty || 1}</span>
          </div>
          <div style="font-weight: 700; color: var(--color-primary);">
            ₹${(item.price || 0) * (item.qty || 1)}
          </div>
        </div>
      `).join('');

      return `
        <div class="cust-order-card">
          <!-- Header -->
          <div class="cust-order-header">
            <div>
              <div class="cust-order-id">#${ord.id}</div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">📅 ${formattedDate}</div>
            </div>
            <span class="cust-status-badge ${statusClass}">
              <span>${statusIcon}</span>
              <span>${ord.status || 'Received'}</span>
            </span>
          </div>

          <!-- Order Type & Branch Destination -->
          <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 0.65rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong>${isDelivery ? '🛵 Home Delivery' : '🥡 Takeaway / Curbside'}</strong>
              <span style="color: var(--color-border-hover);"> • </span>
              <span>${ord.branchName || 'KPHB Colony, Hyderabad'}</span>
            </div>
            <span style="color: var(--color-gold); font-weight: 700; font-size: 0.74rem;">${ord.paymentStatus || 'Paid Online'}</span>
          </div>

          <!-- What are ordered: Itemized Breakdown -->
          <div class="cust-order-items-box">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-gold); text-transform: uppercase; margin-bottom: 0.35rem; letter-spacing: 0.04em;">
              🍽️ Dishes Ordered (${ord.itemCount || (ord.items ? ord.items.length : 0)} items)
            </div>
            ${itemsListHtml || '<div style="font-size: 0.78rem; color: var(--color-text-muted);">Royal Butta Feast Selection</div>'}
          </div>

          <!-- Address or Pickup Note if available -->
          ${ord.deliveryAddress ? `
            <div style="font-size: 0.74rem; color: var(--color-text-muted); background: rgba(0,0,0,0.02); padding: 0.4rem 0.6rem; border-radius: 4px; margin-bottom: 0.65rem;">
              🏠 <strong>Address:</strong> ${ord.deliveryAddress}
            </div>
          ` : ''}

          ${ord.pickupSlot ? `
            <div style="font-size: 0.74rem; color: #16A34A; font-weight: 600; margin-bottom: 0.65rem;">
              ⏰ <strong>Pickup Time:</strong> ${ord.pickupSlot}
            </div>
          ` : ''}

          <!-- Order Total & Actions -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--color-border); padding-top: 0.75rem; margin-top: 0.4rem;">
            <div>
              <span style="font-size: 0.72rem; color: var(--color-text-muted);">Grand Total:</span>
              <span style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary); margin-left: 0.25rem;">₹${ord.grandTotal || ord.subtotal || 0}</span>
            </div>
            <div style="display: flex; gap: 0.4rem;">
              <button type="button" class="btn btn-outline btn-sm" onclick="reorderCustomerItems('${ord.id}')" style="font-size: 0.74rem; padding: 0.3rem 0.65rem; border-color: var(--color-gold); color: var(--color-gold);">
                🔄 Reorder
              </button>
              <a href="https://api.whatsapp.com/send?phone=919010888842&text=${encodeURIComponent('Hi Subbayya Gari Hotel, checking live status for my order #' + ord.id)}" target="_blank" class="btn btn-outline btn-sm" style="font-size: 0.74rem; padding: 0.3rem 0.65rem; color: #16A34A; border-color: #16A34A;">
                💬 Track
              </a>
            </div>
          </div>

        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error fetching customer orders:', err);
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: var(--color-spice);">
        <p>⚠️ Unable to sync orders right now. Please try again.</p>
        <button class="btn btn-outline btn-sm" onclick="fetchAndRenderCustomerOrders()">Retry 🔄</button>
      </div>
    `;
  }
}
window.fetchAndRenderCustomerOrders = fetchAndRenderCustomerOrders;

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
  if (detailTierEl) detailTierEl.textContent = user.tier || '👑 VIP Member';
  if (detailSinceEl) detailSinceEl.textContent = user.memberSince || '2026';

  switchProfileTab(initialTab);
  modal.classList.add('active');

  // Load orders immediately so data is ready when toggled
  fetchAndRenderCustomerOrders();
}
window.openProfileModal = openProfileModal;

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.remove('active');
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
  ['auth-modal', 'profile-modal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      closeProfileModal();
    }
  });
});


